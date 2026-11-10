package com.example.backend.models.embedded;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlot {
    private String startTime; // HH:mm
    private String endTime;   // HH:mm
}

