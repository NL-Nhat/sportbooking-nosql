package com.example.backend.models;

import com.example.backend.models.embedded.ComplaintResponse;
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

import java.time.Instant;
import java.util.List;

/**
 * Collection 16: complaints
 * Lưu khiếu nại của Customer về booking/cơ sở và phản hồi xử lý từ Owner/Admin.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "complaints")
@CompoundIndexes({
    @CompoundIndex(name = "idx_complaints_user_created", def = "{'userId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_complaints_facility_status", def = "{'facilityId': 1, 'status': 1}"),
    @CompoundIndex(name = "idx_complaints_status_created", def = "{'status': 1, 'createdAt': -1}")
})
public class Complaint {

    @Id
    private String id;

    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String bookingId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String facilityId;

    private String subject;

    private String content;

    private List<String> images;

    private ComplaintResponse response;

    private String status; // OPEN, IN_PROGRESS, RESOLVED, REJECTED, CLOSED

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

