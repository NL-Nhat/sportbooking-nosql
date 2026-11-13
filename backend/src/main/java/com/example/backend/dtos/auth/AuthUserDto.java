package com.example.backend.dtos.auth;

import com.example.backend.models.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserDto {

    private String id;

    private String fullName;

    private String email;

    private List<String> roles;

    private String ownerStatus;

    public static AuthUserDto fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return AuthUserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(user.getRoles())
                .ownerStatus(user.getOwnerStatus() != null ? user.getOwnerStatus() : "NOT_REGISTERED")
                .build();
    }
}
