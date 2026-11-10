package com.example.backend.models.embedded;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * GeoJSON Point: coordinates lưu theo thứ tự [longitude, latitude]
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeoJsonLocation {
    @Builder.Default
    private String type = "Point";
    private List<Double> coordinates;
}

