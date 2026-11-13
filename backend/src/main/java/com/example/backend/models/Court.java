package com.example.backend.models;

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
import java.util.Map;

/**
 * Collection 6: courts
 * Lưu từng sân cụ thể thuộc một cơ sở, có loại hình, thuộc tính, sức chứa và trạng thái.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "courts")
@CompoundIndexes({
    @CompoundIndex(def = "{'facilityId': 1, 'status': 1}"),
    @CompoundIndex(def = "{'categoryId': 1, 'status': 1}")
})
public class Court {

    @Id
    private String id;

    @Field(targetType = FieldType.OBJECT_ID)
    private String facilityId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String categoryId;

    private String name;

    private String description;

    private Map<String, Object> attributes;

    private List<ImageItem> images;

    private Integer capacity;

    private String status; // AVAILABLE, MAINTENANCE, INACTIVE

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

