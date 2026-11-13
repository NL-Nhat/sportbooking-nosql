package com.example.backend.services;

import com.example.backend.dtos.auth.AuthUserDto;
import com.example.backend.dtos.auth.LoginRequest;
import com.example.backend.dtos.auth.LoginResponse;
import com.example.backend.dtos.auth.RegisterRequest;
import com.example.backend.dtos.auth.RegisterResponse;
import com.example.backend.dtos.response.ApiErrorResponse.FieldErrorDetail;
import com.example.backend.exceptions.AppException;
import com.example.backend.models.AuthSession;
import com.example.backend.models.User;
import com.example.backend.repositories.AuthSessionRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.JwtUtil;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^(0|\\+84)[0-9]{9,10}$");

    private final UserRepository userRepository;
    private final AuthSessionRepository authSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Getter
    @RequiredArgsConstructor
    public static class LoginResult {
        private final LoginResponse response;
        private final String rawRefreshToken;
    }

    public RegisterResponse register(RegisterRequest request) {
        if (request == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu đăng ký không được để trống");
        }

        String fullName = request.getFullName() != null ? request.getFullName().trim().replaceAll("\\s+", " ") : "";
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase(Locale.ROOT) : "";
        String phone = request.getPhone() != null ? request.getPhone().trim().replaceAll("[\\s.-]", "") : "";
        String password = request.getPassword() != null ? request.getPassword() : "";

        List<FieldErrorDetail> errors = new ArrayList<>();

        if (fullName.isEmpty()) {
            errors.add(new FieldErrorDetail("fullName", "REQUIRED", "Họ và tên không được để trống"));
        } else if (fullName.length() < 2 || fullName.length() > 100) {
            errors.add(new FieldErrorDetail("fullName", "INVALID_LENGTH", "Họ và tên phải từ 2 đến 100 ký tự"));
        }

        if (email.isEmpty()) {
            errors.add(new FieldErrorDetail("email", "REQUIRED", "Email không được để trống"));
        } else if (!EMAIL_PATTERN.matcher(email).matches()) {
            errors.add(new FieldErrorDetail("email", "INVALID_FORMAT", "Địa chỉ email không đúng định dạng"));
        }

        if (phone.isEmpty()) {
            errors.add(new FieldErrorDetail("phone", "REQUIRED", "Số điện thoại không được để trống"));
        } else if (!PHONE_PATTERN.matcher(phone).matches()) {
            errors.add(new FieldErrorDetail("phone", "INVALID_FORMAT", "Số điện thoại không đúng định dạng"));
        }

        if (password.isEmpty()) {
            errors.add(new FieldErrorDetail("password", "REQUIRED", "Mật khẩu không được để trống"));
        } else if (password.length() < 6 || password.length() > 72) {
            errors.add(new FieldErrorDetail("password", "INVALID_LENGTH", "Mật khẩu phải có từ 6 đến 72 ký tự"));
        }

        if (!errors.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", errors);
        }

        if (userRepository.existsByEmail(email)) {
            throw new AppException(
                    HttpStatus.CONFLICT,
                    "EMAIL_ALREADY_EXISTS",
                    "Email này đã được đăng ký sử dụng",
                    Collections.singletonList(new FieldErrorDetail("email", "ALREADY_EXISTS", "Email này đã được đăng ký sử dụng"))
            );
        }

        if (userRepository.existsByPhone(phone)) {
            throw new AppException(
                    HttpStatus.CONFLICT,
                    "PHONE_ALREADY_EXISTS",
                    "Số điện thoại này đã được đăng ký sử dụng",
                    Collections.singletonList(new FieldErrorDetail("phone", "ALREADY_EXISTS", "Số điện thoại này đã được đăng ký sử dụng"))
            );
        }

        Instant now = Instant.now();
        User newUser = User.builder()
                .fullName(fullName)
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode(password))
                .roles(List.of("CUSTOMER"))
                .ownerStatus("NOT_REGISTERED")
                .status("ACTIVE")
                .isEmailVerified(false)
                .createdAt(now)
                .updatedAt(now)
                .build();

        User savedUser = userRepository.save(newUser);

        return RegisterResponse.builder()
                .userId(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .roles(savedUser.getRoles())
                .ownerStatus(savedUser.getOwnerStatus())
                .isEmailVerified(Boolean.TRUE.equals(savedUser.getIsEmailVerified()))
                .build();
    }

    public LoginResult login(LoginRequest request, String clientIp, String userAgent) {
        if (request == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Thông tin đăng nhập không được để trống");
        }

        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase(Locale.ROOT) : "";
        String password = request.getPassword() != null ? request.getPassword() : "";

        List<FieldErrorDetail> errors = new ArrayList<>();
        if (email.isEmpty()) {
            errors.add(new FieldErrorDetail("email", "REQUIRED", "Email không được để trống"));
        } else if (!EMAIL_PATTERN.matcher(email).matches()) {
            errors.add(new FieldErrorDetail("email", "INVALID_FORMAT", "Địa chỉ email không đúng định dạng"));
        }

        if (password.isEmpty()) {
            errors.add(new FieldErrorDetail("password", "REQUIRED", "Mật khẩu không được để trống"));
        }

        if (!errors.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu đăng nhập không hợp lệ", errors);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(
                        HttpStatus.UNAUTHORIZED,
                        "INVALID_CREDENTIALS",
                        "Email hoặc mật khẩu không chính xác"
                ));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AppException(
                    HttpStatus.UNAUTHORIZED,
                    "INVALID_CREDENTIALS",
                    "Email hoặc mật khẩu không chính xác"
            );
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new AppException(
                    HttpStatus.FORBIDDEN,
                    "ACCOUNT_NOT_ACTIVE",
                    "Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt"
            );
        }

        Instant now = Instant.now();
        String sessionId = "sess_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String familyId = "fam_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String rawRefreshToken = jwtUtil.generateOpaqueRefreshToken();

        AuthSession session = AuthSession.builder()
                .userId(user.getId())
                .sessionId(sessionId)
                .familyId(familyId)
                .refreshTokenHash(jwtUtil.sha256Hex(rawRefreshToken))
                .userAgent(userAgent != null ? userAgent : "Unknown")
                .ipAddress(clientIp != null ? clientIp : "127.0.0.1")
                .expiresAt(now.plusSeconds(jwtUtil.getRefreshTokenExpirationSeconds()))
                .lastUsedAt(now)
                .createdAt(now)
                .build();

        authSessionRepository.save(session);

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(jwtUtil.generateAccessToken(user, sessionId))
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpirationSeconds())
                .user(AuthUserDto.fromEntity(user))
                .build();

        return new LoginResult(loginResponse, rawRefreshToken);
    }
}
