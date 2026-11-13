package com.example.backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

/**
 * Collection 14: favorites
 * Lưu cơ sở (FACILITY) hoặc sân (COURT) mà user đánh dấu yêu thích.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "favorites")
@CompoundIndexes({
    @CompoundIndex(def = "{'userId': 1, 'targetType': 1, 'targetId': 1}", unique = true),
    @CompoundIndex(def = "{'userId': 1, 'createdAt': -1}")
})
public class Favorite {

    @Id
    private String id;

    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    private String targetType; // FACILITY, COURT

    @Field(targetType = FieldType.OBJECT_ID)
    private String targetId;

    @CreatedDate
    private Instant createdAt;
}

