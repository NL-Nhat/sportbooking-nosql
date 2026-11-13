package com.example.backend.models;

import com.example.backend.models.embedded.OwnerReply;
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
import java.util.List;

/**
 * Collection 13: reviews
 * Lưu đánh giá của Customer cho sân/cơ sở sau khi hoàn thành booking (COMPLETED).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
@CompoundIndex(def = "{'facilityId': 1, 'createdAt': -1}")
public class Review {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field(targetType = FieldType.OBJECT_ID)
    private String bookingId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String customerId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String facilityId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String courtId;

    private Integer rating; // 1..5

    private String content;

    private List<String> images;

    private OwnerReply ownerReply;

    @Indexed
    private String status;  // VISIBLE, HIDDEN, PENDING_REVIEW

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

