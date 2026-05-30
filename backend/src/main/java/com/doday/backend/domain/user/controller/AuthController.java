package com.doday.backend.domain.user.controller;

import com.doday.backend.domain.user.dto.LoginRequest;
import com.doday.backend.domain.user.dto.LoginResponse;
import com.doday.backend.domain.user.dto.SignUpRequest;
import com.doday.backend.domain.user.dto.SignUpResponse;
import com.doday.backend.domain.user.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    // 회원가입 요청 넘기기
    @PostMapping("/signup")
    public ResponseEntity<SignUpResponse> signUp(@RequestBody @Valid SignUpRequest request){
        return ResponseEntity.ok(authService.signUp(request));
    }

    // 로그인 요청 넘기기
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request){
        return ResponseEntity.ok(authService.login(request));
    }
}
