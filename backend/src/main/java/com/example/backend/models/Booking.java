package com.example.backend.models;

import com.example.backend.models.embedded.BookingItem;
import com.example.backend.models.embedded.PriceDetails;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;
import java.util.List;

/**
 * Collection 10: bookings
 * Lưu booking cha của Customer (hỗ trợ đặt nhiều khung giờ trên cùng một sân,
 * cọc 20% hoặc thanh toán 100%, giữ chỗ 1 giờ và hủy hoàn tiền trong 24 giờ).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
@CompoundIndexes({
    @CompoundIndex(def = "{'customerId': 1, 'createdAt': -1}"),
    @CompoundIndex(def = "{'courtId': 1, 'createdAt': -1}"),
    @CompoundIndex(def = "{'status': 1, 'holdExpiresAt': 1}")
})
public class Booking {

    @Id
    private String id;

    @Indexed(unique = true)
    private String bookingCode;

    @Field(targetType = FieldType.OBJECT_ID)
    private String customerId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String facilityId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String courtId;

    private List<BookingItem> items;

    private Integer totalDurationMinutes;

    private PriceDetails priceDetails;

    private String paymentOption; // DEPOSIT_20_PERCENT, FULL_PAYMENT

    private String status;        // PENDING_PAYMENT, CONFIRMED, EXPIRED, CANCELLED, COMPLETED

    private String paymentStatus; // UNPAID, DEPOSIT_PAID, PAID, REFUND_PENDING, PARTIALLY_REFUNDED, REFUNDED, PAYMENT_FAILED

    private Instant holdExpiresAt;        // createdAt + 1h; null sau khi thanh toán hợp lệ

    private Instant cancellationDeadline; // createdAt + 24h

    private Instant cancelledAt;

    private String cancelReason;

    private String note;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

