package com.example.backend.services;

import com.example.backend.dtos.court.OwnerCourtDto;
import com.example.backend.exceptions.AppException;
import com.example.backend.models.Court;
import com.example.backend.models.Facility;
import com.example.backend.models.OperatingHours;
import com.example.backend.models.SportsCategory;
import com.example.backend.models.User;
import com.example.backend.models.embedded.TimeSlot;
import com.example.backend.repositories.CourtRepository;
import com.example.backend.repositories.FacilityRepository;
import com.example.backend.repositories.OperatingHoursRepository;
import com.example.backend.repositories.SportsCategoryRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerCourtService {

    private final CourtRepository courtRepository;
    private final FacilityRepository facilityRepository;
    private final OperatingHoursRepository operatingHoursRepository;
    private final SportsCategoryRepository sportsCategoryRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public List<OwnerCourtDto> getOwnerCourts(
            String authorizationHeader,
            String facilityId,
            String categoryId,
            String status,
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

        List<Court> courts = courtRepository.findByFacilityIdIn(targetFacilityIds);
        if (courts.isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedCategoryId = categoryId != null ? categoryId.trim() : "";
        if (!normalizedCategoryId.isEmpty()) {
            courts = courts.stream()
                    .filter(c -> normalizedCategoryId.equals(c.getCategoryId()))
                    .collect(Collectors.toList());
        }

        String normalizedStatus = status != null ? status.trim().toUpperCase(Locale.ROOT) : "";
        if (!normalizedStatus.isEmpty()) {
            courts = courts.stream()
                    .filter(c -> c.getStatus() != null && normalizedStatus.equalsIgnoreCase(c.getStatus()))
                    .collect(Collectors.toList());
        }

        String normalizedKeyword = keyword != null ? keyword.trim().toLowerCase(Locale.ROOT) : "";
        if (!normalizedKeyword.isEmpty()) {
            courts = courts.stream()
                    .filter(c -> matchesKeyword(c, facilitiesById.get(c.getFacilityId()), normalizedKeyword))
                    .collect(Collectors.toList());
        }

        if (courts.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> courtIds = new ArrayList<>(courts.size());
        Set<String> categoryIds = new LinkedHashSet<>();

        for (Court court : courts) {
            if (court.getId() != null) {
                courtIds.add(court.getId());
            }
            if (court.getCategoryId() != null) {
                categoryIds.add(court.getCategoryId());
            }
        }

        Map<String, OperatingHours> operatingHoursByCourtId = new HashMap<>();
        if (!courtIds.isEmpty()) {
            List<OperatingHours> operatingHoursList = operatingHoursRepository.findByCourtIdIn(courtIds);
            for (OperatingHours op : operatingHoursList) {
                if (op.getCourtId() != null) {
                    operatingHoursByCourtId.put(op.getCourtId(), op);
                }
            }
        }

        Map<String, SportsCategory> categoriesById = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            List<SportsCategory> categories = sportsCategoryRepository.findAllById(categoryIds);
            for (SportsCategory category : categories) {
                if (category.getId() != null) {
                    categoriesById.put(category.getId(), category);
                }
            }
        }

        List<OwnerCourtDto> result = new ArrayList<>(courts.size());
        for (Court court : courts) {
            Facility facility = facilitiesById.get(court.getFacilityId());
            SportsCategory category = categoriesById.get(court.getCategoryId());
            OperatingHours op = operatingHoursByCourtId.get(court.getId());
            List<TimeSlot> timeSlots = op != null && op.getTimeSlots() != null
                    ? op.getTimeSlots()
                    : Collections.emptyList();

            result.add(OwnerCourtDto.builder()
                    .id(court.getId())
                    .mongoId(court.getId())
                    .facilityId(court.getFacilityId())
                    .facilityName(facility != null ? facility.getName() : null)
                    .categoryId(court.getCategoryId())
                    .categoryName(category != null ? category.getName() : null)
                    .categoryCode(category != null ? category.getCode() : null)
                    .name(court.getName())
                    .description(court.getDescription())
                    .attributes(court.getAttributes())
                    .images(court.getImages() != null ? court.getImages() : Collections.emptyList())
                    .capacity(court.getCapacity())
                    .status(court.getStatus())
                    .timeSlots(timeSlots)
                    .createdAt(court.getCreatedAt())
                    .updatedAt(court.getUpdatedAt())
                    .build());
        }

        return result;
    }

    private boolean matchesKeyword(Court court, Facility facility, String keyword) {
        if (court.getName() != null && court.getName().toLowerCase(Locale.ROOT).contains(keyword)) {
            return true;
        }
        if (court.getDescription() != null && court.getDescription().toLowerCase(Locale.ROOT).contains(keyword)) {
            return true;
        }
        if (facility != null && facility.getName() != null
                && facility.getName().toLowerCase(Locale.ROOT).contains(keyword)) {
            return true;
        }
        return false;
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
