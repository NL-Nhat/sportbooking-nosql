package com.example.backend.dtos.facility;

import com.example.backend.models.embedded.Address;
import com.example.backend.models.embedded.GeoJsonLocation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFacilityRequest {

    private String name;

    private String description;

    private Address address;

    private GeoJsonLocation location;

    /**
     * Hỗ trợ nhận danh sách chuỗi đường dẫn ("/uploads/...") hoặc danh sách object { url, alt }
     */
    private List<Object> images;

    private List<String> amenities;
}
