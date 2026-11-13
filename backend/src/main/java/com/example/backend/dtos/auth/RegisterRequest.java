package com.example.backend.dtos.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO nhận dữ liệu đăng ký tài khoản theo mục 4.1
 * Không nhận roles, ownerStatus, status, isEmailVerified từ client (chống Mass Assignment).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @Schema(description = "Họ và tên người dùng", example = "Nguyen Van A")
    private String fullName;

    @Schema(description = "Địa chỉ email (duy nhất)", example = "a@example.com")
    private String email;

    @Schema(description = "Mật khẩu đăng nhập", example = "StrongPassword123!")
    private String password;

    @Schema(description = "Số điện thoại liên hệ (duy nhất)", example = "0901234567")
    private String phone;
}

