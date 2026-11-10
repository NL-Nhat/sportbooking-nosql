package com.example.backend.models;

import com.example.backend.models.embedded.Address;
import com.example.backend.models.embedded.GeoJsonLocation;
import com.example.backend.models.embedded.ImageItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;
import java.util.List;

/**
 * Collection 5: facilities
 * Lưu thông tin cơ sở/trung tâm thể thao thuộc sở hữu của một Owner.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "facilities")
@CompoundIndexes({
    @CompoundIndex(name = "idx_facilities_owner_status", def = "{'ownerId': 1, 'status': 1}"),
    @CompoundIndex(name = "idx_facilities_status_created", def = "{'status': 1, 'createdAt': -1}")
})
public class Facility {

    @Id
    private String id;

    @Field(targetType = FieldType.OBJECT_ID)
    private String ownerId;

    private String name;

    private String description;

    private Address address;

    private GeoJsonLocation location; // 2dsphere index: { type: "Point", coordinates: [lng, lat] }

    private List<ImageItem> images;

    private List<String> amenities;

    private String status; // PENDING, APPROVED, REJECTED, SUSPENDED, INACTIVE

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

