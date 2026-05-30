package com.doday.backend.domain.user.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    // 로그인 요청 DTO
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

}
