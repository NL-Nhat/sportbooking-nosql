package com.example.backend.services;

import com.example.backend.dtos.court.CreateCourtRequest;
import com.example.backend.dtos.court.OwnerCourtDto;
import com.example.backend.dtos.response.ApiErrorResponse.FieldErrorDetail;
import com.example.backend.exceptions.AppException;
import com.example.backend.models.Court;
import com.example.backend.models.Facility;
import com.example.backend.models.OperatingHours;
import com.example.backend.models.PriceRule;
import com.example.backend.models.SportsCategory;
import com.example.backend.models.User;
import com.example.backend.models.embedded.ImageItem;
import com.example.backend.models.embedded.TimeSlot;
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

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerCourtService {

    private static final Pattern TIME_HH_MM_PATTERN = Pattern.compile("^([01]\\d|2[0-3]):([0-5]\\d)$");
    private static final Pattern DATE_YYYY_MM_DD_PATTERN = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}$");
    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final CourtRepository courtRepository;
    private final FacilityRepository facilityRepository;
    private final OperatingHoursRepository operatingHoursRepository;
    private final PriceRuleRepository priceRuleRepository;
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

            result.add(toDto(court, facility, category, op, null));
        }

        return result;
    }

    public OwnerCourtDto getOwnerCourtDetail(String authorizationHeader, String courtId) {
        User owner = authenticateOwner(authorizationHeader);

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

        if (facility == null || !owner.getId().equals(facility.getOwnerId())) {
            throw new AppException(
                    HttpStatus.NOT_FOUND,
                    "COURT_NOT_FOUND",
                    "Không tìm thấy sân thể thao thuộc quyền sở hữu của bạn"
            );
        }

        SportsCategory category = court.getCategoryId() != null
                ? sportsCategoryRepository.findById(court.getCategoryId()).orElse(null)
                : null;

        OperatingHours operatingHours = operatingHoursRepository.findByCourtId(court.getId()).orElse(null);
        List<PriceRule> priceRules = priceRuleRepository.findByCourtIdOrderByPriorityDesc(court.getId());

        return toDto(court, facility, category, operatingHours, priceRules);
    }

    public OwnerCourtDto createCourt(
            String authorizationHeader,
            String pathFacilityId,
            CreateCourtRequest request
    ) {
        User owner = authenticateOwner(authorizationHeader);

        if (request == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu tạo sân không được để trống");
        }

        String facilityId = pathFacilityId != null && !pathFacilityId.isBlank()
                ? pathFacilityId.trim()
                : (request.getFacilityId() != null ? request.getFacilityId().trim() : "");

        String rawCategoryId = request.getCategoryId() != null ? request.getCategoryId().trim() : "";
        String name = request.getName() != null ? request.getName().trim().replaceAll("\\s+", " ") : "";
        String description = request.getDescription() != null ? request.getDescription().trim() : "";

        List<FieldErrorDetail> errors = new ArrayList<>();

        if (facilityId.isEmpty()) {
            errors.add(new FieldErrorDetail("facilityId", "REQUIRED", "Vui lòng chọn cơ sở thể thao trực thuộc"));
        }

        if (rawCategoryId.isEmpty()) {
            errors.add(new FieldErrorDetail("categoryId", "REQUIRED", "Vui lòng chọn danh mục môn thể thao"));
        }

        if (name.isEmpty()) {
            errors.add(new FieldErrorDetail("name", "REQUIRED", "Tên sân không được để trống"));
        } else if (name.length() < 2 || name.length() > 150) {
            errors.add(new FieldErrorDetail("name", "INVALID_LENGTH", "Tên sân phải từ 2 đến 150 ký tự"));
        }

        Integer capacity = request.getCapacity() != null ? request.getCapacity() : 4;
        if (capacity < 1 || capacity > 500) {
            errors.add(new FieldErrorDetail("capacity", "OUT_OF_RANGE", "Sức chứa của sân phải từ 1 đến 500 người"));
        }

        String normalizedStatus = request.getStatus() != null && !request.getStatus().trim().isEmpty()
                ? request.getStatus().trim().toUpperCase(Locale.ROOT)
                : "AVAILABLE";
        if (!Set.of("AVAILABLE", "MAINTENANCE", "INACTIVE").contains(normalizedStatus)) {
            errors.add(new FieldErrorDetail("status", "INVALID_VALUE", "Trạng thái sân phải là AVAILABLE, MAINTENANCE hoặc INACTIVE"));
        }

        List<TimeSlot> rawTimeSlots = request.getTimeSlots();
        String rawEffectiveFrom = request.getEffectiveFrom();
        String rawEffectiveTo = request.getEffectiveTo();

        if (request.getOperatingHours() != null) {
            if (request.getOperatingHours().getTimeSlots() != null) {
                rawTimeSlots = request.getOperatingHours().getTimeSlots();
            }
            if (request.getOperatingHours().getEffectiveFrom() != null) {
                rawEffectiveFrom = request.getOperatingHours().getEffectiveFrom();
            }
            if (request.getOperatingHours().getEffectiveTo() != null) {
                rawEffectiveTo = request.getOperatingHours().getEffectiveTo();
            }
        }

        List<TimeSlot> validatedSlots = validateAndSortTimeSlots(rawTimeSlots, errors);

        String effectiveFrom = rawEffectiveFrom != null && !rawEffectiveFrom.trim().isEmpty()
                ? rawEffectiveFrom.trim()
                : LocalDate.now(DEFAULT_ZONE).toString();
        if (!DATE_YYYY_MM_DD_PATTERN.matcher(effectiveFrom).matches()) {
            errors.add(new FieldErrorDetail("effectiveFrom", "INVALID_FORMAT", "Ngày bắt đầu áp dụng (effectiveFrom) phải có định dạng yyyy-MM-dd"));
        }

        String effectiveTo = rawEffectiveTo != null && !rawEffectiveTo.trim().isEmpty()
                ? rawEffectiveTo.trim()
                : null;
        if (effectiveTo != null) {
            if (!DATE_YYYY_MM_DD_PATTERN.matcher(effectiveTo).matches()) {
                errors.add(new FieldErrorDetail("effectiveTo", "INVALID_FORMAT", "Ngày kết thúc (effectiveTo) phải có định dạng yyyy-MM-dd"));
            } else if (effectiveTo.compareTo(effectiveFrom) < 0) {
                errors.add(new FieldErrorDetail("effectiveTo", "INVALID_RANGE", "Ngày kết thúc (effectiveTo) phải lớn hơn hoặc bằng ngày bắt đầu (effectiveFrom)"));
            }
        }

        if (!errors.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu tạo sân không hợp lệ", errors);
        }

        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        "FACILITY_NOT_FOUND",
                        "Không tìm thấy cơ sở thể thao"
                ));

        if (!owner.getId().equals(facility.getOwnerId())) {
            throw new AppException(
                    HttpStatus.NOT_FOUND,
                    "FACILITY_NOT_FOUND",
                    "Không tìm thấy cơ sở thể thao thuộc quyền sở hữu của bạn"
            );
        }

        SportsCategory category = resolveActiveCategory(rawCategoryId);

        Map<String, Object> sanitizedAttributes = sanitizeAttributes(request.getAttributes());
        List<ImageItem> normalizedImages = parseImageItems(request.getImages(), name);

        Instant now = Instant.now();
        Court newCourt = Court.builder()
                .facilityId(facility.getId())
                .categoryId(category.getId())
                .name(name)
                .description(description)
                .attributes(sanitizedAttributes)
                .images(normalizedImages)
                .capacity(capacity)
                .status(normalizedStatus)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Court savedCourt = courtRepository.save(newCourt);

        OperatingHours operatingHours = OperatingHours.builder()
                .courtId(savedCourt.getId())
                .repeatMode("DAILY")
                .effectiveFrom(effectiveFrom)
                .effectiveTo(effectiveTo)
                .timeSlots(validatedSlots)
                .createdAt(now)
                .updatedAt(now)
                .build();

        OperatingHours savedOperatingHours = operatingHoursRepository.save(operatingHours);

        return toDto(savedCourt, facility, category, savedOperatingHours, Collections.emptyList());
    }

    private SportsCategory resolveActiveCategory(String categoryIdOrCode) {
        Optional<SportsCategory> byId = sportsCategoryRepository.findById(categoryIdOrCode);
        SportsCategory category = byId.orElseGet(() ->
                sportsCategoryRepository.findByCode(categoryIdOrCode.toUpperCase(Locale.ROOT)).orElse(null)
        );

        if (category == null) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "CATEGORY_NOT_FOUND",
                    "Danh mục môn thể thao không tồn tại trong hệ thống",
                    Collections.singletonList(new FieldErrorDetail("categoryId", "NOT_FOUND", "Danh mục môn thể thao không tồn tại"))
            );
        }

        if (!"ACTIVE".equalsIgnoreCase(category.getStatus())) {
            throw new AppException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "CATEGORY_INACTIVE",
                    "Danh mục môn thể thao này đã ngừng hoạt động",
                    Collections.singletonList(new FieldErrorDetail("categoryId", "INACTIVE", "Danh mục môn thể thao không ở trạng thái ACTIVE"))
            );
        }

        return category;
    }

    private List<TimeSlot> validateAndSortTimeSlots(List<TimeSlot> rawSlots, List<FieldErrorDetail> errors) {
        if (rawSlots == null || rawSlots.isEmpty()) {
            errors.add(new FieldErrorDetail("timeSlots", "REQUIRED", "Vui lòng cấu hình ít nhất một khung giờ cho thuê trong ngày"));
            return Collections.emptyList();
        }

        List<TimeSlot> validFormatSlots = new ArrayList<>();
        for (int i = 0; i < rawSlots.size(); i++) {
            TimeSlot slot = rawSlots.get(i);
            String start = slot != null && slot.getStartTime() != null ? slot.getStartTime().trim() : "";
            String end = slot != null && slot.getEndTime() != null ? slot.getEndTime().trim() : "";

            if (!TIME_HH_MM_PATTERN.matcher(start).matches() || !TIME_HH_MM_PATTERN.matcher(end).matches()) {
                errors.add(new FieldErrorDetail(
                        "timeSlots[" + i + "]",
                        "INVALID_TIME_FORMAT",
                        "Khung giờ phải có định dạng HH:mm (ví dụ: 06:00 - 07:00)"
                ));
                continue;
            }

            int startMinutes = toMinutes(start);
            int endMinutes = toMinutes(end);
            if (startMinutes >= endMinutes) {
                errors.add(new FieldErrorDetail(
                        "timeSlots[" + i + "]",
                        "INVALID_TIME_RANGE",
                        "Khung giờ " + start + " - " + end + " không hợp lệ: giờ bắt đầu phải nhỏ hơn giờ kết thúc"
                ));
                continue;
            }

            validFormatSlots.add(TimeSlot.builder()
                    .startTime(start)
                    .endTime(end)
                    .build());
        }

        validFormatSlots.sort(Comparator.comparing(TimeSlot::getStartTime));

        for (int i = 1; i < validFormatSlots.size(); i++) {
            TimeSlot prev = validFormatSlots.get(i - 1);
            TimeSlot curr = validFormatSlots.get(i);
            if (toMinutes(prev.getEndTime()) > toMinutes(curr.getStartTime())) {
                errors.add(new FieldErrorDetail(
                        "timeSlots",
                        "OVERLAPPING_SLOTS",
                        "Khung giờ " + prev.getStartTime() + "-" + prev.getEndTime()
                                + " bị chồng lấn với khung giờ " + curr.getStartTime() + "-" + curr.getEndTime()
                ));
                break;
            }
        }

        return validFormatSlots;
    }

    private int toMinutes(String hhmm) {
        String[] parts = hhmm.split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
    }

    private Map<String, Object> sanitizeAttributes(Map<String, Object> rawAttributes) {
        if (rawAttributes == null || rawAttributes.isEmpty()) {
            return Collections.emptyMap();
        }
        Set<String> forbiddenKeys = Set.of("_id", "id", "facilityId", "categoryId", "status", "createdAt", "updatedAt");
        Map<String, Object> clean = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : rawAttributes.entrySet()) {
            String key = entry.getKey() != null ? entry.getKey().trim() : "";
            if (!key.isEmpty() && !forbiddenKeys.contains(key) && !key.startsWith("$")) {
                clean.put(key, entry.getValue());
            }
        }
        return clean;
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

    private OwnerCourtDto toDto(
            Court court,
            Facility facility,
            SportsCategory category,
            OperatingHours operatingHours,
            List<PriceRule> priceRules
    ) {
        List<TimeSlot> timeSlots = operatingHours != null && operatingHours.getTimeSlots() != null
                ? operatingHours.getTimeSlots()
                : Collections.emptyList();

        return OwnerCourtDto.builder()
                .id(court.getId())
                .mongoId(court.getId())
                .facilityId(court.getFacilityId())
                .facilityName(facility != null ? facility.getName() : null)
                .facilityStatus(facility != null ? facility.getStatus() : null)
                .categoryId(court.getCategoryId())
                .categoryName(category != null ? category.getName() : null)
                .categoryCode(category != null ? category.getCode() : null)
                .name(court.getName())
                .description(court.getDescription())
                .attributes(court.getAttributes())
                .images(court.getImages() != null ? court.getImages() : Collections.emptyList())
                .capacity(court.getCapacity())
                .status(court.getStatus())
                .repeatMode(operatingHours != null ? operatingHours.getRepeatMode() : "DAILY")
                .effectiveFrom(operatingHours != null ? operatingHours.getEffectiveFrom() : null)
                .effectiveTo(operatingHours != null ? operatingHours.getEffectiveTo() : null)
                .timeSlots(timeSlots)
                .priceRules(priceRules)
                .createdAt(court.getCreatedAt())
                .updatedAt(court.getUpdatedAt())
                .build();
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
