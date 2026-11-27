package com.example.backend.services;

import com.example.backend.dtos.pricing.OwnerPriceRuleDto;
import com.example.backend.exceptions.AppException;
import com.example.backend.models.Court;
import com.example.backend.models.Facility;
import com.example.backend.models.PriceRule;
import com.example.backend.models.User;
import com.example.backend.repositories.CourtRepository;
import com.example.backend.repositories.FacilityRepository;
import com.example.backend.repositories.PriceRuleRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerPriceRuleService {

    private final PriceRuleRepository priceRuleRepository;
    private final CourtRepository courtRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public List<OwnerPriceRuleDto> getOwnerPriceRules(
            String authorizationHeader,
            String courtId,
            String status
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
        List<PriceRule> rules;

        if (!normalizedCourtId.isEmpty()) {
            Court court = findOwnedCourtOrThrow(owner.getId(), normalizedCourtId);
            courtsById.put(court.getId(), court);
            rules = priceRuleRepository.findByCourtIdOrderByPriorityDesc(court.getId());
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
            rules = priceRuleRepository.findByCourtIdInOrderByPriorityDesc(courtsById.keySet());
        }

        if (rules.isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedStatus = status != null ? status.trim().toUpperCase(Locale.ROOT) : "";
        if (!normalizedStatus.isEmpty()) {
            rules = rules.stream()
                    .filter(r -> r.getStatus() != null && normalizedStatus.equalsIgnoreCase(r.getStatus()))
                    .collect(Collectors.toList());
        }

        // Sắp xếp quy tắc có specificDates và priority cao lên đầu
        rules.sort(
                Comparator.comparingInt((PriceRule r) -> r.getPriority() != null ? r.getPriority() : 0)
                        .reversed()
                        .thenComparing((PriceRule r) -> r.getStartTime() != null ? r.getStartTime() : "")
        );

        List<OwnerPriceRuleDto> result = new ArrayList<>(rules.size());
        for (PriceRule rule : rules) {
            Court court = courtsById.get(rule.getCourtId());
            Facility facility = court != null ? facilitiesById.get(court.getFacilityId()) : null;
            result.add(toDto(rule, court, facility));
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

    private OwnerPriceRuleDto toDto(PriceRule rule, Court court, Facility facility) {
        return OwnerPriceRuleDto.builder()
                .id(rule.getId())
                .mongoId(rule.getId())
                .courtId(rule.getCourtId())
                .courtName(court != null ? court.getName() : null)
                .facilityId(court != null ? court.getFacilityId() : null)
                .facilityName(facility != null ? facility.getName() : null)
                .name(rule.getName())
                .specificDates(rule.getSpecificDates() != null ? rule.getSpecificDates() : Collections.emptyList())
                .daysOfWeek(rule.getDaysOfWeek() != null ? rule.getDaysOfWeek() : Collections.emptyList())
                .startTime(rule.getStartTime())
                .endTime(rule.getEndTime())
                .pricePerSlot(rule.getPricePerSlot())
                .validFrom(rule.getValidFrom())
                .validTo(rule.getValidTo())
                .priority(rule.getPriority())
                .status(rule.getStatus())
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
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
