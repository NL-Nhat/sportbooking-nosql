package com.example.backend.dtos.facility;

import com.example.backend.models.embedded.Address;
import com.example.backend.models.embedded.GeoJsonLocation;
import com.example.backend.models.embedded.ImageItem;
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
public class OwnerFacilityDto {

    private String id;

    @JsonProperty("_id")
    private String mongoId;

    private String ownerId;

    private String name;

    private String description;

    private Address address;

    private GeoJsonLocation location;

    private List<ImageItem> images;

    private List<String> amenities;

    private String status;

    private long courtCount;

    private TimeSlot hoursSummary;

    private List<OwnerFacilityCourtDto> courts;

    private Instant createdAt;

    private Instant updatedAt;
}
