package com.doday.backend.global.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;


public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // JwtUtil 가져오기 -> 필터에서 토큰 검증할 때 물어봐야하기에
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil){
        this.jwtUtil=jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        // 요청이 들어오면 자동으로 실행되는 메소드 -> 이 안에 로직짜기
        // request 들어오는 요청, response 나가는 응답, filterChain 다음 필터로 넘겨주는 것

        // 토큰 꺼내기
        String token = resolveToken(request);
        // 토큰이 유효한지 확인
        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)){
            // 토큰이 널이거나 비어있는지 && 토큰이 유효한지 둘 다 확인
            // 유효하다면 누구인지 정보 꺼내기
            Long userId = jwtUtil.getUserId(token);
            String role = jwtUtil.getRole(token);

            // spring security 에게 인증된 사람이라는 것을 알리기
            // UsernamePasswordAuthenticationToken 인증 정보 담는 객체
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userId, // 이 사람이 누구인지
                    null, // 비밀번호인데, 토큰 방식이라 필요없음
                    List.of(new SimpleGrantedAuthority("ROLE_"+role)) // 권한 목록
            );

            // Security Context ( 현재 로그인한 사람을 저장해두는 공간 ) 에 등록시키기
            SecurityContextHolder.getContext().setAuthentication(authentication);
            // SecurityContextHolder 저장공간, .getContext() 그 공간을 가져오고
            // .setAuthentication(authentication) = 인증 정보 등록
        }

        // 문지기 필터 끝나고 다음 필터로 넘겨주기
        filterChain.doFilter(request,response);

    }

    // 요청 헤더에서 토큰을 꺼내는 메소드
    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        // http 요청 중 인증 정보를 담는 헤더 이름이 Authorization
        // bearer 토큰 방식이라는 뜻
        //Authorization 헤더에서 값 꺼내기, 값이 있으면 "Bearer eyJhbGci..." 이런 형태

        // Bearer 떼고 토큰만 반환
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")){
            // 값이 있는지 확인 및, Bearer 로 시작하는지 확인
            return bearer.substring(7);
            // 있으면 Bearer 7글자 떼고 토큰만 반환
        }
        return null;
    }
}
