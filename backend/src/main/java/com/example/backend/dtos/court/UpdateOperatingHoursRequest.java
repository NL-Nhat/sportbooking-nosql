package com.example.backend.dtos.court;

import com.example.backend.models.embedded.TimeSlot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOperatingHoursRequest {

    private String repeatMode;

    private String effectiveFrom;

    private String effectiveTo;

    private List<TimeSlot> timeSlots;
}
