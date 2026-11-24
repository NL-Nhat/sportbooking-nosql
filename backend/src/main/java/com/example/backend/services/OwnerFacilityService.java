package com.example.backend.services;

import com.example.backend.dtos.facility.OwnerFacilityDto;
import com.example.backend.exceptions.AppException;
import com.example.backend.models.Court;
import com.example.backend.models.Facility;
import com.example.backend.models.OperatingHours;
import com.example.backend.models.User;
import com.example.backend.models.embedded.Address;
import com.example.backend.models.embedded.TimeSlot;
import com.example.backend.repositories.CourtRepository;
import com.example.backend.repositories.FacilityRepository;
import com.example.backend.repositories.OperatingHoursRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerFacilityService {

    private final FacilityRepository facilityRepository;
    private final CourtRepository courtRepository;
    private final OperatingHoursRepository operatingHoursRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public List<OwnerFacilityDto> getOwnerFacilities(
            String authorizationHeader,
            String keyword,
            String status
    ) {
        User owner = authenticateOwner(authorizationHeader);

        String normalizedStatus = status != null ? status.trim().toUpperCase(Locale.ROOT) : "";
        List<Facility> facilities;
        if (!normalizedStatus.isEmpty()) {
            facilities = facilityRepository.findByOwnerIdAndStatusOrderByCreatedAtDesc(owner.getId(), normalizedStatus);
        } else {
            facilities = facilityRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId());
        }

        String normalizedKeyword = keyword != null ? keyword.trim().toLowerCase(Locale.ROOT) : "";
        if (!normalizedKeyword.isEmpty()) {
            facilities = facilities.stream()
                    .filter(facility -> matchesKeyword(facility, normalizedKeyword))
                    .collect(Collectors.toList());
        }

        if (facilities.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> facilityIds = facilities.stream()
                .map(Facility::getId)
                .collect(Collectors.toSet());

        List<Court> courts = courtRepository.findByFacilityIdIn(facilityIds);
        Map<String, List<Court>> courtsByFacilityId = new HashMap<>();
        List<String> allCourtIds = new ArrayList<>();

        for (Court court : courts) {
            courtsByFacilityId
                    .computeIfAbsent(court.getFacilityId(), key -> new ArrayList<>())
                    .add(court);
            if (court.getId() != null) {
                allCourtIds.add(court.getId());
            }
        }

        Map<String, OperatingHours> operatingHoursByCourtId = new HashMap<>();
        if (!allCourtIds.isEmpty()) {
            List<OperatingHours> operatingHoursList = operatingHoursRepository.findByCourtIdIn(allCourtIds);
            for (OperatingHours op : operatingHoursList) {
                if (op.getCourtId() != null) {
                    operatingHoursByCourtId.put(op.getCourtId(), op);
                }
            }
        }

        List<OwnerFacilityDto> result = new ArrayList<>(facilities.size());
        for (Facility facility : facilities) {
            List<Court> facilityCourts = courtsByFacilityId.getOrDefault(facility.getId(), Collections.emptyList());
            TimeSlot hoursSummary = buildHoursSummary(facilityCourts, operatingHoursByCourtId);

            result.add(OwnerFacilityDto.builder()
                    .id(facility.getId())
                    .mongoId(facility.getId())
                    .ownerId(facility.getOwnerId())
                    .name(facility.getName())
                    .description(facility.getDescription())
                    .address(facility.getAddress())
                    .location(facility.getLocation())
                    .images(facility.getImages() != null ? facility.getImages() : Collections.emptyList())
                    .amenities(facility.getAmenities() != null ? facility.getAmenities() : Collections.emptyList())
                    .status(facility.getStatus())
                    .courtCount(facilityCourts.size())
                    .hoursSummary(hoursSummary)
                    .createdAt(facility.getCreatedAt())
                    .updatedAt(facility.getUpdatedAt())
                    .build());
        }

        return result;
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

    private boolean matchesKeyword(Facility facility, String keyword) {
        if (facility.getName() != null && facility.getName().toLowerCase(Locale.ROOT).contains(keyword)) {
            return true;
        }
        Address addr = facility.getAddress();
        if (addr != null) {
            if (addr.getDetail() != null && addr.getDetail().toLowerCase(Locale.ROOT).contains(keyword)) {
                return true;
            }
            if (addr.getDistrict() != null && addr.getDistrict().toLowerCase(Locale.ROOT).contains(keyword)) {
                return true;
            }
            if (addr.getWard() != null && addr.getWard().toLowerCase(Locale.ROOT).contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private TimeSlot buildHoursSummary(
            List<Court> facilityCourts,
            Map<String, OperatingHours> operatingHoursByCourtId
    ) {
        String minStart = null;
        String maxEnd = null;

        for (Court court : facilityCourts) {
            OperatingHours op = operatingHoursByCourtId.get(court.getId());
            if (op == null || op.getTimeSlots() == null) {
                continue;
            }
            for (TimeSlot slot : op.getTimeSlots()) {
                if (slot == null) {
                    continue;
                }
                String start = slot.getStartTime();
                String end = slot.getEndTime();
                if (start != null && !start.isBlank()) {
                    if (minStart == null || start.compareTo(minStart) < 0) {
                        minStart = start;
                    }
                }
                if (end != null && !end.isBlank()) {
                    if (maxEnd == null || end.compareTo(maxEnd) > 0) {
                        maxEnd = end;
                    }
                }
            }
        }

        if (minStart == null || maxEnd == null) {
            return null;
        }

        return TimeSlot.builder()
                .startTime(minStart)
                .endTime(maxEnd)
                .build();
    }
}
