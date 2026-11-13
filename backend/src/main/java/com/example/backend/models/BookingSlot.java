package com.example.backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

/**
 * Collection 11: booking_slots
 * Lưu từng slot nhỏ được chiếm bởi một booking (phục vụ chống đặt trùng khi nhiều khách đặt đồng thời).
 * Partial unique index trên {courtId: 1, slotDate: 1, startAt: 1} với status thuộc ["HOLD", "BOOKED"].
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "booking_slots")
@CompoundIndex(def = "{'status': 1, 'expiresAt': 1}")
public class BookingSlot {

    @Id
    private String id;

    @Field(targetType = FieldType.OBJECT_ID)
    private String courtId;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String bookingId;

    private String slotDate; // yyyy-MM-dd

    private Instant startAt; // UTC

    private Instant endAt;   // UTC

    private String status;   // HOLD, BOOKED, RELEASED

    private Instant expiresAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

