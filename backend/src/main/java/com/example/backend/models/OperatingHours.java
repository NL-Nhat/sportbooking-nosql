package com.example.backend.models;

import com.example.backend.models.embedded.TimeSlot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;
import java.util.List;

/**
 * Collection 7: operating_hours
 * Lưu mẫu khung giờ cho thuê lặp lại hằng ngày (DAILY) của một sân.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "operating_hours")
public class OperatingHours {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field(targetType = FieldType.OBJECT_ID)
    private String courtId;

    @Builder.Default
    private String repeatMode = "DAILY";

    private String effectiveFrom; // yyyy-MM-dd

    private String effectiveTo;   // yyyy-MM-dd hoặc null

    private List<TimeSlot> timeSlots;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

