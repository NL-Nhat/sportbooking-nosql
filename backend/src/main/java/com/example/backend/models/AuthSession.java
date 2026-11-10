package com.example.backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

/**
 * Collection 2: auth_sessions
 * Quản lý phiên đăng nhập và refresh token rotation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "auth_sessions")
@CompoundIndex(name = "idx_auth_sessions_user_revoked", def = "{'userId': 1, 'revokedAt': 1}")
public class AuthSession {

    @Id
    private String id;

    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    @Indexed(unique = true)
    private String sessionId;

    @Indexed
    private String familyId;

    private String refreshTokenHash;

    private String previousTokenHash;

    private String deviceName;

    private String userAgent;

    private String ipAddress;

    @Indexed(expireAfter = "0s")
    private Instant expiresAt;

    private Instant lastUsedAt;

    private Instant revokedAt;

    @CreatedDate
    private Instant createdAt;
}

