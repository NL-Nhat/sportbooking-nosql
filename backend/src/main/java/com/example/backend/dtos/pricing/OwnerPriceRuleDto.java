package com.example.backend.dtos.pricing;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerPriceRuleDto {

    private String id;

    @JsonProperty("_id")
    private String mongoId;

    private String courtId;

    private String courtName;

    private String facilityId;

    private String facilityName;

    private String name;

    private List<String> specificDates;

    private List<Integer> daysOfWeek;

    private String startTime;

    private String endTime;

    private BigDecimal pricePerSlot;

    private String validFrom;

    private String validTo;

    private Integer priority;

    private String status;

    private Instant createdAt;

    private Instant updatedAt;
}
