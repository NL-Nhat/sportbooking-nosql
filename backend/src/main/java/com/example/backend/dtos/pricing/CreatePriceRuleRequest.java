package com.example.backend.dtos.pricing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePriceRuleRequest {

    private String courtId;

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
}
