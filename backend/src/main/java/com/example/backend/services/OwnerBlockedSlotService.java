package com.example.backend.services;

import com.example.backend.dtos.blockedslot.CreateBlockedSlotRequest;
import com.example.backend.dtos.blockedslot.OwnerBlockedSlotDto;
import com.example.backend.dtos.response.ApiErrorResponse.FieldErrorDetail;
import com.example.backend.exceptions.AppException;
import com.example.backend.models.BlockedSlot;
import com.example.backend.models.BookingSlot;
import com.example.backend.models.Court;
import com.example.backend.models.Facility;
import com.example.backend.models.User;
import com.example.backend.repositories.BlockedSlotRepository;
import com.example.backend.repositories.BookingSlotRepository;
import com.example.backend.repositories.CourtRepository;
import com.example.backend.repositories.FacilityRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerBlockedSlotService {

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final BlockedSlotRepository blockedSlotRepository;
    private final BookingSlotRepository bookingSlotRepository;
    private final CourtRepository courtRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public List<OwnerBlockedSlotDto> getOwnerBlockedSlots(
            String authorizationHeader,
            String courtId,
            String date
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

        String normalizedCourtId = courtId != null ? courtId.trim() : "";
        Map<String, Court> courtsById = new HashMap<>();
        List<BlockedSlot> blockedSlots;

        if (!normalizedCourtId.isEmpty()) {
            Court court = findOwnedCourtOrThrow(owner.getId(), normalizedCourtId);
            courtsById.put(court.getId(), court);
            blockedSlots = blockedSlotRepository.findByCourtIdOrderByStartAtDesc(court.getId());
        } else {
            List<Court> ownedCourts = courtRepository.findByFacilityIdIn(facilitiesById.keySet());
            if (ownedCourts.isEmpty()) {
                return Collections.emptyList();
            }
            for (Court court : ownedCourts) {
                if (court.getId() != null) {
                    courtsById.put(court.getId(), court);
                }
            }
            blockedSlots = blockedSlotRepository.findByCourtIdInOrderByStartAtDesc(courtsById.keySet());
        }

        if (blockedSlots.isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedDate = date != null ? date.trim() : "";
        if (!normalizedDate.isEmpty()) {
            final Instant dayStart;
            final Instant dayEnd;
            try {
                LocalDate parsedDate = LocalDate.parse(normalizedDate);
                dayStart = parsedDate.atStartOfDay(DEFAULT_ZONE).toInstant();
                dayEnd = parsedDate.plusDays(1).atStartOfDay(DEFAULT_ZONE).toInstant();
            } catch (DateTimeParseException ex) {
                throw new AppException(
                        HttpStatus.BAD_REQUEST,
                        "INVALID_DATE_FORMAT",
                        "Ngày lọc (date) phải có định dạng yyyy-MM-dd"
                );
            }

            blockedSlots = blockedSlots.stream()
                    .filter(b -> b.getStartAt() != null && b.getEndAt() != null
                            && b.getStartAt().isBefore(dayEnd)
                            && b.getEndAt().isAfter(dayStart))
                    .collect(Collectors.toList());
        }

        blockedSlots.sort(
                Comparator.comparing(
                        (BlockedSlot b) -> b.getStartAt() != null ? b.getStartAt() : Instant.EPOCH
                ).reversed()
        );

        List<OwnerBlockedSlotDto> result = new ArrayList<>(blockedSlots.size());
        for (BlockedSlot slot : blockedSlots) {
            Court court = courtsById.get(slot.getCourtId());
            Facility facility = court != null ? facilitiesById.get(court.getFacilityId()) : null;
            result.add(toDto(slot, court, facility));
        }

        return result;
    }

    public OwnerBlockedSlotDto createBlockedSlot(
            String authorizationHeader,
            String pathCourtId,
            CreateBlockedSlotRequest request
    ) {
        User owner = authenticateOwner(authorizationHeader);

        if (request == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu tạo lịch chặn sân không được để trống");
        }

        String courtId = pathCourtId != null && !pathCourtId.isBlank()
                ? pathCourtId.trim()
                : (request.getCourtId() != null ? request.getCourtId().trim() : "");

        String rawStartAt = request.getStartAt() != null ? request.getStartAt().trim() : "";
        String rawEndAt = request.getEndAt() != null ? request.getEndAt().trim() : "";
        String reason = request.getReason() != null ? request.getReason().trim().replaceAll("\\s+", " ") : "";

        List<FieldErrorDetail> errors = new ArrayList<>();

        if (courtId.isEmpty()) {
            errors.add(new FieldErrorDetail("courtId", "REQUIRED", "Vui lòng chọn sân thể thao cần khóa"));
        }

        if (reason.isEmpty()) {
            errors.add(new FieldErrorDetail("reason", "REQUIRED", "Vui lòng nhập lý do khóa sân / bảo trì"));
        } else if (reason.length() < 2 || reason.length() > 300) {
            errors.add(new FieldErrorDetail("reason", "INVALID_LENGTH", "Lý do khóa sân phải từ 2 đến 300 ký tự"));
        }

        Instant startAt = parseInstant(rawStartAt, "startAt", "Thời gian bắt đầu khóa sân", errors);
        Instant endAt = parseInstant(rawEndAt, "endAt", "Thời gian kết thúc khóa sân", errors);

        if (startAt != null && endAt != null && !startAt.isBefore(endAt)) {
            errors.add(new FieldErrorDetail("endAt", "INVALID_TIME_RANGE", "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"));
        }

        if (!errors.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu tạo lịch chặn sân không hợp lệ", errors);
        }

        Court court = findOwnedCourtOrThrow(owner.getId(), courtId);
        Facility facility = court.getFacilityId() != null
                ? facilityRepository.findById(court.getFacilityId()).orElse(null)
                : null;

        // 1. Kiểm tra xung đột với các lịch chặn sân đã tồn tại trên cùng sân
        List<BlockedSlot> overlappingBlocked = blockedSlotRepository.findByCourtIdAndStartAtLessThanAndEndAtGreaterThan(
                court.getId(),
                endAt,
                startAt
        );
        if (!overlappingBlocked.isEmpty()) {
            throw new AppException(
                    HttpStatus.CONFLICT,
                    "BLOCKED_SLOT_OVERLAP",
                    "Khoảng thời gian này bị trùng hoặc chồng lấn với một lịch chặn sân đã có của sân '" + court.getName() + "'"
            );
        }

        // 2. Kiểm tra xung đột với các ca khách đã đặt (BOOKED) hoặc đang giữ chỗ còn hiệu lực (HOLD)
        Instant now = Instant.now();
        List<BookingSlot> overlappingBookingSlots = bookingSlotRepository
                .findByCourtIdAndStatusInAndStartAtLessThanAndEndAtGreaterThan(
                        court.getId(),
                        List.of("HOLD", "BOOKED"),
                        endAt,
                        startAt
                );

        boolean hasActiveBookingConflict = overlappingBookingSlots.stream().anyMatch(slot -> {
            if ("BOOKED".equalsIgnoreCase(slot.getStatus())) {
                return true;
            }
            if ("HOLD".equalsIgnoreCase(slot.getStatus())) {
                return slot.getExpiresAt() == null || slot.getExpiresAt().isAfter(now);
            }
            return false;
        });

        if (hasActiveBookingConflict) {
            throw new AppException(
                    HttpStatus.CONFLICT,
                    "BOOKING_SLOT_CONFLICT",
                    "Không thể chặn sân trong khoảng giờ này vì đã có khách đặt sân hoặc đang giữ chỗ"
            );
        }

        BlockedSlot newSlot = BlockedSlot.builder()
                .courtId(court.getId())
                .startAt(startAt)
                .endAt(endAt)
                .reason(reason)
                .createdBy(owner.getId())
                .createdAt(now)
                .build();

        BlockedSlot saved = blockedSlotRepository.save(newSlot);
        return toDto(saved, court, facility);
    }

    private Instant parseInstant(
            String rawValue,
            String fieldName,
            String fieldLabel,
            List<FieldErrorDetail> errors
    ) {
        if (rawValue == null || rawValue.isEmpty()) {
            errors.add(new FieldErrorDetail(fieldName, "REQUIRED", fieldLabel + " không được để trống"));
            return null;
        }
        try {
            return Instant.parse(rawValue);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return OffsetDateTime.parse(rawValue).toInstant();
        } catch (DateTimeParseException ignored) {
        }
        try {
            LocalDateTime localDateTime = LocalDateTime.parse(rawValue);
            return localDateTime.atZone(DEFAULT_ZONE).toInstant();
        } catch (DateTimeParseException ex) {
            errors.add(new FieldErrorDetail(
                    fieldName,
                    "INVALID_DATETIME_FORMAT",
                    fieldLabel + " không đúng định dạng ngày giờ ISO-8601"
            ));
            return null;
        }
    }

    private Court findOwnedCourtOrThrow(String ownerId, String courtId) {
        if (courtId == null || courtId.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_COURT_ID", "Mã sân thể thao không hợp lệ");
        }

        Court court = courtRepository.findById(courtId.trim())
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        "COURT_NOT_FOUND",
                        "Không tìm thấy sân thể thao"
                ));

        Facility facility = court.getFacilityId() != null
                ? facilityRepository.findById(court.getFacilityId()).orElse(null)
                : null;

        if (facility == null || !ownerId.equals(facility.getOwnerId())) {
            throw new AppException(
                    HttpStatus.NOT_FOUND,
                    "COURT_NOT_FOUND",
                    "Không tìm thấy sân thể thao thuộc quyền sở hữu của bạn"
            );
        }

        return court;
    }

    private OwnerBlockedSlotDto toDto(BlockedSlot slot, Court court, Facility facility) {
        return OwnerBlockedSlotDto.builder()
                .id(slot.getId())
                .mongoId(slot.getId())
                .courtId(slot.getCourtId())
                .courtName(court != null ? court.getName() : null)
                .facilityId(court != null ? court.getFacilityId() : null)
                .facilityName(facility != null ? facility.getName() : null)
                .startAt(slot.getStartAt())
                .endAt(slot.getEndAt())
                .reason(slot.getReason())
                .createdBy(slot.getCreatedBy())
                .createdAt(slot.getCreatedAt())
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
