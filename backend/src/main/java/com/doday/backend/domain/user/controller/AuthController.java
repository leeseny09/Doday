package com.doday.backend.domain.user.controller;

import com.doday.backend.domain.user.dto.LoginRequest;
import com.doday.backend.domain.user.dto.LoginResponse;
import com.doday.backend.domain.user.dto.SignUpRequest;
import com.doday.backend.domain.user.dto.SignUpResponse;
import com.doday.backend.domain.user.entity.User;
import com.doday.backend.domain.user.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    // 회원가입 요청 넘기기 api
    @PostMapping("/signup")
    public ResponseEntity<SignUpResponse> signUp(@RequestBody @Valid SignUpRequest request){
        return ResponseEntity.ok(authService.signUp(request));
    }

    // 로그인 요청 넘기기 api
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request){
        return ResponseEntity.ok(authService.login(request));
    }

    // access는 헤더 , refresh는 바디에 담음
    // access token 만료시 재발급 api
    // 클라이언트가 Refresh Token을 보내면 새 Access Token 발급
    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(@RequestBody String refreshToken){
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    // 로그아웃 api
    // Authorization 헤더에서 Access Token 꺼내서 userId 추출
    // Redis에서 Refresh Token 삭제 → 이후 재발급 불가
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        authService.logout(userId);
        return ResponseEntity.ok().build();
    }

    // 현재 로그인한 유저 정보 조회 api
    // Authorization 헤더에서 Access Token 꺼내서 userId 추출
    // DB에서 유저 정보 조회 후 반환
    // 프론트에서 "OOO님!" 같은 프로필 표시에 사용
    @GetMapping("/me")
    public ResponseEntity<User> me() {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ResponseEntity.ok(authService.me(userId));
    }
}
