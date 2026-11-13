package com.example.backend.exceptions;

import com.example.backend.dtos.response.ApiErrorResponse.FieldErrorDetail;
import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.List;

@Getter
public class AppException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;
    private final List<FieldErrorDetail> details;

    public AppException(HttpStatus status, String errorCode, String message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.details = Collections.emptyList();
    }

    public AppException(HttpStatus status, String errorCode, String message, List<FieldErrorDetail> details) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.details = details;
    }
}

