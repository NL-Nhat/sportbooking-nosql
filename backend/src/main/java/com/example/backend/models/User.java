package com.example.backend.models;

import com.example.backend.models.embedded.Address;
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

import java.time.Instant;
import java.util.List;

/**
 * Collection 1: users
 * Lưu tài khoản, thông tin hồ sơ, vai trò (CUSTOMER, OWNER, ADMIN) và trạng thái người dùng.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
@CompoundIndex(def = "{'roles': 1, 'status': 1}")
public class User {

    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String phone;

    private String avatar;

    private Address address;

    private List<String> roles; // CUSTOMER, OWNER, ADMIN

    private String ownerStatus; // NOT_REGISTERED, PENDING, APPROVED, REJECTED

    @Indexed
    private String status; // ACTIVE, INACTIVE, BANNED

    private Boolean isEmailVerified;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

