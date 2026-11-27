package com.example.backend.services;

import com.example.backend.dtos.pricing.CreatePriceRuleRequest;
import com.example.backend.dtos.pricing.OwnerPriceRuleDto;
import com.example.backend.dtos.pricing.UpdatePriceRuleRequest;
import com.example.backend.dtos.response.ApiErrorResponse.FieldErrorDetail;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerPriceRuleService {

    private static final Pattern TIME_HH_MM_PATTERN = Pattern.compile("^([01]\\d|2[0-3]):([0-5]\\d)$");
    private static final Pattern DATE_YYYY_MM_DD_PATTERN = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}$");
    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

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

    public OwnerPriceRuleDto createPriceRule(
            String authorizationHeader,
            String pathCourtId,
            CreatePriceRuleRequest request
    ) {
        User owner = authenticateOwner(authorizationHeader);

        if (request == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu quy tắc giá không được để trống");
        }

        String courtId = pathCourtId != null && !pathCourtId.isBlank()
                ? pathCourtId.trim()
                : (request.getCourtId() != null ? request.getCourtId().trim() : "");

        String name = request.getName() != null ? request.getName().trim().replaceAll("\\s+", " ") : "";
        String startTime = request.getStartTime() != null ? request.getStartTime().trim() : "";
        String endTime = request.getEndTime() != null ? request.getEndTime().trim() : "";
        BigDecimal pricePerSlot = request.getPricePerSlot();
        Integer priority = request.getPriority() != null ? request.getPriority() : 1;

        String status = request.getStatus() != null && !request.getStatus().trim().isEmpty()
                ? request.getStatus().trim().toUpperCase(Locale.ROOT)
                : "ACTIVE";

        String validFrom = request.getValidFrom() != null && !request.getValidFrom().trim().isEmpty()
                ? request.getValidFrom().trim()
                : LocalDate.now(DEFAULT_ZONE).toString();

        String validTo = request.getValidTo() != null && !request.getValidTo().trim().isEmpty()
                ? request.getValidTo().trim()
                : null;

        List<FieldErrorDetail> errors = new ArrayList<>();

        if (courtId.isEmpty()) {
            errors.add(new FieldErrorDetail("courtId", "REQUIRED", "Vui lòng chọn sân thể thao áp dụng quy tắc giá"));
        }

        if (name.isEmpty()) {
            errors.add(new FieldErrorDetail("name", "REQUIRED", "Tên quy tắc giá không được để trống"));
        } else if (name.length() < 2 || name.length() > 150) {
            errors.add(new FieldErrorDetail("name", "INVALID_LENGTH", "Tên quy tắc giá phải từ 2 đến 150 ký tự"));
        }

        if (!TIME_HH_MM_PATTERN.matcher(startTime).matches()) {
            errors.add(new FieldErrorDetail("startTime", "INVALID_FORMAT", "Giờ bắt đầu phải có định dạng HH:mm"));
        }
        if (!TIME_HH_MM_PATTERN.matcher(endTime).matches()) {
            errors.add(new FieldErrorDetail("endTime", "INVALID_FORMAT", "Giờ kết thúc phải có định dạng HH:mm"));
        }
        if (TIME_HH_MM_PATTERN.matcher(startTime).matches() && TIME_HH_MM_PATTERN.matcher(endTime).matches()) {
            if (toMinutes(startTime) >= toMinutes(endTime)) {
                errors.add(new FieldErrorDetail("endTime", "INVALID_RANGE", "Giờ bắt đầu phải nhỏ hơn giờ kết thúc"));
            }
        }

        if (pricePerSlot == null || pricePerSlot.compareTo(BigDecimal.ZERO) <= 0) {
            errors.add(new FieldErrorDetail("pricePerSlot", "INVALID_VALUE", "Đơn giá mỗi khung giờ (pricePerSlot) phải lớn hơn 0"));
        }

        if (priority < 1 || priority > 1000) {
            errors.add(new FieldErrorDetail("priority", "OUT_OF_RANGE", "Độ ưu tiên (priority) phải từ 1 đến 1000"));
        }

        if (!Set.of("ACTIVE", "INACTIVE").contains(status)) {
            errors.add(new FieldErrorDetail("status", "INVALID_VALUE", "Trạng thái quy tắc giá phải là ACTIVE hoặc INACTIVE"));
        }

        if (!DATE_YYYY_MM_DD_PATTERN.matcher(validFrom).matches()) {
            errors.add(new FieldErrorDetail("validFrom", "INVALID_FORMAT", "Ngày bắt đầu hiệu lực (validFrom) phải có định dạng yyyy-MM-dd"));
        }

        if (validTo != null) {
            if (!DATE_YYYY_MM_DD_PATTERN.matcher(validTo).matches()) {
                errors.add(new FieldErrorDetail("validTo", "INVALID_FORMAT", "Ngày kết thúc hiệu lực (validTo) phải có định dạng yyyy-MM-dd"));
            } else if (DATE_YYYY_MM_DD_PATTERN.matcher(validFrom).matches() && validTo.compareTo(validFrom) < 0) {
                errors.add(new FieldErrorDetail("validTo", "INVALID_RANGE", "Ngày kết thúc hiệu lực (validTo) phải lớn hơn hoặc bằng ngày bắt đầu (validFrom)"));
            }
        }

        List<Integer> normalizedDays = normalizeAndValidateDaysOfWeek(request.getDaysOfWeek(), errors);
        List<String> normalizedSpecificDates = normalizeAndValidateSpecificDates(
                request.getSpecificDates(),
                validFrom,
                validTo,
                errors
        );

        if (normalizedDays.isEmpty() && normalizedSpecificDates.isEmpty()) {
            errors.add(new FieldErrorDetail(
                    "daysOfWeek",
                    "REQUIRED",
                    "Vui lòng chọn ít nhất một thứ trong tuần (1..7) hoặc một ngày áp dụng cụ thể (yyyy-MM-dd)"
            ));
        }

        if (!errors.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu tạo quy tắc giá không hợp lệ", errors);
        }

        Court court = findOwnedCourtOrThrow(owner.getId(), courtId);
        Facility facility = court.getFacilityId() != null
                ? facilityRepository.findById(court.getFacilityId()).orElse(null)
                : null;

        Instant now = Instant.now();
        PriceRule newRule = PriceRule.builder()
                .courtId(court.getId())
                .name(name)
                .specificDates(normalizedSpecificDates)
                .daysOfWeek(normalizedDays)
                .startTime(startTime)
                .endTime(endTime)
                .pricePerSlot(pricePerSlot)
                .validFrom(validFrom)
                .validTo(validTo)
                .priority(priority)
                .status(status)
                .createdAt(now)
                .updatedAt(now)
                .build();

        PriceRule saved = priceRuleRepository.save(newRule);
        return toDto(saved, court, facility);
    }

    public OwnerPriceRuleDto getPriceRuleDetail(
            String authorizationHeader,
            String ruleId
    ) {
        User owner = authenticateOwner(authorizationHeader);
        PriceRule rule = findOwnedPriceRuleOrThrow(owner.getId(), ruleId);
        Court court = findOwnedCourtOrThrow(owner.getId(), rule.getCourtId());
        Facility facility = court.getFacilityId() != null
                ? facilityRepository.findById(court.getFacilityId()).orElse(null)
                : null;
        return toDto(rule, court, facility);
    }

    public OwnerPriceRuleDto updatePriceRule(
            String authorizationHeader,
            String ruleId,
            UpdatePriceRuleRequest request
    ) {
        User owner = authenticateOwner(authorizationHeader);
        PriceRule rule = findOwnedPriceRuleOrThrow(owner.getId(), ruleId);

        if (request == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu cập nhật quy tắc giá không được để trống");
        }

        String targetCourtId = request.getCourtId() != null && !request.getCourtId().trim().isEmpty()
                ? request.getCourtId().trim()
                : rule.getCourtId();
        Court targetCourt = findOwnedCourtOrThrow(owner.getId(), targetCourtId);

        String name = request.getName() != null
                ? request.getName().trim().replaceAll("\\s+", " ")
                : (rule.getName() != null ? rule.getName() : "");

        String startTime = request.getStartTime() != null
                ? request.getStartTime().trim()
                : (rule.getStartTime() != null ? rule.getStartTime() : "");

        String endTime = request.getEndTime() != null
                ? request.getEndTime().trim()
                : (rule.getEndTime() != null ? rule.getEndTime() : "");

        BigDecimal pricePerSlot = request.getPricePerSlot() != null
                ? request.getPricePerSlot()
                : rule.getPricePerSlot();

        Integer priority = request.getPriority() != null
                ? request.getPriority()
                : (rule.getPriority() != null ? rule.getPriority() : 1);

        String status = request.getStatus() != null && !request.getStatus().trim().isEmpty()
                ? request.getStatus().trim().toUpperCase(Locale.ROOT)
                : (rule.getStatus() != null ? rule.getStatus() : "ACTIVE");

        String validFrom = request.getValidFrom() != null && !request.getValidFrom().trim().isEmpty()
                ? request.getValidFrom().trim()
                : (rule.getValidFrom() != null ? rule.getValidFrom() : LocalDate.now(DEFAULT_ZONE).toString());

        String validTo;
        if (request.getValidTo() != null) {
            validTo = !request.getValidTo().trim().isEmpty() ? request.getValidTo().trim() : null;
        } else {
            validTo = rule.getValidTo();
        }

        List<FieldErrorDetail> errors = new ArrayList<>();

        if (name.isEmpty()) {
            errors.add(new FieldErrorDetail("name", "REQUIRED", "Tên quy tắc giá không được để trống"));
        } else if (name.length() < 2 || name.length() > 150) {
            errors.add(new FieldErrorDetail("name", "INVALID_LENGTH", "Tên quy tắc giá phải từ 2 đến 150 ký tự"));
        }

        if (!TIME_HH_MM_PATTERN.matcher(startTime).matches()) {
            errors.add(new FieldErrorDetail("startTime", "INVALID_FORMAT", "Giờ bắt đầu phải có định dạng HH:mm"));
        }
        if (!TIME_HH_MM_PATTERN.matcher(endTime).matches()) {
            errors.add(new FieldErrorDetail("endTime", "INVALID_FORMAT", "Giờ kết thúc phải có định dạng HH:mm"));
        }
        if (TIME_HH_MM_PATTERN.matcher(startTime).matches() && TIME_HH_MM_PATTERN.matcher(endTime).matches()) {
            if (toMinutes(startTime) >= toMinutes(endTime)) {
                errors.add(new FieldErrorDetail("endTime", "INVALID_RANGE", "Giờ bắt đầu phải nhỏ hơn giờ kết thúc"));
            }
        }

        if (pricePerSlot == null || pricePerSlot.compareTo(BigDecimal.ZERO) <= 0) {
            errors.add(new FieldErrorDetail("pricePerSlot", "INVALID_VALUE", "Đơn giá mỗi khung giờ (pricePerSlot) phải lớn hơn 0"));
        }

        if (priority < 1 || priority > 1000) {
            errors.add(new FieldErrorDetail("priority", "OUT_OF_RANGE", "Độ ưu tiên (priority) phải từ 1 đến 1000"));
        }

        if (!Set.of("ACTIVE", "INACTIVE").contains(status)) {
            errors.add(new FieldErrorDetail("status", "INVALID_VALUE", "Trạng thái quy tắc giá phải là ACTIVE hoặc INACTIVE"));
        }

        if (!DATE_YYYY_MM_DD_PATTERN.matcher(validFrom).matches()) {
            errors.add(new FieldErrorDetail("validFrom", "INVALID_FORMAT", "Ngày bắt đầu hiệu lực (validFrom) phải có định dạng yyyy-MM-dd"));
        }

        if (validTo != null) {
            if (!DATE_YYYY_MM_DD_PATTERN.matcher(validTo).matches()) {
                errors.add(new FieldErrorDetail("validTo", "INVALID_FORMAT", "Ngày kết thúc hiệu lực (validTo) phải có định dạng yyyy-MM-dd"));
            } else if (DATE_YYYY_MM_DD_PATTERN.matcher(validFrom).matches() && validTo.compareTo(validFrom) < 0) {
                errors.add(new FieldErrorDetail("validTo", "INVALID_RANGE", "Ngày kết thúc hiệu lực (validTo) phải lớn hơn hoặc bằng ngày bắt đầu (validFrom)"));
            }
        }

        List<Integer> rawDays = request.getDaysOfWeek() != null
                ? request.getDaysOfWeek()
                : rule.getDaysOfWeek();
        List<String> rawDates = request.getSpecificDates() != null
                ? request.getSpecificDates()
                : rule.getSpecificDates();

        List<Integer> normalizedDays = normalizeAndValidateDaysOfWeek(rawDays, errors);
        List<String> normalizedSpecificDates = normalizeAndValidateSpecificDates(
                rawDates,
                validFrom,
                validTo,
                errors
        );

        if (normalizedDays.isEmpty() && normalizedSpecificDates.isEmpty()) {
            errors.add(new FieldErrorDetail(
                    "daysOfWeek",
                    "REQUIRED",
                    "Vui lòng chọn ít nhất một thứ trong tuần (1..7) hoặc một ngày áp dụng cụ thể (yyyy-MM-dd)"
            ));
        }

        if (!errors.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu cập nhật quy tắc giá không hợp lệ", errors);
        }

        rule.setCourtId(targetCourt.getId());
        rule.setName(name);
        rule.setDaysOfWeek(normalizedDays);
        rule.setSpecificDates(normalizedSpecificDates);
        rule.setStartTime(startTime);
        rule.setEndTime(endTime);
        rule.setPricePerSlot(pricePerSlot);
        rule.setValidFrom(validFrom);
        rule.setValidTo(validTo);
        rule.setPriority(priority);
        rule.setStatus(status);
        rule.setUpdatedAt(Instant.now());

        PriceRule saved = priceRuleRepository.save(rule);
        Facility facility = targetCourt.getFacilityId() != null
                ? facilityRepository.findById(targetCourt.getFacilityId()).orElse(null)
                : null;

        return toDto(saved, targetCourt, facility);
    }

    public void deletePriceRule(
            String authorizationHeader,
            String ruleId
    ) {
        User owner = authenticateOwner(authorizationHeader);
        PriceRule rule = findOwnedPriceRuleOrThrow(owner.getId(), ruleId);
        priceRuleRepository.delete(rule);
    }

    private PriceRule findOwnedPriceRuleOrThrow(String ownerId, String ruleId) {
        if (ruleId == null || ruleId.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_PRICE_RULE_ID", "Mã quy tắc giá không hợp lệ");
        }

        PriceRule rule = priceRuleRepository.findById(ruleId.trim())
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        "PRICE_RULE_NOT_FOUND",
                        "Không tìm thấy quy tắc giá"
                ));

        findOwnedCourtOrThrow(ownerId, rule.getCourtId());
        return rule;
    }

    private List<Integer> normalizeAndValidateDaysOfWeek(List<Integer> rawDays, List<FieldErrorDetail> errors) {
        if (rawDays == null || rawDays.isEmpty()) {
            return Collections.emptyList();
        }
        Set<Integer> uniqueDays = new LinkedHashSet<>();
        for (Integer day : rawDays) {
            if (day == null || day < 1 || day > 7) {
                errors.add(new FieldErrorDetail("daysOfWeek", "OUT_OF_RANGE", "Thứ trong tuần phải nằm trong khoảng từ 1 (Thứ 2) đến 7 (Chủ Nhật)"));
                break;
            }
            uniqueDays.add(day);
        }
        List<Integer> sorted = new ArrayList<>(uniqueDays);
        Collections.sort(sorted);
        return sorted;
    }

    private List<String> normalizeAndValidateSpecificDates(
            List<String> rawDates,
            String validFrom,
            String validTo,
            List<FieldErrorDetail> errors
    ) {
        if (rawDates == null || rawDates.isEmpty()) {
            return Collections.emptyList();
        }
        Set<String> uniqueDates = new LinkedHashSet<>();
        boolean validBounds = DATE_YYYY_MM_DD_PATTERN.matcher(validFrom).matches()
                && (validTo == null || DATE_YYYY_MM_DD_PATTERN.matcher(validTo).matches());

        for (String raw : rawDates) {
            if (raw == null || raw.trim().isEmpty()) {
                continue;
            }
            String dateStr = raw.trim();
            if (!DATE_YYYY_MM_DD_PATTERN.matcher(dateStr).matches()) {
                errors.add(new FieldErrorDetail("specificDates", "INVALID_FORMAT", "Ngày cụ thể '" + dateStr + "' phải có định dạng yyyy-MM-dd"));
                break;
            }
            if (validBounds) {
                if (dateStr.compareTo(validFrom) < 0 || (validTo != null && dateStr.compareTo(validTo) > 0)) {
                    errors.add(new FieldErrorDetail(
                            "specificDates",
                            "OUT_OF_VALIDITY_RANGE",
                            "Ngày cụ thể '" + dateStr + "' phải nằm trong khoảng hiệu lực của quy tắc giá ("
                                    + validFrom + (validTo != null ? " đến " + validTo : "") + ")"
                    ));
                    break;
                }
            }
            uniqueDates.add(dateStr);
        }
        List<String> sorted = new ArrayList<>(uniqueDates);
        Collections.sort(sorted);
        return sorted;
    }

    private int toMinutes(String hhmm) {
        String[] parts = hhmm.split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
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
