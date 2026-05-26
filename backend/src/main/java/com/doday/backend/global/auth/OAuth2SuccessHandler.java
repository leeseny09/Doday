package com.doday.backend.global.auth;

import com.doday.backend.domain.user.entity.User;
import com.doday.backend.domain.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
// final 필드의 생성자 직접 만들어주는 어노테이션
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    // 구글 로그인 성공시 자동으로 실행되는 클래스
    // 구글에서 사용자 정보를 받고, DB에 유저 있으면 조회, 없으면 저장
    // 토큰 발급 및 redis에 저장 -> 프론트엔드로 리다이렉트
    //SimpleUrlAuthenticationSuccessHandler
    // 소셜 로그인 성공시 처리하는 spring 기본 클래스, 상속 받아서 덮어씌우기

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // 로그인 한 사람 정보 꺼내기
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        // .getPrincipal() = 로그인한 사람 정보 꺼내기

        // 이메일 가져오기
        String email = ((String)oAuth2User.getAttributes().get("email"));
        String name = (String) oAuth2User.getAttributes().get("name");

        // DB에 유저 있으면 조회 없으면 저장
        User user = userRepository.findByEmail(email)
                .orElseGet(()->userRepository.save(
                        User.builder()
                                .email(email)
                                .name(name)
                                .provider(User.Provider.GOOGLE)
                                .build()
                ));
        // orElseGet() = Optional이 비어있으면 실행되는 메서드

        // 객체에서 userid, role 찾기
        Long userId = user.getId();
        String role = user.getRole().name();
        // .name() = enum 값을 String으로 변환해줌 ROLE_USER -> "ROLE_USER"

        // 토큰 만들기
        String accessToken = jwtUtil.generateAccessToken(userId,role);
        String refreshToken = jwtUtil.generateRefreshToken(userId,role);

        // refresh token은 7일짜리 장기 토큰이라 DB에 저장하면 무거움
        // redis는 만료시간 자동 설정이 가능 -> redis에 저장
        redisTemplate.opsForValue().set(
                "refresh:" + userId,     // refresh:유저ID
                refreshToken,            // 리프레시 토큰
                7, TimeUnit.DAYS         // 만료시간: 7일
        );

        // 프론트로 토큰 전달하기 , 리다이렉트 + URL에 담기
        String redirectUrl = "/oauth2/redirect"
                +"?accessToken="+accessToken
                +"&refreshToken="+refreshToken;

        getRedirectStrategy().sendRedirect(request,response,redirectUrl);
        // getRedirectStrategy().sendRedirect() = 그 URL로 이동시키기

    }
}
