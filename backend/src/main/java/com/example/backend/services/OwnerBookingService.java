package com.example.backend.services;

import com.example.backend.dtos.booking.OwnerBookingDto;
import com.example.backend.exceptions.AppException;
import com.example.backend.models.Booking;
import com.example.backend.models.BookingSlot;
import com.example.backend.models.Court;
import com.example.backend.models.Facility;
import com.example.backend.models.Payment;
import com.example.backend.models.User;
import com.example.backend.models.embedded.BookingItem;
import com.example.backend.models.embedded.PriceDetails;
import com.example.backend.repositories.BookingRepository;
import com.example.backend.repositories.BookingSlotRepository;
import com.example.backend.repositories.CourtRepository;
import com.example.backend.repositories.FacilityRepository;
import com.example.backend.repositories.PaymentRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerBookingService {

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter HH_MM_FORMATTER = DateTimeFormatter.ofPattern("HH:mm").withZone(DEFAULT_ZONE);

    private final BookingRepository bookingRepository;
    private final BookingSlotRepository bookingSlotRepository;
    private final PaymentRepository paymentRepository;
    private final CourtRepository courtRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public List<OwnerBookingDto> getOwnerBookings(
            String authorizationHeader,
            String facilityId,
            String courtId,
            String bookingDate,
            String status,
            String paymentStatus,
            String keyword
    ) {
        User owner = authenticateOwner(authorizationHeader);

        List<Facility> ownedFacilities = facilityRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId());
        if (ownedFacilities.isEmpty()) {
            return Collections.emptyList();
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

        List<Booking> bookings = bookingRepository.findByFacilityIdInOrderByCreatedAtDesc(targetFacilityIds);
        if (bookings.isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedCourtId = courtId != null ? courtId.trim() : "";
        if (!normalizedCourtId.isEmpty()) {
            bookings = bookings.stream()
                    .filter(b -> normalizedCourtId.equals(b.getCourtId()))
                    .collect(Collectors.toList());
        }

        String normalizedDate = bookingDate != null ? bookingDate.trim() : "";
        if (!normalizedDate.isEmpty()) {
            bookings = bookings.stream()
                    .filter(b -> matchesBookingDate(b, normalizedDate))
                    .collect(Collectors.toList());
        }

        String normalizedStatus = status != null ? status.trim().toUpperCase(Locale.ROOT) : "";
        if (!normalizedStatus.isEmpty() && !"ALL".equals(normalizedStatus)) {
            bookings = bookings.stream()
                    .filter(b -> b.getStatus() != null && normalizedStatus.equalsIgnoreCase(b.getStatus()))
                    .collect(Collectors.toList());
        }

        String normalizedPaymentStatus = paymentStatus != null ? paymentStatus.trim().toUpperCase(Locale.ROOT) : "";
        if (!normalizedPaymentStatus.isEmpty() && !"ALL".equals(normalizedPaymentStatus)) {
            bookings = bookings.stream()
                    .filter(b -> b.getPaymentStatus() != null && normalizedPaymentStatus.equalsIgnoreCase(b.getPaymentStatus()))
                    .collect(Collectors.toList());
        }

        if (bookings.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> customerIds = new LinkedHashSet<>();
        Set<String> courtIds = new LinkedHashSet<>();
        List<String> bookingIds = new ArrayList<>(bookings.size());

        for (Booking booking : bookings) {
            if (booking.getId() != null) {
                bookingIds.add(booking.getId());
            }
            if (booking.getCustomerId() != null) {
                customerIds.add(booking.getCustomerId());
            }
            if (booking.getCourtId() != null) {
                courtIds.add(booking.getCourtId());
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

        Map<String, Court> courtsById = new HashMap<>();
        if (!courtIds.isEmpty()) {
            for (Court court : courtRepository.findAllById(courtIds)) {
                if (court.getId() != null) {
                    courtsById.put(court.getId(), court);
                }
            }
        }

        Map<String, List<Payment>> paymentsByBookingId = new HashMap<>();
        if (!bookingIds.isEmpty()) {
            List<Payment> allPayments = paymentRepository.findByBookingIdInOrderByCreatedAtDesc(bookingIds);
            for (Payment payment : allPayments) {
                if (payment.getBookingId() != null) {
                    paymentsByBookingId
                            .computeIfAbsent(payment.getBookingId(), k -> new ArrayList<>())
                            .add(payment);
                }
            }
        }

        String normalizedKeyword = keyword != null ? keyword.trim().toLowerCase(Locale.ROOT) : "";
        List<OwnerBookingDto> result = new ArrayList<>();

        for (Booking booking : bookings) {
            User customer = customersById.get(booking.getCustomerId());
            Court court = courtsById.get(booking.getCourtId());
            Facility facility = facilitiesById.get(booking.getFacilityId());

            if (!normalizedKeyword.isEmpty() && !matchesKeyword(booking, customer, court, normalizedKeyword)) {
                continue;
            }

            List<Payment> payments = paymentsByBookingId.getOrDefault(booking.getId(), Collections.emptyList());
            result.add(toDto(booking, customer, facility, court, payments));
        }

        return result;
    }

    public OwnerBookingDto getOwnerBookingDetail(
            String authorizationHeader,
            String bookingId
    ) {
        User owner = authenticateOwner(authorizationHeader);
        Booking booking = findOwnedBookingOrThrow(owner.getId(), bookingId);

        User customer = booking.getCustomerId() != null
                ? userRepository.findById(booking.getCustomerId()).orElse(null)
                : null;
        Facility facility = booking.getFacilityId() != null
                ? facilityRepository.findById(booking.getFacilityId()).orElse(null)
                : null;
        Court court = booking.getCourtId() != null
                ? courtRepository.findById(booking.getCourtId()).orElse(null)
                : null;
        List<Payment> payments = paymentRepository.findByBookingIdOrderByCreatedAtDesc(booking.getId());

        return toDto(booking, customer, facility, court, payments);
    }

    public OwnerBookingDto collectRemainingPayment(
            String authorizationHeader,
            String bookingId,
            String paymentMethod
    ) {
        User owner = authenticateOwner(authorizationHeader);
        Booking booking = findOwnedBookingOrThrow(owner.getId(), bookingId);

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus()) || "EXPIRED".equalsIgnoreCase(booking.getStatus())) {
            throw new AppException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "BOOKING_NOT_ACTIVE",
                    "Không thể thu tiền còn lại cho đơn đặt sân đã hủy hoặc đã hết hạn"
            );
        }

        if ("PAID".equalsIgnoreCase(booking.getPaymentStatus())) {
            throw new AppException(
                    HttpStatus.CONFLICT,
                    "BOOKING_ALREADY_PAID",
                    "Đơn đặt sân này đã được thanh toán đủ 100%"
            );
        }

        PriceDetails priceDetails = booking.getPriceDetails();
        if (priceDetails == null) {
            throw new AppException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "MISSING_PRICE_DETAILS",
                    "Đơn đặt sân không có thông tin chi tiết giá"
            );
        }

        BigDecimal totalAmount = priceDetails.getOriginalAmount() != null
                ? priceDetails.getOriginalAmount()
                : BigDecimal.ZERO;
        BigDecimal paidAmount = priceDetails.getPaidAmount() != null
                ? priceDetails.getPaidAmount()
                : BigDecimal.ZERO;
        BigDecimal remainingAmount = priceDetails.getRemainingAmount() != null
                ? priceDetails.getRemainingAmount()
                : totalAmount.subtract(paidAmount);

        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(
                    HttpStatus.CONFLICT,
                    "NO_REMAINING_AMOUNT",
                    "Đơn đặt sân không còn khoản tiền nào cần thu thêm"
            );
        }

        String normalizedMethod = paymentMethod != null && !paymentMethod.trim().isEmpty()
                ? paymentMethod.trim().toUpperCase(Locale.ROOT)
                : "CASH";
        if (!Set.of("CASH", "BANK_TRANSFER", "ONLINE").contains(normalizedMethod)) {
            normalizedMethod = "CASH";
        }

        Instant now = Instant.now();
        String txnSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
        Payment remainingPayment = Payment.builder()
                .bookingId(booking.getId())
                .customerId(booking.getCustomerId())
                .paymentType("REMAINING")
                .amount(remainingAmount)
                .currency(priceDetails.getCurrency() != null ? priceDetails.getCurrency() : "VND")
                .method(normalizedMethod)
                .provider("AT_VENUE")
                .transactionCode("CASH-" + txnSuffix)
                .providerEventId("venue_" + now.toEpochMilli())
                .status("PAID")
                .paidAt(now)
                .createdAt(now)
                .updatedAt(now)
                .build();

        paymentRepository.save(remainingPayment);

        priceDetails.setPaidAmount(totalAmount);
        priceDetails.setRemainingAmount(BigDecimal.ZERO);
        booking.setPriceDetails(priceDetails);
        booking.setPaymentStatus("PAID");
        if ("PENDING_PAYMENT".equalsIgnoreCase(booking.getStatus())) {
            booking.setStatus("CONFIRMED");
            booking.setHoldExpiresAt(null);
        }
        booking.setUpdatedAt(now);

        Booking savedBooking = bookingRepository.save(booking);

        // Chuyển các booking_slots đang HOLD sang BOOKED nếu cần
        List<BookingSlot> slots = bookingSlotRepository.findByBookingId(savedBooking.getId());
        List<BookingSlot> slotsToUpdate = new ArrayList<>();
        for (BookingSlot slot : slots) {
            if ("HOLD".equalsIgnoreCase(slot.getStatus())) {
                slot.setStatus("BOOKED");
                slot.setExpiresAt(null);
                slot.setUpdatedAt(now);
                slotsToUpdate.add(slot);
            }
        }
        if (!slotsToUpdate.isEmpty()) {
            bookingSlotRepository.saveAll(slotsToUpdate);
        }

        return getOwnerBookingDetail(authorizationHeader, savedBooking.getId());
    }

    public OwnerBookingDto completeBooking(
            String authorizationHeader,
            String bookingId
    ) {
        User owner = authenticateOwner(authorizationHeader);
        Booking booking = findOwnedBookingOrThrow(owner.getId(), bookingId);

        if ("COMPLETED".equalsIgnoreCase(booking.getStatus())) {
            throw new AppException(
                    HttpStatus.CONFLICT,
                    "BOOKING_ALREADY_COMPLETED",
                    "Đơn đặt sân này đã được đánh dấu hoàn thành trước đó"
            );
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus()) || "EXPIRED".equalsIgnoreCase(booking.getStatus())) {
            throw new AppException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "BOOKING_NOT_ACTIVE",
                    "Không thể đánh dấu hoàn thành cho đơn đặt sân đã hủy hoặc đã hết hạn"
            );
        }

        Instant now = Instant.now();
        booking.setStatus("COMPLETED");
        booking.setCompletedAt(now);
        booking.setUpdatedAt(now);

        Booking saved = bookingRepository.save(booking);
        return getOwnerBookingDetail(authorizationHeader, saved.getId());
    }

    private Booking findOwnedBookingOrThrow(String ownerId, String bookingId) {
        if (bookingId == null || bookingId.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_BOOKING_ID", "Mã đơn đặt sân không hợp lệ");
        }

        Booking booking = bookingRepository.findById(bookingId.trim())
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        "BOOKING_NOT_FOUND",
                        "Không tìm thấy đơn đặt sân"
                ));

        Facility facility = booking.getFacilityId() != null
                ? facilityRepository.findById(booking.getFacilityId()).orElse(null)
                : null;

        if (facility == null || !ownerId.equals(facility.getOwnerId())) {
            throw new AppException(
                    HttpStatus.NOT_FOUND,
                    "BOOKING_NOT_FOUND",
                    "Không tìm thấy đơn đặt sân thuộc cơ sở của bạn"
            );
        }

        return booking;
    }

    private boolean matchesBookingDate(Booking booking, String targetDate) {
        if (booking.getItems() == null || booking.getItems().isEmpty()) {
            return false;
        }
        for (BookingItem item : booking.getItems()) {
            if (item != null && targetDate.equals(item.getBookingDate())) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesKeyword(Booking booking, User customer, Court court, String keyword) {
        if (booking.getBookingCode() != null
                && booking.getBookingCode().toLowerCase(Locale.ROOT).contains(keyword)) {
            return true;
        }
        if (customer != null) {
            if (customer.getFullName() != null
                    && customer.getFullName().toLowerCase(Locale.ROOT).contains(keyword)) {
                return true;
            }
            if (customer.getPhone() != null
                    && customer.getPhone().toLowerCase(Locale.ROOT).contains(keyword)) {
                return true;
            }
            if (customer.getEmail() != null
                    && customer.getEmail().toLowerCase(Locale.ROOT).contains(keyword)) {
                return true;
            }
        }
        if (court != null && court.getName() != null
                && court.getName().toLowerCase(Locale.ROOT).contains(keyword)) {
            return true;
        }
        return false;
    }

    private OwnerBookingDto toDto(
            Booking booking,
            User customer,
            Facility facility,
            Court court,
            List<Payment> payments
    ) {
        List<BookingItem> items = booking.getItems() != null ? booking.getItems() : Collections.emptyList();
        String primaryBookingDate = !items.isEmpty() && items.get(0).getBookingDate() != null
                ? items.get(0).getBookingDate()
                : null;

        List<String> timeSlotRanges = new ArrayList<>(items.size());
        for (BookingItem item : items) {
            if (item != null && item.getStartAt() != null && item.getEndAt() != null) {
                timeSlotRanges.add(
                        HH_MM_FORMATTER.format(item.getStartAt()) + " - " + HH_MM_FORMATTER.format(item.getEndAt())
                );
            }
        }

        OwnerBookingDto.CustomerSummary customerSummary = customer != null
                ? OwnerBookingDto.CustomerSummary.builder()
                        .id(customer.getId())
                        .mongoId(customer.getId())
                        .fullName(customer.getFullName())
                        .email(customer.getEmail())
                        .phone(customer.getPhone())
                        .avatar(customer.getAvatar())
                        .build()
                : null;

        OwnerBookingDto.FacilitySummary facilitySummary = facility != null
                ? OwnerBookingDto.FacilitySummary.builder()
                        .id(facility.getId())
                        .mongoId(facility.getId())
                        .name(facility.getName())
                        .build()
                : null;

        OwnerBookingDto.CourtSummary courtSummary = court != null
                ? OwnerBookingDto.CourtSummary.builder()
                        .id(court.getId())
                        .mongoId(court.getId())
                        .name(court.getName())
                        .build()
                : null;

        return OwnerBookingDto.builder()
                .id(booking.getId())
                .mongoId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .customerId(booking.getCustomerId())
                .customer(customerSummary)
                .facilityId(booking.getFacilityId())
                .facility(facilitySummary)
                .courtId(booking.getCourtId())
                .court(courtSummary)
                .bookingDate(primaryBookingDate)
                .items(items)
                .timeSlotRanges(timeSlotRanges)
                .totalDurationMinutes(booking.getTotalDurationMinutes())
                .priceDetails(booking.getPriceDetails())
                .paymentOption(booking.getPaymentOption())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .holdExpiresAt(booking.getHoldExpiresAt())
                .cancellationDeadline(booking.getCancellationDeadline())
                .cancelledAt(booking.getCancelledAt())
                .cancelReason(booking.getCancelReason())
                .cancelledBy(booking.getCancelledBy())
                .completedAt(booking.getCompletedAt())
                .note(booking.getNote())
                .payments(payments != null ? payments : Collections.emptyList())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
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
