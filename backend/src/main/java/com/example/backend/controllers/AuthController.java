package com.example.backend.controllers;

import com.example.backend.dtos.auth.LoginRequest;
import com.example.backend.dtos.auth.LoginResponse;
import com.example.backend.dtos.auth.RefreshTokenResponse;
import com.example.backend.dtos.auth.RegisterRequest;
import com.example.backend.dtos.auth.RegisterResponse;
import com.example.backend.dtos.response.ApiSuccessResponse;
import com.example.backend.security.JwtUtil;
import com.example.backend.services.AuthService;
import com.example.backend.services.AuthService.LoginResult;
import com.example.backend.services.AuthService.RefreshResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "01. Authentication", description = "Các API xác thực người dùng (Đăng ký, Đăng nhập, Làm mới token, Đăng xuất)")
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
        ResponseCookie refreshCookie = buildRefreshTokenCookie(
                result.getRawRefreshToken(),
                jwtUtil.getRefreshTokenExpirationSeconds(),
                servletRequest.isSecure()
        );

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiSuccessResponse.success("Đăng nhập thành công", result.getResponse()));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Làm mới Access Token bằng Refresh Token trong Cookie")
    public ResponseEntity<ApiSuccessResponse<RefreshTokenResponse>> refresh(HttpServletRequest servletRequest) {
        String rawRefreshToken = extractRefreshTokenCookie(servletRequest);
        String clientIp = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader(HttpHeaders.USER_AGENT);

        RefreshResult result = authService.refreshAccessToken(rawRefreshToken, clientIp, userAgent);
        ResponseCookie newRefreshCookie = buildRefreshTokenCookie(
                result.getRawRefreshToken(),
                jwtUtil.getRefreshTokenExpirationSeconds(),
                servletRequest.isSecure()
        );

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, newRefreshCookie.toString())
                .body(ApiSuccessResponse.success("Làm mới token thành công", result.getResponse()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất và thu hồi phiên hiện tại")
    public ResponseEntity<ApiSuccessResponse<Void>> logout(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            HttpServletRequest servletRequest
    ) {
        String rawRefreshToken = extractRefreshTokenCookie(servletRequest);
        authService.logout(authorizationHeader, rawRefreshToken);

        ResponseCookie clearCookie = buildRefreshTokenCookie("", 0, servletRequest.isSecure());

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(ApiSuccessResponse.success("Đăng xuất thành công", null));
    }

    private ResponseCookie buildRefreshTokenCookie(String tokenValue, long maxAgeSeconds, boolean isSecureRequest) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, tokenValue)
                .httpOnly(true)
                .secure(isSecureRequest)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(maxAgeSeconds)
                .build();
    }

    private String extractRefreshTokenCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
