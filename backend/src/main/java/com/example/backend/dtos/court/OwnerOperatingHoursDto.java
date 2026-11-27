package com.example.backend.dtos.court;

import com.example.backend.models.embedded.TimeSlot;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerOperatingHoursDto {

    private String id;

    @JsonProperty("_id")
    private String mongoId;

    private String courtId;

    private String courtName;

    private String facilityId;

    private String facilityName;

    private String repeatMode;

    private String effectiveFrom;

    private String effectiveTo;

    private List<TimeSlot> timeSlots;

    private Instant createdAt;

    private Instant updatedAt;
}
