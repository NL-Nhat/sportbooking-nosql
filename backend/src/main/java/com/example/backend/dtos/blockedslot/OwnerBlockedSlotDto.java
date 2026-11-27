package com.example.backend.dtos.blockedslot;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerBlockedSlotDto {

    private String id;

    @JsonProperty("_id")
    private String mongoId;

    private String courtId;

    private String courtName;

    private String facilityId;

    private String facilityName;

    private Instant startAt;

    private Instant endAt;

    private String reason;

    private String createdBy;

    private Instant createdAt;
}
