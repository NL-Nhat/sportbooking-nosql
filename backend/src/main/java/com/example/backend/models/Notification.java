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
 * Collection 15: notifications
 * Lưu thông báo gửi đến user: booking, thanh toán, hủy, hoàn tiền, Owner application, khiếu nại.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
@CompoundIndex(name = "idx_notifications_user_read_created", def = "{'userId': 1, 'isRead': 1, 'createdAt': -1}")
public class Notification {

    @Id
    private String id;

    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    private String title;

    private String message;

    private String type; // BOOKING, PAYMENT, REFUND, OWNER, COMPLAINT, SYSTEM

    @Field(targetType = FieldType.OBJECT_ID)
    private String referenceId;

    @Builder.Default
    private Boolean isRead = false;

    @CreatedDate
    private Instant createdAt;
}

