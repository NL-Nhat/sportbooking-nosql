package com.example.backend.models;

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

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Collection 12: payments
 * Lưu các lần thanh toán/đặt cọc 20%/thanh toán phần còn lại và hoàn tiền cho booking.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
@CompoundIndexes({
    @CompoundIndex(def = "{'bookingId': 1, 'createdAt': -1}"),
    @CompoundIndex(def = "{'customerId': 1, 'createdAt': -1}")
})
public class Payment {

    @Id
    private String id;

    @Field(targetType = FieldType.OBJECT_ID)
    private String bookingId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String customerId;

    private String paymentType; // DEPOSIT, FULL, REMAINING, REFUND

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal amount;

    @Builder.Default
    private String currency = "VND";

    private String method;      // CASH, BANK_TRANSFER, ONLINE

    private String provider;

    private String transactionCode;

    private String providerEventId;

    private String status;      // PENDING, PAID, FAILED, REFUND_PENDING, REFUNDED, PARTIALLY_REFUNDED

    private Instant paidAt;

    private Instant refundedAt;

    private String failureReason;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

