package com.example.backend.dtos.court;

import com.example.backend.models.embedded.TimeSlot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCourtRequest {

    private String facilityId;

    private String categoryId;

    private String name;

    private String description;

    private Map<String, Object> attributes;

    private Integer capacity;

    private String status;

    /**
     * Hỗ trợ nhận danh sách chuỗi đường dẫn ("/uploads/...") hoặc danh sách object { url, alt }
     */
    private List<Object> images;

    /**
     * Hỗ trợ truyền trực tiếp danh sách khung giờ timeSlots ở cấp root
     */
    private List<TimeSlot> timeSlots;

    private String effectiveFrom;

    private String effectiveTo;

    /**
     * Hoặc truyền qua object nhúng operatingHours theo đúng cấu trúc trong Backend Guidelines 6.4
     */
    private CreateCourtRequest.OperatingHoursPayload operatingHours;
}
