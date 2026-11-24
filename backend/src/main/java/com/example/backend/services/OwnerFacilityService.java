package com.example.backend.services;

import com.example.backend.dtos.facility.CreateFacilityRequest;
import com.example.backend.dtos.facility.OwnerFacilityCourtDto;
import com.example.backend.dtos.facility.OwnerFacilityDto;
import com.example.backend.dtos.facility.UpdateFacilityRequest;
import com.example.backend.dtos.facility.UpdateFacilityStatusRequest;
import com.example.backend.dtos.response.ApiErrorResponse.FieldErrorDetail;
import com.example.backend.exceptions.AppException;
import com.example.backend.models.Court;
import com.example.backend.models.Facility;
import com.example.backend.models.OperatingHours;
import com.example.backend.models.SportsCategory;
import com.example.backend.models.User;
import com.example.backend.models.embedded.Address;
import com.example.backend.models.embedded.GeoJsonLocation;
import com.example.backend.models.embedded.ImageItem;
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

import java.time.Instant;
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
public class OwnerFacilityService {

    private final FacilityRepository facilityRepository;
    private final CourtRepository courtRepository;
    private final OperatingHoursRepository operatingHoursRepository;
    private final SportsCategoryRepository sportsCategoryRepository;
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
            result.add(toDto(facility, facilityCourts.size(), hoursSummary, null));
        }

        return result;
    }

    public OwnerFacilityDto getOwnerFacilityDetail(String authorizationHeader, String facilityId) {
        User owner = authenticateOwner(authorizationHeader);
        Facility facility = findOwnedFacilityOrThrow(owner.getId(), facilityId);
        return buildFacilityDetailDto(facility);
    }

    public OwnerFacilityDto createFacility(String authorizationHeader, CreateFacilityRequest request) {
        User owner = authenticateOwner(authorizationHeader);

        if (request == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu cơ sở thể thao không được để trống");
        }

        String name = request.getName() != null ? request.getName().trim().replaceAll("\\s+", " ") : "";
        String description = request.getDescription() != null ? request.getDescription().trim() : "";

        Address rawAddress = request.getAddress();
        String province = rawAddress != null && rawAddress.getProvince() != null && !rawAddress.getProvince().trim().isEmpty()
                ? rawAddress.getProvince().trim()
                : "Đà Nẵng";
        String district = rawAddress != null && rawAddress.getDistrict() != null ? rawAddress.getDistrict().trim() : "";
        String ward = rawAddress != null && rawAddress.getWard() != null ? rawAddress.getWard().trim() : "";
        String detail = rawAddress != null && rawAddress.getDetail() != null ? rawAddress.getDetail().trim() : "";

        List<FieldErrorDetail> errors = new ArrayList<>();
        validateFacilityFields(name, district, ward, detail, errors);
        GeoJsonLocation validLocation = validateAndBuildLocation(request.getLocation(), errors);

        if (!errors.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu cơ sở không hợp lệ", errors);
        }

        Address normalizedAddress = Address.builder()
                .province(province)
                .district(district)
                .ward(ward)
                .detail(detail)
                .build();

        List<ImageItem> normalizedImages = parseImageItems(request.getImages(), name);
        List<String> normalizedAmenities = parseAmenities(request.getAmenities());

        Instant now = Instant.now();
        // Cơ sở thể thao mới tạo mặc định ở trạng thái PENDING để chờ Admin xét duyệt trước khi hoạt động
        Facility newFacility = Facility.builder()
                .ownerId(owner.getId())
                .name(name)
                .description(description)
                .address(normalizedAddress)
                .location(validLocation)
                .images(normalizedImages)
                .amenities(normalizedAmenities)
                .status("PENDING")
                .createdAt(now)
                .updatedAt(now)
                .build();

        Facility savedFacility = facilityRepository.save(newFacility);
        return toDto(savedFacility, 0, null, Collections.emptyList());
    }

    public OwnerFacilityDto updateFacility(
            String authorizationHeader,
            String facilityId,
            UpdateFacilityRequest request
    ) {
        User owner = authenticateOwner(authorizationHeader);
        Facility facility = findOwnedFacilityOrThrow(owner.getId(), facilityId);

        if (request == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu cập nhật cơ sở không được để trống");
        }

        String name = request.getName() != null
                ? request.getName().trim().replaceAll("\\s+", " ")
                : (facility.getName() != null ? facility.getName() : "");

        String description = request.getDescription() != null
                ? request.getDescription().trim()
                : (facility.getDescription() != null ? facility.getDescription() : "");

        Address existingAddr = facility.getAddress();
        Address rawAddress = request.getAddress() != null ? request.getAddress() : existingAddr;

        String province = rawAddress != null && rawAddress.getProvince() != null && !rawAddress.getProvince().trim().isEmpty()
                ? rawAddress.getProvince().trim()
                : (existingAddr != null && existingAddr.getProvince() != null ? existingAddr.getProvince() : "Đà Nẵng");
        String district = rawAddress != null && rawAddress.getDistrict() != null
                ? rawAddress.getDistrict().trim()
                : (existingAddr != null && existingAddr.getDistrict() != null ? existingAddr.getDistrict() : "");
        String ward = rawAddress != null && rawAddress.getWard() != null
                ? rawAddress.getWard().trim()
                : (existingAddr != null && existingAddr.getWard() != null ? existingAddr.getWard() : "");
        String detail = rawAddress != null && rawAddress.getDetail() != null
                ? rawAddress.getDetail().trim()
                : (existingAddr != null && existingAddr.getDetail() != null ? existingAddr.getDetail() : "");

        List<FieldErrorDetail> errors = new ArrayList<>();
        validateFacilityFields(name, district, ward, detail, errors);

        GeoJsonLocation validLocation = facility.getLocation();
        if (request.getLocation() != null) {
            validLocation = validateAndBuildLocation(request.getLocation(), errors);
        }

        if (!errors.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu cập nhật cơ sở không hợp lệ", errors);
        }

        facility.setName(name);
        facility.setDescription(description);
        facility.setAddress(Address.builder()
                .province(province)
                .district(district)
                .ward(ward)
                .detail(detail)
                .build());
        facility.setLocation(validLocation);

        if (request.getImages() != null) {
            facility.setImages(parseImageItems(request.getImages(), name));
        }
        if (request.getAmenities() != null) {
            facility.setAmenities(parseAmenities(request.getAmenities()));
        }

        facility.setUpdatedAt(Instant.now());
        Facility savedFacility = facilityRepository.save(facility);
        return buildFacilityDetailDto(savedFacility);
    }

    public OwnerFacilityDto updateFacilityStatus(
            String authorizationHeader,
            String facilityId,
            UpdateFacilityStatusRequest request
    ) {
        User owner = authenticateOwner(authorizationHeader);
        Facility facility = findOwnedFacilityOrThrow(owner.getId(), facilityId);

        String targetStatus = request != null && request.getStatus() != null
                ? request.getStatus().trim().toUpperCase(Locale.ROOT)
                : "";

        if (targetStatus.isEmpty()) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "VALIDATION_ERROR",
                    "Trạng thái cơ sở không được để trống",
                    Collections.singletonList(new FieldErrorDetail("status", "REQUIRED", "Vui lòng chọn trạng thái"))
            );
        }

        if (!Set.of("APPROVED", "INACTIVE", "PENDING").contains(targetStatus)) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_STATUS",
                    "Trạng thái không hợp lệ. Chủ sân chỉ có thể chuyển giữa Đang hoạt động (APPROVED), Ngừng hoạt động (INACTIVE) hoặc Gửi duyệt lại (PENDING)."
            );
        }

        String currentStatus = facility.getStatus() != null ? facility.getStatus().toUpperCase(Locale.ROOT) : "PENDING";

        if ("SUSPENDED".equals(currentStatus)) {
            throw new AppException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "FACILITY_SUSPENDED",
                    "Cơ sở đang bị tạm đình chỉ (SUSPENDED) bởi Quản trị viên, không thể tự thay đổi trạng thái"
            );
        }

        if ("APPROVED".equals(targetStatus)) {
            if ("PENDING".equals(currentStatus) || "REJECTED".equals(currentStatus)) {
                throw new AppException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "FACILITY_NOT_APPROVED_BY_ADMIN",
                        "Cơ sở đang chờ Admin xét duyệt hoặc đã bị từ chối. Chủ sân không thể tự kích hoạt sang trạng thái APPROVED."
                );
            }
        }

        if ("PENDING".equals(targetStatus)) {
            if (!"REJECTED".equals(currentStatus) && !"PENDING".equals(currentStatus)) {
                throw new AppException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "INVALID_STATUS_TRANSITION",
                        "Chỉ cơ sở bị từ chối (REJECTED) mới cần gửi yêu cầu xét duyệt lại (PENDING)"
                );
            }
        }

        facility.setStatus(targetStatus);
        facility.setUpdatedAt(Instant.now());
        Facility savedFacility = facilityRepository.save(facility);
        return buildFacilityDetailDto(savedFacility);
    }

    public OwnerFacilityDto deactivateFacility(String authorizationHeader, String facilityId) {
        return updateFacilityStatus(
                authorizationHeader,
                facilityId,
                UpdateFacilityStatusRequest.builder().status("INACTIVE").build()
        );
    }

    public OwnerFacilityDto submitReviewFacility(String authorizationHeader, String facilityId) {
        return updateFacilityStatus(
                authorizationHeader,
                facilityId,
                UpdateFacilityStatusRequest.builder().status("PENDING").build()
        );
    }

    private Facility findOwnedFacilityOrThrow(String ownerId, String facilityId) {
        if (facilityId == null || facilityId.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_FACILITY_ID", "Mã cơ sở thể thao không hợp lệ");
        }

        Facility facility = facilityRepository.findById(facilityId.trim())
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        "FACILITY_NOT_FOUND",
                        "Không tìm thấy cơ sở thể thao"
                ));

        if (!ownerId.equals(facility.getOwnerId())) {
            throw new AppException(
                    HttpStatus.NOT_FOUND,
                    "FACILITY_NOT_FOUND",
                    "Không tìm thấy cơ sở thể thao thuộc quyền sở hữu của bạn"
            );
        }

        return facility;
    }

    private OwnerFacilityDto buildFacilityDetailDto(Facility facility) {
        List<Court> facilityCourts = courtRepository.findByFacilityIdOrderByCreatedAtAsc(facility.getId());
        List<String> courtIds = new ArrayList<>();
        Set<String> categoryIds = new LinkedHashSet<>();

        for (Court court : facilityCourts) {
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

        List<OwnerFacilityCourtDto> courtDtos = new ArrayList<>(facilityCourts.size());
        for (Court court : facilityCourts) {
            OperatingHours op = operatingHoursByCourtId.get(court.getId());
            SportsCategory category = categoriesById.get(court.getCategoryId());
            List<TimeSlot> timeSlots = op != null && op.getTimeSlots() != null
                    ? op.getTimeSlots()
                    : Collections.emptyList();

            courtDtos.add(OwnerFacilityCourtDto.builder()
                    .id(court.getId())
                    .mongoId(court.getId())
                    .facilityId(court.getFacilityId())
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

        TimeSlot hoursSummary = buildHoursSummary(facilityCourts, operatingHoursByCourtId);
        return toDto(facility, facilityCourts.size(), hoursSummary, courtDtos);
    }

    private void validateFacilityFields(
            String name,
            String district,
            String ward,
            String detail,
            List<FieldErrorDetail> errors
    ) {
        if (name.isEmpty()) {
            errors.add(new FieldErrorDetail("name", "REQUIRED", "Tên cơ sở thể thao không được để trống"));
        } else if (name.length() < 3 || name.length() > 150) {
            errors.add(new FieldErrorDetail("name", "INVALID_LENGTH", "Tên cơ sở phải từ 3 đến 150 ký tự"));
        }

        if (district.isEmpty()) {
            errors.add(new FieldErrorDetail("address.district", "REQUIRED", "Quận / Huyện không được để trống"));
        }

        if (ward.isEmpty()) {
            errors.add(new FieldErrorDetail("address.ward", "REQUIRED", "Phường / Xã không được để trống"));
        }

        if (detail.isEmpty()) {
            errors.add(new FieldErrorDetail("address.detail", "REQUIRED", "Địa chỉ chi tiết không được để trống"));
        }
    }

    private GeoJsonLocation validateAndBuildLocation(GeoJsonLocation rawLocation, List<FieldErrorDetail> errors) {
        if (rawLocation == null || rawLocation.getCoordinates() == null || rawLocation.getCoordinates().isEmpty()) {
            return null;
        }
        List<Double> coords = rawLocation.getCoordinates();
        if (coords.size() != 2 || coords.get(0) == null || coords.get(1) == null) {
            errors.add(new FieldErrorDetail("location.coordinates", "INVALID_FORMAT", "Tọa độ phải gồm [longitude, latitude]"));
            return null;
        }
        double longitude = coords.get(0);
        double latitude = coords.get(1);
        if (longitude < -180.0 || longitude > 180.0 || latitude < -90.0 || latitude > 90.0) {
            errors.add(new FieldErrorDetail("location.coordinates", "OUT_OF_RANGE", "Tọa độ kinh độ/vĩ độ không hợp lệ"));
            return null;
        }
        return GeoJsonLocation.builder()
                .type("Point")
                .coordinates(List.of(longitude, latitude))
                .build();
    }

    private OwnerFacilityDto toDto(
            Facility facility,
            long courtCount,
            TimeSlot hoursSummary,
            List<OwnerFacilityCourtDto> courts
    ) {
        return OwnerFacilityDto.builder()
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
                .courtCount(courtCount)
                .hoursSummary(hoursSummary)
                .courts(courts)
                .createdAt(facility.getCreatedAt())
                .updatedAt(facility.getUpdatedAt())
                .build();
    }

    private List<ImageItem> parseImageItems(List<Object> rawImages, String defaultAlt) {
        if (rawImages == null || rawImages.isEmpty()) {
            return Collections.emptyList();
        }
        List<ImageItem> items = new ArrayList<>();
        for (Object item : rawImages) {
            if (item instanceof String strUrl) {
                String trimmedUrl = strUrl.trim();
                if (!trimmedUrl.isEmpty()) {
                    items.add(ImageItem.builder()
                            .url(trimmedUrl)
                            .alt(defaultAlt)
                            .build());
                }
            } else if (item instanceof Map<?, ?> mapObj) {
                Object urlObj = mapObj.get("url");
                if (urlObj == null) {
                    urlObj = mapObj.get("fileUrl");
                }
                if (urlObj instanceof String urlStr && !urlStr.trim().isEmpty()) {
                    Object altObj = mapObj.get("alt");
                    String altStr = (altObj instanceof String a && !a.trim().isEmpty()) ? a.trim() : defaultAlt;
                    items.add(ImageItem.builder()
                            .url(urlStr.trim())
                            .alt(altStr)
                            .build());
                }
            }
        }
        return items;
    }

    private List<String> parseAmenities(List<String> rawAmenities) {
        if (rawAmenities == null || rawAmenities.isEmpty()) {
            return Collections.emptyList();
        }
        Set<String> unique = new LinkedHashSet<>();
        for (String amenity : rawAmenities) {
            if (amenity != null && !amenity.trim().isEmpty()) {
                unique.add(amenity.trim());
            }
        }
        return new ArrayList<>(unique);
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
