package com.example.backend.exceptions;

import com.example.backend.dtos.response.ApiErrorResponse;
import com.example.backend.dtos.response.ApiErrorResponse.FieldErrorDetail;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Collections;

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

    @ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
    public ResponseEntity<ApiErrorResponse> handleEndpointNotFound(Exception ex, HttpServletRequest request) {
        ApiErrorResponse body = ApiErrorResponse.of(
                "Đường dẫn API không tồn tại: " + request.getMethod() + " " + request.getRequestURI(),
                "ENDPOINT_NOT_FOUND",
                null,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse body = ApiErrorResponse.of(
                "Phương thức HTTP '" + request.getMethod() + "' không được hỗ trợ cho đường dẫn này",
                "METHOD_NOT_ALLOWED",
                null,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(body);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse body = ApiErrorResponse.of(
                "Định dạng Content-Type không được hỗ trợ",
                "UNSUPPORTED_MEDIA_TYPE",
                null,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(body);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingParameter(
            MissingServletRequestParameterException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse body = ApiErrorResponse.of(
                "Thiếu tham số bắt buộc: " + ex.getParameterName(),
                "MISSING_PARAMETER",
                Collections.singletonList(new FieldErrorDetail(ex.getParameterName(), "REQUIRED", "Tham số bắt buộc")),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
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
                "Cấu trúc dữ liệu JSON gửi lên không hợp lệ hoặc bị thiếu",
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
