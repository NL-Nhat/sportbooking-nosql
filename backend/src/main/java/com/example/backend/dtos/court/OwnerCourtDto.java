package com.example.backend.dtos.court;

import com.example.backend.models.PriceRule;
import com.example.backend.models.embedded.ImageItem;
import com.example.backend.models.embedded.TimeSlot;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerCourtDto {

    private String id;

    @JsonProperty("_id")
    private String mongoId;

    private String facilityId;

    private String facilityName;

    private String facilityStatus;

    private String categoryId;

    private String categoryName;

    private String categoryCode;

    private String name;

    private String description;

    private Map<String, Object> attributes;

    private List<ImageItem> images;

    private Integer capacity;

    private String status;

    private String repeatMode;

    private String effectiveFrom;

    private String effectiveTo;

    private List<TimeSlot> timeSlots;

    private List<PriceRule> priceRules;

    private Instant createdAt;

    private Instant updatedAt;
}
