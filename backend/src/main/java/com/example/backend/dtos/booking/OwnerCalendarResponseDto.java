package com.example.backend.dtos.booking;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerCalendarResponseDto {

    private String date;

    private String facilityId;

    private List<CourtCalendarLaneDto> courts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourtCalendarLaneDto {

        private String courtId;

        @JsonProperty("_id")
        private String mongoId;

        private String courtName;

        private String courtStatus;

        private String facilityId;

        private String facilityName;

        private String categoryId;

        private String categoryName;

        private Map<String, Object> attributes;

        private List<CalendarSlotDto> slots;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalendarSlotDto {

        private String id;

        private String startTime;

        private String endTime;

        private Instant startAt;

        private Instant endAt;

        private BigDecimal price;

        private String status; // AVAILABLE, HOLD, BOOKED, BLOCKED

        private String reason;

        private String bookingId;

        private String bookingCode;

        private String customerName;

        private String customerPhone;

        private String paymentStatus;

        private Instant holdExpiresAt;
    }
}
