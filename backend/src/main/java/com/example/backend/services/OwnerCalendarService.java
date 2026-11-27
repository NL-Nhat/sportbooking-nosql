package com.example.backend.services;

import com.example.backend.dtos.booking.OwnerCalendarResponseDto;
import com.example.backend.dtos.booking.OwnerCalendarResponseDto.CalendarSlotDto;
import com.example.backend.dtos.booking.OwnerCalendarResponseDto.CourtCalendarLaneDto;
import com.example.backend.exceptions.AppException;
import com.example.backend.models.BlockedSlot;
import com.example.backend.models.Booking;
import com.example.backend.models.BookingSlot;
import com.example.backend.models.Court;
import com.example.backend.models.Facility;
import com.example.backend.models.OperatingHours;
import com.example.backend.models.PriceRule;
import com.example.backend.models.SportsCategory;
import com.example.backend.models.User;
import com.example.backend.models.embedded.TimeSlot;
import com.example.backend.repositories.BlockedSlotRepository;
import com.example.backend.repositories.BookingRepository;
import com.example.backend.repositories.BookingSlotRepository;
import com.example.backend.repositories.CourtRepository;
import com.example.backend.repositories.FacilityRepository;
import com.example.backend.repositories.OperatingHoursRepository;
import com.example.backend.repositories.PriceRuleRepository;
import com.example.backend.repositories.SportsCategoryRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OwnerCalendarService {

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final BigDecimal DEFAULT_PRICE_PER_SLOT = BigDecimal.valueOf(100000);

    private final FacilityRepository facilityRepository;
    private final CourtRepository courtRepository;
    private final SportsCategoryRepository sportsCategoryRepository;
    private final OperatingHoursRepository operatingHoursRepository;
    private final PriceRuleRepository priceRuleRepository;
    private final BlockedSlotRepository blockedSlotRepository;
    private final BookingSlotRepository bookingSlotRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OwnerCalendarResponseDto getOwnerCalendar(
            String authorizationHeader,
            String facilityId,
            String dateStr
    ) {
        User owner = authenticateOwner(authorizationHeader);

        String targetDateStr = dateStr != null && !dateStr.trim().isEmpty()
                ? dateStr.trim()
                : LocalDate.now(DEFAULT_ZONE).toString();

        LocalDate targetDate;
        try {
            targetDate = LocalDate.parse(targetDateStr);
        } catch (DateTimeParseException ex) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_DATE_FORMAT",
                    "Ngày xem lịch biểu (date) phải có định dạng yyyy-MM-dd"
            );
        }

        List<Facility> ownedFacilities = facilityRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId());
        if (ownedFacilities.isEmpty()) {
            return OwnerCalendarResponseDto.builder()
                    .date(targetDateStr)
                    .facilityId(facilityId)
                    .courts(Collections.emptyList())
                    .build();
        }

        Map<String, Facility> facilitiesById = new HashMap<>();
        for (Facility facility : ownedFacilities) {
            if (facility.getId() != null) {
                facilitiesById.put(facility.getId(), facility);
            }
        }

        String normalizedFacilityId = facilityId != null ? facilityId.trim() : "";
        Set<String> targetFacilityIds;
        if (!normalizedFacilityId.isEmpty()) {
            if (!facilitiesById.containsKey(normalizedFacilityId)) {
                throw new AppException(
                        HttpStatus.NOT_FOUND,
                        "FACILITY_NOT_FOUND",
                        "Không tìm thấy cơ sở thể thao thuộc quyền sở hữu của bạn"
                );
            }
            targetFacilityIds = Collections.singleton(normalizedFacilityId);
        } else {
            targetFacilityIds = facilitiesById.keySet();
        }

        List<Court> courts = courtRepository.findByFacilityIdIn(targetFacilityIds);
        if (courts.isEmpty()) {
            return OwnerCalendarResponseDto.builder()
                    .date(targetDateStr)
                    .facilityId(normalizedFacilityId.isEmpty() ? null : normalizedFacilityId)
                    .courts(Collections.emptyList())
                    .build();
        }

        Set<String> courtIds = new LinkedHashSet<>();
        Set<String> categoryIds = new LinkedHashSet<>();
        for (Court court : courts) {
            if (court.getId() != null) {
                courtIds.add(court.getId());
            }
            if (court.getCategoryId() != null) {
                categoryIds.add(court.getCategoryId());
            }
        }

        Map<String, SportsCategory> categoriesById = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            for (SportsCategory category : sportsCategoryRepository.findAllById(categoryIds)) {
                if (category.getId() != null) {
                    categoriesById.put(category.getId(), category);
                }
            }
        }

        Map<String, OperatingHours> operatingHoursByCourtId = new HashMap<>();
        for (OperatingHours op : operatingHoursRepository.findByCourtIdIn(courtIds)) {
            if (op.getCourtId() != null) {
                operatingHoursByCourtId.put(op.getCourtId(), op);
            }
        }

        Map<String, List<PriceRule>> priceRulesByCourtId = new HashMap<>();
        for (PriceRule rule : priceRuleRepository.findByCourtIdInOrderByPriorityDesc(courtIds)) {
            if (rule.getCourtId() != null && "ACTIVE".equalsIgnoreCase(rule.getStatus())) {
                priceRulesByCourtId
                        .computeIfAbsent(rule.getCourtId(), k -> new ArrayList<>())
                        .add(rule);
            }
        }

        Instant dayStart = targetDate.atStartOfDay(DEFAULT_ZONE).toInstant();
        Instant dayEnd = targetDate.plusDays(1).atStartOfDay(DEFAULT_ZONE).toInstant();

        Map<String, List<BlockedSlot>> blockedByCourtId = new HashMap<>();
        for (BlockedSlot blocked : blockedSlotRepository.findByCourtIdInOrderByStartAtDesc(courtIds)) {
            if (blocked.getCourtId() != null
                    && blocked.getStartAt() != null
                    && blocked.getEndAt() != null
                    && blocked.getStartAt().isBefore(dayEnd)
                    && blocked.getEndAt().isAfter(dayStart)) {
                blockedByCourtId
                        .computeIfAbsent(blocked.getCourtId(), k -> new ArrayList<>())
                        .add(blocked);
            }
        }

        List<BookingSlot> occupiedSlots = bookingSlotRepository.findByCourtIdInAndSlotDateAndStatusIn(
                courtIds,
                targetDateStr,
                List.of("HOLD", "BOOKED")
        );

        Map<String, List<BookingSlot>> occupiedByCourtId = new HashMap<>();
        Set<String> bookingIds = new LinkedHashSet<>();
        Instant now = Instant.now();

        for (BookingSlot slot : occupiedSlots) {
            if ("HOLD".equalsIgnoreCase(slot.getStatus())
                    && slot.getExpiresAt() != null
                    && !slot.getExpiresAt().isAfter(now)) {
                continue;
            }
            if (slot.getCourtId() != null) {
                occupiedByCourtId
                        .computeIfAbsent(slot.getCourtId(), k -> new ArrayList<>())
                        .add(slot);
            }
            if (slot.getBookingId() != null) {
                bookingIds.add(slot.getBookingId());
            }
        }

        Map<String, Booking> bookingsById = new HashMap<>();
        Set<String> customerIds = new LinkedHashSet<>();
        if (!bookingIds.isEmpty()) {
            for (Booking booking : bookingRepository.findAllById(bookingIds)) {
                if (booking.getId() != null) {
                    bookingsById.put(booking.getId(), booking);
                }
                if (booking.getCustomerId() != null) {
                    customerIds.add(booking.getCustomerId());
                }
            }
        }

        Map<String, User> customersById = new HashMap<>();
        if (!customerIds.isEmpty()) {
            for (User customer : userRepository.findAllById(customerIds)) {
                if (customer.getId() != null) {
                    customersById.put(customer.getId(), customer);
                }
            }
        }

        int isoDayOfWeek = targetDate.getDayOfWeek().getValue(); // 1 (Mon) .. 7 (Sun)
        List<CourtCalendarLaneDto> lanes = new ArrayList<>(courts.size());

        for (Court court : courts) {
            Facility facility = facilitiesById.get(court.getFacilityId());
            SportsCategory category = categoriesById.get(court.getCategoryId());
            OperatingHours op = operatingHoursByCourtId.get(court.getId());

            List<CalendarSlotDto> calendarSlots = buildCourtSlotsForDate(
                    court,
                    op,
                    targetDate,
                    targetDateStr,
                    isoDayOfWeek,
                    priceRulesByCourtId.getOrDefault(court.getId(), Collections.emptyList()),
                    blockedByCourtId.getOrDefault(court.getId(), Collections.emptyList()),
                    occupiedByCourtId.getOrDefault(court.getId(), Collections.emptyList()),
                    bookingsById,
                    customersById
            );

            lanes.add(CourtCalendarLaneDto.builder()
                    .courtId(court.getId())
                    .mongoId(court.getId())
                    .courtName(court.getName())
                    .courtStatus(court.getStatus())
                    .facilityId(court.getFacilityId())
                    .facilityName(facility != null ? facility.getName() : null)
                    .categoryId(court.getCategoryId())
                    .categoryName(category != null ? category.getName() : null)
                    .attributes(court.getAttributes())
                    .slots(calendarSlots)
                    .build());
        }

        return OwnerCalendarResponseDto.builder()
                .date(targetDateStr)
                .facilityId(normalizedFacilityId.isEmpty() ? null : normalizedFacilityId)
                .courts(lanes)
                .build();
    }

    private List<CalendarSlotDto> buildCourtSlotsForDate(
            Court court,
            OperatingHours op,
            LocalDate targetDate,
            String targetDateStr,
            int isoDayOfWeek,
            List<PriceRule> courtRules,
            List<BlockedSlot> courtBlocked,
            List<BookingSlot> courtOccupied,
            Map<String, Booking> bookingsById,
            Map<String, User> customersById
    ) {
        if (op == null || op.getTimeSlots() == null || op.getTimeSlots().isEmpty()) {
            return Collections.emptyList();
        }
        if (op.getEffectiveFrom() != null && !op.getEffectiveFrom().isEmpty()
                && targetDateStr.compareTo(op.getEffectiveFrom()) < 0) {
            return Collections.emptyList();
        }
        if (op.getEffectiveTo() != null && !op.getEffectiveTo().isEmpty()
                && targetDateStr.compareTo(op.getEffectiveTo()) > 0) {
            return Collections.emptyList();
        }

        List<TimeSlot> sortedTimeSlots = new ArrayList<>(op.getTimeSlots());
        sortedTimeSlots.sort(Comparator.comparing(s -> s.getStartTime() != null ? s.getStartTime() : ""));

        // Lọc các price rule hợp lệ cho ngày targetDateStr, ưu tiên specificDates > daysOfWeek và theo priority
        List<PriceRule> applicableRules = new ArrayList<>();
        for (PriceRule rule : courtRules) {
            if (rule.getValidFrom() != null && !rule.getValidFrom().isEmpty()
                    && targetDateStr.compareTo(rule.getValidFrom()) < 0) {
                continue;
            }
            if (rule.getValidTo() != null && !rule.getValidTo().isEmpty()
                    && targetDateStr.compareTo(rule.getValidTo()) > 0) {
                continue;
            }
            boolean matchSpecific = rule.getSpecificDates() != null && rule.getSpecificDates().contains(targetDateStr);
            boolean matchDay = rule.getDaysOfWeek() != null && rule.getDaysOfWeek().contains(isoDayOfWeek);
            if (matchSpecific || matchDay) {
                applicableRules.add(rule);
            }
        }
        applicableRules.sort((a, b) -> {
            int aSpec = (a.getSpecificDates() != null && a.getSpecificDates().contains(targetDateStr)) ? 10000 : 0;
            int bSpec = (b.getSpecificDates() != null && b.getSpecificDates().contains(targetDateStr)) ? 10000 : 0;
            int aScore = aSpec + (a.getPriority() != null ? a.getPriority() : 0);
            int bScore = bSpec + (b.getPriority() != null ? b.getPriority() : 0);
            return Integer.compare(bScore, aScore);
        });

        List<CalendarSlotDto> slots = new ArrayList<>(sortedTimeSlots.size());

        for (TimeSlot timeSlot : sortedTimeSlots) {
            if (timeSlot == null || timeSlot.getStartTime() == null || timeSlot.getEndTime() == null) {
                continue;
            }
            String startStr = timeSlot.getStartTime().trim();
            String endStr = timeSlot.getEndTime().trim();

            Instant slotStartAt;
            Instant slotEndAt;
            try {
                LocalTime startLocal = LocalTime.parse(startStr);
                LocalTime endLocal = LocalTime.parse(endStr);
                if (!startLocal.isBefore(endLocal)) {
                    continue;
                }
                slotStartAt = targetDate.atTime(startLocal).atZone(DEFAULT_ZONE).toInstant();
                slotEndAt = targetDate.atTime(endLocal).atZone(DEFAULT_ZONE).toInstant();
            } catch (DateTimeParseException ex) {
                continue;
            }

            BigDecimal price = DEFAULT_PRICE_PER_SLOT;
            for (PriceRule rule : applicableRules) {
                if (rule.getStartTime() != null && rule.getEndTime() != null
                        && startStr.compareTo(rule.getStartTime()) >= 0
                        && startStr.compareTo(rule.getEndTime()) < 0) {
                    if (rule.getPricePerSlot() != null) {
                        price = rule.getPricePerSlot();
                    }
                    break;
                }
            }

            String status = "AVAILABLE";
            String reason = null;
            String bookingId = null;
            String bookingCode = null;
            String customerName = null;
            String customerPhone = null;
            String paymentStatus = null;
            Instant holdExpiresAt = null;

            // Nếu sân đang ở trạng thái MAINTENANCE hoặc INACTIVE thì hiển thị BLOCKED
            if ("MAINTENANCE".equalsIgnoreCase(court.getStatus())) {
                status = "BLOCKED";
                reason = "Sân đang trong trạng thái Bảo trì";
            } else if ("INACTIVE".equalsIgnoreCase(court.getStatus())) {
                status = "BLOCKED";
                reason = "Sân đang tạm ngưng hoạt động";
            }

            // 1. Kiểm tra lịch chặn sân (blocked_slots)
            if ("AVAILABLE".equals(status)) {
                for (BlockedSlot blocked : courtBlocked) {
                    if (slotStartAt.isBefore(blocked.getEndAt()) && slotEndAt.isAfter(blocked.getStartAt())) {
                        status = "BLOCKED";
                        reason = blocked.getReason() != null ? blocked.getReason() : "Sân tạm khóa / bảo trì";
                        break;
                    }
                }
            }

            // 2. Kiểm tra ca đặt sân / giữ chỗ (booking_slots)
            for (BookingSlot occ : courtOccupied) {
                if (occ.getStartAt() != null && occ.getEndAt() != null
                        && slotStartAt.isBefore(occ.getEndAt())
                        && slotEndAt.isAfter(occ.getStartAt())) {
                    Booking booking = occ.getBookingId() != null ? bookingsById.get(occ.getBookingId()) : null;
                    User customer = (booking != null && booking.getCustomerId() != null)
                            ? customersById.get(booking.getCustomerId())
                            : null;

                    bookingId = occ.getBookingId();
                    bookingCode = booking != null ? booking.getBookingCode() : null;
                    customerName = customer != null ? customer.getFullName() : "Khách hàng";
                    customerPhone = customer != null ? customer.getPhone() : null;
                    paymentStatus = booking != null ? booking.getPaymentStatus() : null;
                    holdExpiresAt = occ.getExpiresAt();

                    if ("BOOKED".equalsIgnoreCase(occ.getStatus())) {
                        status = "BOOKED";
                        reason = "Đã đặt" + (bookingCode != null ? " (" + bookingCode + ")" : "");
                    } else if ("HOLD".equalsIgnoreCase(occ.getStatus())) {
                        status = "HOLD";
                        reason = "Đang giữ chỗ" + (bookingCode != null ? " (" + bookingCode + ")" : "");
                    }
                    break;
                }
            }

            slots.add(CalendarSlotDto.builder()
                    .id(targetDateStr + "_" + startStr)
                    .startTime(startStr)
                    .endTime(endStr)
                    .startAt(slotStartAt)
                    .endAt(slotEndAt)
                    .price(price)
                    .status(status)
                    .reason(reason)
                    .bookingId(bookingId)
                    .bookingCode(bookingCode)
                    .customerName(customerName)
                    .customerPhone(customerPhone)
                    .paymentStatus(paymentStatus)
                    .holdExpiresAt(holdExpiresAt)
                    .build());
        }

        return slots;
    }

    private User authenticateOwner(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new AppException(
                    HttpStatus.UNAUTHORIZED,
                    "UNAUTHORIZED",
                    "Vui lòng đăng nhập để tiếp tục"
            );
        }

        String accessToken = authorizationHeader.substring(7).trim();
        String userId = jwtUtil.extractUserId(accessToken);
        if (userId == null || userId.isBlank()) {
            throw new AppException(
                    HttpStatus.UNAUTHORIZED,
                    "INVALID_ACCESS_TOKEN",
                    "Access token không hợp lệ hoặc đã hết hạn"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.UNAUTHORIZED,
                        "USER_NOT_FOUND",
                        "Không tìm thấy thông tin tài khoản"
                ));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new AppException(
                    HttpStatus.FORBIDDEN,
                    "ACCOUNT_NOT_ACTIVE",
                    "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động"
            );
        }

        List<String> roles = user.getRoles() != null ? user.getRoles() : Collections.emptyList();
        if (!roles.contains("OWNER")) {
            throw new AppException(
                    HttpStatus.FORBIDDEN,
                    "FORBIDDEN_OWNER_ONLY",
                    "Bạn không có quyền Chủ sân (OWNER) để truy cập tài nguyên này"
            );
        }

        return user;
    }
}
