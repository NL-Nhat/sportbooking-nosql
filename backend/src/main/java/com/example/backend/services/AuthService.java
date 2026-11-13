package com.example.backend.services;

import com.example.backend.dtos.auth.RegisterRequest;
import com.example.backend.dtos.auth.RegisterResponse;
import com.example.backend.dtos.response.ApiErrorResponse.FieldErrorDetail;
import com.example.backend.exceptions.AppException;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^(0|\\+84)[0-9]{9,10}$");

    private static final int RATE_LIMIT_MAX_ATTEMPTS = 15;
    private static final long RATE_LIMIT_WINDOW_MS = 60_000L;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final Map<String, List<Long>> registerRateLimitMap = new ConcurrentHashMap<>();

    /**
     * - Email trim + lowercase, unique.
     * - Phone trim, đúng định dạng, unique.
     * - Password hash bằng BCrypt, không lưu plaintext.
     * - Không nhận roles, ownerStatus, status, isEmailVerified từ client.
     * - Mặc định roles=["CUSTOMER"], ownerStatus="NOT_REGISTERED", status="ACTIVE", isEmailVerified=false.
     */
    public RegisterResponse register(RegisterRequest request, String clientIp) {
        enforceRateLimit(clientIp);

        if (request == null) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "VALIDATION_ERROR",
                    "Dữ liệu đăng ký không được để trống"
            );
        }

        String normalizedFullName = request.getFullName() != null
                ? request.getFullName().trim().replaceAll("\\s+", " ")
                : "";
        String normalizedEmail = request.getEmail() != null
                ? request.getEmail().trim().toLowerCase(Locale.ROOT)
                : "";
        String normalizedPhone = request.getPhone() != null
                ? request.getPhone().trim().replaceAll("[\\s.-]", "")
                : "";
        String rawPassword = request.getPassword() != null
                ? request.getPassword()
                : "";

        List<FieldErrorDetail> validationErrors = new ArrayList<>();

        // 1. Validate fullName
        if (normalizedFullName.isEmpty()) {
            validationErrors.add(new FieldErrorDetail("fullName", "REQUIRED", "Họ và tên không được để trống"));
        } else if (normalizedFullName.length() < 2 || normalizedFullName.length() > 100) {
            validationErrors.add(new FieldErrorDetail("fullName", "INVALID_LENGTH", "Họ và tên phải từ 2 đến 100 ký tự"));
        }

        // 2. Validate email
        if (normalizedEmail.isEmpty()) {
            validationErrors.add(new FieldErrorDetail("email", "REQUIRED", "Email không được để trống"));
        } else if (!EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            validationErrors.add(new FieldErrorDetail("email", "INVALID_FORMAT", "Địa chỉ email không đúng định dạng"));
        }

        // 3. Validate phone
        if (normalizedPhone.isEmpty()) {
            validationErrors.add(new FieldErrorDetail("phone", "REQUIRED", "Số điện thoại không được để trống"));
        } else if (!PHONE_PATTERN.matcher(normalizedPhone).matches()) {
            validationErrors.add(new FieldErrorDetail("phone", "INVALID_FORMAT", "Số điện thoại không đúng định dạng (VD: 0901234567)"));
        }

        // 4. Validate password
        if (rawPassword.isEmpty()) {
            validationErrors.add(new FieldErrorDetail("password", "REQUIRED", "Mật khẩu không được để trống"));
        } else if (rawPassword.length() < 6 || rawPassword.length() > 72) {
            validationErrors.add(new FieldErrorDetail("password", "INVALID_LENGTH", "Mật khẩu phải có từ 6 đến 72 ký tự"));
        }

        if (!validationErrors.isEmpty()) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "VALIDATION_ERROR",
                    "Dữ liệu không hợp lệ",
                    validationErrors
            );
        }

        // 5. Kiểm tra trùng lặp email và số điện thoại trong MongoDB
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new AppException(
                    HttpStatus.CONFLICT,
                    "EMAIL_ALREADY_EXISTS",
                    "Email này đã được đăng ký sử dụng",
                    Collections.singletonList(new FieldErrorDetail("email", "ALREADY_EXISTS", "Email này đã được đăng ký sử dụng"))
            );
        }

        if (userRepository.existsByPhone(normalizedPhone)) {
            throw new AppException(
                    HttpStatus.CONFLICT,
                    "PHONE_ALREADY_EXISTS",
                    "Số điện thoại này đã được đăng ký sử dụng",
                    Collections.singletonList(new FieldErrorDetail("phone", "ALREADY_EXISTS", "Số điện thoại này đã được đăng ký sử dụng"))
            );
        }

        // 6. Băm mật khẩu bằng BCrypt và khởi tạo User với các giá trị mặc định chuẩn
        String passwordHash = passwordEncoder.encode(rawPassword);
        Instant now = Instant.now();

        User newUser = User.builder()
                .fullName(normalizedFullName)
                .email(normalizedEmail)
                .phone(normalizedPhone)
                .password(passwordHash)
                .roles(List.of("CUSTOMER"))
                .ownerStatus("NOT_REGISTERED")
                .status("ACTIVE")
                .isEmailVerified(false)
                .createdAt(now)
                .updatedAt(now)
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("Đã tạo tài khoản mới thành công: userId={}, email={}", savedUser.getId(), savedUser.getEmail());

        return RegisterResponse.builder()
                .userId(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .roles(savedUser.getRoles())
                .ownerStatus(savedUser.getOwnerStatus() != null ? savedUser.getOwnerStatus() : "NOT_REGISTERED")
                .isEmailVerified(Boolean.TRUE.equals(savedUser.getIsEmailVerified()))
                .build();
    }

    private void enforceRateLimit(String clientKey) {
        String key = (clientKey != null && !clientKey.isBlank()) ? clientKey : "unknown";
        long now = System.currentTimeMillis();
        List<Long> timestamps = registerRateLimitMap.computeIfAbsent(key, k -> new ArrayList<>());
        synchronized (timestamps) {
            timestamps.removeIf(t -> (now - t) > RATE_LIMIT_WINDOW_MS);
            if (timestamps.size() >= RATE_LIMIT_MAX_ATTEMPTS) {
                throw new AppException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "RATE_LIMIT_EXCEEDED",
                        "Bạn đã gửi quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau ít phút."
                );
            }
            timestamps.add(now);
        }
    }
}
