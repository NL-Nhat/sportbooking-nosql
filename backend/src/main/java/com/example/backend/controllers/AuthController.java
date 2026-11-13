package com.example.backend.controllers;

import com.example.backend.dtos.auth.RegisterRequest;
import com.example.backend.dtos.auth.RegisterResponse;
import com.example.backend.dtos.response.ApiErrorResponse;
import com.example.backend.dtos.response.ApiResponse;
import com.example.backend.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "01. Authentication", description = "Các API xác thực người dùng (Đăng ký, Đăng nhập, Phiên đăng nhập)")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(
            summary = "Đăng ký tài khoản mới (Guest)",
            description = "Tạo tài khoản người dùng mới vào collection `users`. Mặc định gán `roles=[\"CUSTOMER\"]`, `ownerStatus=\"NOT_REGISTERED\"`, `status=\"ACTIVE\"`, `isEmailVerified=false` và băm mật khẩu bằng BCrypt."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Đăng ký tài khoản thành công"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Dữ liệu đầu vào không hợp lệ (VALIDATION_ERROR)",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409",
                    description = "Email hoặc số điện thoại đã tồn tại (EMAIL_ALREADY_EXISTS / PHONE_ALREADY_EXISTS)",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "429",
                    description = "Quá giới hạn số lần gọi API (RATE_LIMIT_EXCEEDED)",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest
    ) {
        String clientIp = servletRequest.getRemoteAddr();
        RegisterResponse result = authService.register(request, clientIp);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký thành công. Vui lòng xác minh email.", result));
    }
}

