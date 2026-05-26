package com.doday.backend.global.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    //secret은 지금 string이기에 secretkey 객체로 변환해야 함
    // jwt 라이브러리는 secretkey 객체로 변환해줘야만 사용 가능
    private SecretKey secretKey;
    // Access Token 만료 시간 15분
    private long accessTokenExpiry;
    // Refresh Token 만료 시간 7일
    private long refreshTokenExpiry;

    // Spring이 Bean 생성 시 yml 값을 @Value로 주입해서 생성자 호출
    // Value -> yml 설정값을 자바 코드로 가져오는 어노테이션
    //토큰 만드는 생성자
    public JwtUtil( @Value("${jwt.secret}")  String secret,
    @Value("${jwt.access-token-expiration}") long accessTokenExpiry,
    @Value("${jwt.refresh-token-expiration}") long refreshTokenExpiry
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        // Keys.hmacShaKeyFor() 문자열을 SecretKey로 변환해주는 메소드
        this.accessTokenExpiry=accessTokenExpiry;
        this.refreshTokenExpiry=refreshTokenExpiry;
    }

    // 로그인 성공 시 API 요청에 사용할 Access Token 생성
    // userId: 토큰 주인, role: 권한 정보 (ROLE_USER, ROLE_ADMIN)
    // 반환값이 string -> jwt 토큰을 결국 긴 문자열임
    public String generateAccessToken(Long userId, String role){
        // 토큰 발급 시간 객체 만들기
        Date now = new Date(); // 현재 시각 (발급 시간)
        return Jwts.builder()
                .subject(String.valueOf(userId)) // 토큰 주인 = userId (String으로 변환)
                .claim("role",role) // 추가 정보 = role 권한
                .issuedAt(now) // 발급 시각
                .expiration(new Date(now.getTime()+accessTokenExpiry)) // 만료 시각 = 지금 + 15분
                .signWith(secretKey) // SecretKey로 서명
                .compact(); // 위 정보를 하나의 JWT 문자열로 완성
    }

    //  Refresh Token 만드는 메소드, Access Token이 만료됐을 때 다시 발급받기 위한 재발급 토큰
    public String generateRefreshToken (Long userId, String role){
        // 토큰 발급 시간
        Date now = new Date(); // 현재 시각 (발급 시간)
        return Jwts.builder()
                .subject(String.valueOf(userId)) // 토큰 주인 = userId (String으로 변환)
                .claim("role",role) // 추가 정보 = role 권한
                .issuedAt(now) // 발급 시각
                .expiration(new Date(now.getTime()+refreshTokenExpiry)) // 만료 시각 = 기존 + 7일
                .signWith(secretKey) // SecretKey로 서명
                .compact(); // 위 정보를 하나의 JWT 문자열로 완성
    }

    // 토큰이 유효한지 검증 (서명 확인 + 만료 여부 확인)
    // 유효하면 true, 만료/위조/null이면 false 반환
    public boolean validateToken(String token) {

        // 토큰이 이상하면 예외 터지기에 잡으려고 try catch문 사용함
        try {
            getClaims(token); // 토큰 파싱 성공 -> 유효한 토큰
            return true;

        }catch (JwtException | IllegalArgumentException e){
            // JwtException = JWT 관련 모든 예외, IllegalArgumentException = 토큰이 null이거나 빈 값
            return false;
        }
    }

    // 토큰 열어서 안에 있는 정보를 꺼내는 메소드
    // private 외부에서 직접 호출 못하게
    private Claims getClaims(String token) {
        return Jwts.parser() // 토큰 열 준비
                .verifyWith(secretKey)// 우리 키로 확인
                .build() //  파서 완성
                .parseSignedClaims(token) // 토큰 실제로 파싱
                .getPayload(); // 안에 있는 정보 꺼내기 -> 토큰의 전체 덩어리
    }

    // userId 꺼내는 메소드
    // getClaims -> .getPayload() 로 꺼낸 전체 토큰에서 id만 가져오기
    public Long getUserId(String token) {
        // 전체 토큰에서 subject만 꺼내기
        return Long.parseLong(getClaims(token).getSubject());
    }
    // getClaims -> .getPayload() 로 꺼낸 전체 토큰에서 role만 가져오기
    public String getRole(String token) {
        return getClaims(token).get("role",String.class);
        // get("role") = "role" 이라는 이름으로 넣은 값 꺼내고,
        // String.class = String 타입으로 꺼내기
    }



}
