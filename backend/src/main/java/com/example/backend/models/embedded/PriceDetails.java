package com.example.backend.models.embedded;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceDetails {
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal originalAmount;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal depositRequired;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal paidAmount;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal remainingAmount;

    @Builder.Default
    private String currency = "VND";
}

