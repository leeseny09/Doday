package com.doday.backend.domain.user.service;

import com.doday.backend.domain.user.dto.LoginRequest;
import com.doday.backend.domain.user.dto.LoginResponse;
import com.doday.backend.domain.user.dto.SignUpRequest;
import com.doday.backend.domain.user.dto.SignUpResponse;
import com.doday.backend.domain.user.entity.User;
import com.doday.backend.domain.user.repository.UserRepository;
import com.doday.backend.global.auth.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, String> redisTemplate;



    // 회원가입 메소드
    public SignUpResponse signUp(SignUpRequest request){

        // 1. 이메일 중복 확인
        if (userRepository.findByEmail((request.getEmail())).isPresent()){
            throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
        }

        // 2. 비밀번호 암호화 + 유저 저장
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .provider(User.Provider.LOCAL)
                .build();

        User savedUser = userRepository.save(user);

        // 3. 토큰 발급
        String accessToken = jwtUtil.generateAccessToken(savedUser.getId(), savedUser.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(savedUser.getId(), savedUser.getRole().name());

        // 4. 리프레시 토큰 값 레디스에 저장
        redisTemplate.opsForValue().set(
                "refresh:" + savedUser.getId(),     // refresh:유저ID
                refreshToken,            // 리프레시 토큰
                7, TimeUnit.DAYS         // 만료시간: 7일
        );

        // 5. 토큰 반환
        return new SignUpResponse(accessToken,refreshToken);
    }

    // 로그인 메소드
    public LoginResponse login(LoginRequest request){

        // 1. 이메일로 유저 조회, 없으면 예외
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        // 2. 비밀번호 확인, 틀리면 예외
        // passwordEncoder.matches(입력한비밀번호, DB암호화비밀번호)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new IllegalArgumentException("비밀번호가 틀렸습니다.");
        }

        // 3. 토큰 발급
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getRole().name());

        // 4. 리프레시 토큰 값 레디스에 저장
        redisTemplate.opsForValue().set(
                "refresh:" + user.getId(),     // refresh:유저ID
                refreshToken,            // 리프레시 토큰
                7, TimeUnit.DAYS         // 만료시간: 7일
        );

        // 5. 토큰 반환
        return new LoginResponse(accessToken,refreshToken);
    }

    // 토큰 발급 흐름
    // access 만료 -> refresh 토큰으로 새로운 access 발급
    // api 요청은 항상 access로만 이루어짐, refresh는 access 토큰을 발급 받기 위한 인증 용도로 사용됨
    // 만료된 access 토큰 새로 발급하는 메소드
    public String refresh (String refreshToken){

        // 토큰 검증
        if (!jwtUtil.validateToken(refreshToken)){
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }

        // 토큰에서 userId, role 꺼내기
        Long userId = jwtUtil.getUserId(refreshToken);
        String role = jwtUtil.getRole(refreshToken);

        // redis에 저장된 토큰과 일치하는지 확인
        String savedToken = redisTemplate.opsForValue().get("refresh:"+ userId);
        if (!refreshToken.equals(savedToken)){
            throw new IllegalArgumentException("토큰이 일치하지 않습니다.");
        }

        // 새 access token 발급 후 반환
        return jwtUtil.generateAccessToken(userId,role);
    }

    // 로그아웃 메소드
    public void logout(Long userId){

        // redis에서 refresh 토큰 삭제
        redisTemplate.delete("refresh:"+ userId);
    }

    // 현재 로그인 한 유저 정보 조회 메소드
    // ooo님! 에 사용됨
    public User me(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(()-> new IllegalArgumentException("존재하지 않는 유저입니다."));
    }

}
