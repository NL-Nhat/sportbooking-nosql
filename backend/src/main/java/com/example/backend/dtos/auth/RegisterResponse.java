package com.example.backend.dtos.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO phản hồi sau khi đăng ký thành công (HTTP 201) theo mục 4.1
 * Tuyệt đối không trả về passwordHash hay thông tin nhạy cảm.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {

    @Schema(description = "ID người dùng (Mongo ObjectId 24 hex)", example = "672a1b2c3d4e5f6071829301")
    private String userId;

    @Schema(description = "Họ và tên", example = "Nguyen Van A")
    private String fullName;

    @Schema(description = "Email đã chuẩn hóa (lowercase)", example = "a@example.com")
    private String email;

    @Schema(description = "Số điện thoại", example = "0901234567")
    private String phone;

    @Schema(description = "Danh sách vai trò mặc định", example = "[\"CUSTOMER\"]")
    private List<String> roles;

    @Schema(description = "Trạng thái đăng ký chủ sân", example = "NOT_REGISTERED")
    private String ownerStatus;

    @JsonProperty("isEmailVerified")
    @Schema(description = "Trạng thái xác minh email", example = "false")
    private boolean isEmailVerified;
}

