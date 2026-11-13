package com.example.backend.dtos.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiSuccessResponse<T> {

    private boolean success;

    private String message;

    private T data;

    private Object meta;

    private Instant timestamp;

    private String requestId;

    public static <T> ApiSuccessResponse<T> success(String message, T data) {
        return ApiSuccessResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .requestId("req_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12))
                .build();
    }
}
