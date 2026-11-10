package com.example.backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

/**
 * Collection 9: blocked_slots
 * Lưu khoảng thời gian Owner khóa sân do bảo trì, sự kiện riêng hoặc lý do khác.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "blocked_slots")
@CompoundIndex(name = "idx_blocked_slots_court_time", def = "{'courtId': 1, 'startAt': 1, 'endAt': 1}")
public class BlockedSlot {

    @Id
    private String id;

    @Field(targetType = FieldType.OBJECT_ID)
    private String courtId;

    private Instant startAt; // UTC

    private Instant endAt;   // UTC

    private String reason;

    @Field(targetType = FieldType.OBJECT_ID)
    private String createdBy;

    @CreatedDate
    private Instant createdAt;
}

