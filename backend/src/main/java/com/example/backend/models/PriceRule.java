package com.example.backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Collection 8: price_rules
 * Lưu quy tắc giá theo khoảng giờ, ngày cụ thể (specificDates) hoặc thứ lặp lại (daysOfWeek).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "price_rules")
@CompoundIndex(
    name = "idx_price_rules_court_status_valid",
    def = "{'courtId': 1, 'status': 1, 'validFrom': 1, 'validTo': 1}"
)
public class PriceRule {

    @Id
    private String id;

    @Field(targetType = FieldType.OBJECT_ID)
    private String courtId;

    private String name;

    private List<String> specificDates; // yyyy-MM-dd

    private List<Integer> daysOfWeek;   // 1..7 (ISO Monday..Sunday)

    private String startTime;           // HH:mm

    private String endTime;             // HH:mm

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal pricePerSlot;

    private String validFrom;           // yyyy-MM-dd

    private String validTo;             // yyyy-MM-dd hoặc null

    private Integer priority;

    private String status;              // ACTIVE, INACTIVE

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

