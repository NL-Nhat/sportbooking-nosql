package com.example.backend.controllers;

import com.example.backend.dtos.auth.LoginRequest;
import com.example.backend.dtos.auth.LoginResponse;
import com.example.backend.dtos.auth.RegisterRequest;
import com.example.backend.dtos.auth.RegisterResponse;
import com.example.backend.dtos.response.ApiSuccessResponse;
import com.example.backend.security.JwtUtil;
import com.example.backend.services.AuthService;
import com.example.backend.services.AuthService.LoginResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "01. Authentication", description = "Các API xác thực người dùng (Đăng ký, Đăng nhập)")
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới (Guest)")
    public ResponseEntity<ApiSuccessResponse<RegisterResponse>> register(@RequestBody RegisterRequest request) {
        RegisterResponse result = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiSuccessResponse.success("Đăng ký thành công. Vui lòng xác minh email.", result));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống (Guest)")
    public ResponseEntity<ApiSuccessResponse<LoginResponse>> login(
            @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        String clientIp = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader(HttpHeaders.USER_AGENT);

        LoginResult result = authService.login(request, clientIp, userAgent);

        ResponseCookie refreshCookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, result.getRawRefreshToken())
                .httpOnly(true)
                .secure(servletRequest.isSecure())
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(jwtUtil.getRefreshTokenExpirationSeconds())
                .build();

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiSuccessResponse.success("Đăng nhập thành công", result.getResponse()));
    }
}
