package com.example.backend.dtos.booking;

import com.example.backend.models.Payment;
import com.example.backend.models.embedded.BookingItem;
import com.example.backend.models.embedded.PriceDetails;
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
public class OwnerBookingDto {

    private String id;

    @JsonProperty("_id")
    private String mongoId;

    private String bookingCode;

    private String customerId;

    private CustomerSummary customer;

    private String facilityId;

    private FacilitySummary facility;

    private String courtId;

    private CourtSummary court;

    private String bookingDate;

    private List<BookingItem> items;

    private List<String> timeSlotRanges;

    private Integer totalDurationMinutes;

    private PriceDetails priceDetails;

    private String paymentOption;

    private String status;

    private String paymentStatus;

    private Instant holdExpiresAt;

    private Instant cancellationDeadline;

    private Instant cancelledAt;

    private String cancelReason;

    private String note;

    private List<Payment> payments;

    private Instant createdAt;

    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerSummary {
        private String id;
        @JsonProperty("_id")
        private String mongoId;
        private String fullName;
        private String email;
        private String phone;
        private String avatar;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilitySummary {
        private String id;
        @JsonProperty("_id")
        private String mongoId;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourtSummary {
        private String id;
        @JsonProperty("_id")
        private String mongoId;
        private String name;
    }
}
