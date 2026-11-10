package com.example.backend.models;

import com.example.backend.models.embedded.Address;
import com.example.backend.models.embedded.ApplicationDocument;
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
 * Collection 3: owner_applications
 * Lưu hồ sơ Customer đăng ký trở thành Owner và kết quả xét duyệt của Admin.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "owner_applications")
@CompoundIndexes({
    @CompoundIndex(name = "idx_owner_apps_user_status", def = "{'userId': 1, 'status': 1}"),
    @CompoundIndex(name = "idx_owner_apps_status_created", def = "{'status': 1, 'createdAt': -1}")
})
public class OwnerApplication {

    @Id
    private String id;

    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    private String businessName;

    private Address businessAddress;

    private String contactPhone;

    private List<ApplicationDocument> documents;

    private String status; // PENDING, APPROVED, REJECTED

    @Field(targetType = FieldType.OBJECT_ID)
    private String reviewedBy;

    private Instant reviewedAt;

    private String rejectionReason;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

