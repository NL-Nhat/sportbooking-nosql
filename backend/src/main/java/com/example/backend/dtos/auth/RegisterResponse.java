package com.example.backend.dtos.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {

    private String userId;

    private String fullName;

    private String email;

    private List<String> roles;

    private String ownerStatus;

    @JsonProperty("isEmailVerified")
    private boolean isEmailVerified;
}
