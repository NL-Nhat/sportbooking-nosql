package com.example.backend.exceptions;

import com.example.backend.dtos.response.ApiErrorResponse;
import com.example.backend.dtos.response.ApiErrorResponse.FieldErrorDetail;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Collections;

/**
 * Xử lý ngoại lệ tập trung, đảm bảo trả về chuẩn JSON mục 3.3 và không lộ thông tin nội bộ
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiErrorResponse> handleAppException(AppException ex, HttpServletRequest request) {
        ApiErrorResponse body = ApiErrorResponse.of(
                ex.getMessage(),
                ex.getErrorCode(),
                ex.getDetails() != null && !ex.getDetails().isEmpty() ? ex.getDetails() : null,
                request.getRequestURI()
        );
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateKeyException(DuplicateKeyException ex, HttpServletRequest request) {
        String rawMsg = ex.getMessage() != null ? ex.getMessage() : "";
        String field = "resource";
        String userMsg = "Dữ liệu đã tồn tại trong hệ thống";

        if (rawMsg.contains("email")) {
            field = "email";
            userMsg = "Email này đã được sử dụng";
        } else if (rawMsg.contains("phone")) {
            field = "phone";
            userMsg = "Số điện thoại này đã được sử dụng";
        }

        ApiErrorResponse body = ApiErrorResponse.of(
                userMsg,
                "DUPLICATE_RESOURCE",
                Collections.singletonList(new FieldErrorDetail(field, "ALREADY_EXISTS", userMsg)),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        ApiErrorResponse body = ApiErrorResponse.of(
                "Cấu trúc dữ liệu JSON gửi lên không hợp lệ",
                "INVALID_JSON_PAYLOAD",
                null,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        ApiErrorResponse body = ApiErrorResponse.of(
                "Đã xảy ra lỗi hệ thống ngoài dự kiến. Vui lòng thử lại sau.",
                "INTERNAL_SERVER_ERROR",
                null,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}

