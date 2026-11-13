package com.example.backend.security;

import com.example.backend.models.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${jwt.secret:SportBookingSuperSecretKeyForJwtSigning2026MustBeAtLeast32BytesLong!}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration-seconds:900}")
    private long accessTokenExpirationSeconds;

    @Value("${jwt.refresh-token-expiration-seconds:604800}")
    private long refreshTokenExpirationSeconds;

    public long getAccessTokenExpirationSeconds() {
        return accessTokenExpirationSeconds;
    }

    public long getRefreshTokenExpirationSeconds() {
        return refreshTokenExpirationSeconds;
    }

    public String generateAccessToken(User user, String sessionId) {
        try {
            Map<String, Object> header = new LinkedHashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            long nowSeconds = Instant.now().getEpochSecond();
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("sub", user.getId());
            payload.put("email", user.getEmail());
            payload.put("roles", user.getRoles());
            payload.put("sid", sessionId);
            payload.put("iat", nowSeconds);
            payload.put("exp", nowSeconds + accessTokenExpirationSeconds);

            String encodedHeader = BASE64_URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(header));
            String encodedPayload = BASE64_URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(payload));
            String signingInput = encodedHeader + "." + encodedPayload;

            return signingInput + "." + signHmacSha256(signingInput);
        } catch (Exception e) {
            throw new IllegalStateException("Không thể khởi tạo JWT access token", e);
        }
    }

    public String generateOpaqueRefreshToken() {
        byte[] randomBytes = new byte[48];
        SECURE_RANDOM.nextBytes(randomBytes);
        return BASE64_URL_ENCODER.encodeToString(randomBytes);
    }

    public String sha256Hex(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Không thể băm SHA-256 cho token", e);
        }
    }

    private String signHmacSha256(String data) throws Exception {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKeySpec = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(secretKeySpec);
        return BASE64_URL_ENCODER.encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    }
}
