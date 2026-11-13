package com.example.backend.dtos.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    private boolean success;

    private String message;

    private ErrorBody error;

    private Instant timestamp;

    private String path;

    private String requestId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorBody {
        private String code;
        private List<FieldErrorDetail> details;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldErrorDetail {
        private String field;
        private String code;
        private String message;
    }

    public static ApiErrorResponse of(String message, String errorCode, List<FieldErrorDetail> details, String path) {
        return ApiErrorResponse.builder()
                .success(false)
                .message(message)
                .error(ErrorBody.builder()
                        .code(errorCode)
                        .details(details)
                        .build())
                .timestamp(Instant.now())
                .path(path)
                .requestId("req_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12))
                .build();
    }
}
