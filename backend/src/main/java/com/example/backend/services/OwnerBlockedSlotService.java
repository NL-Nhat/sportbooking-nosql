package com.example.backend.services;

import com.example.backend.dtos.blockedslot.OwnerBlockedSlotDto;
import com.example.backend.exceptions.AppException;
import com.example.backend.models.BlockedSlot;
import com.example.backend.models.Court;
import com.example.backend.models.Facility;
import com.example.backend.models.User;
import com.example.backend.repositories.BlockedSlotRepository;
import com.example.backend.repositories.CourtRepository;
import com.example.backend.repositories.FacilityRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
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
