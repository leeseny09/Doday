package com.doday.backend.global.config;

import com.doday.backend.global.auth.JwtAuthenticationFilter;
import com.doday.backend.global.auth.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration // 설정 클래스 어노테이션
@EnableWebSecurity // 스프링 시큐리티 활성화
@RequiredArgsConstructor
    public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final OAuth2SuccessHandler oAuth2SuccessHandler;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
            http
                    // CORS 설정 적용 -> 백&프론트 사이의 통신 허용
                    .cors(cors ->cors.configurationSource(corsConfigurationSource()))

                    // CSRF 공격 ( 악성사이트가 로그인된 사용자로 몰래 요청 공격 )
                    // 세션을 사용하지 않아서 공격 위험 없기에 비활성화
                    .csrf(csrf->csrf.disable())

                    // 세션 사용 안함 -> 토큰에 정보를 담기에
                    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                    .authorizeHttpRequests(auth -> auth
                            // 회원가입, 로그인은 누구나 접근 가능
                            .requestMatchers("/api/auth/**").permitAll() // 회원가입 로그인은 토큰 없이 누구나 접근 가능
                            .requestMatchers("/api/admin/batch/**").permitAll() // 테스트용 임시 허용
                            .requestMatchers("/api/todo/*/complete", "/api/todo/*/move").permitAll() // 이메일 링크 완료, 이월 처리
                            // 로그인 없이 토큰으로만 접근이라 허용
                            // 스케줄러 실행 시 메일서비스에서 일회용 토큰 생성 후 redis에 저장하기에 !!
                            .requestMatchers("/api/admin/**").hasRole("ADMIN") // 어드민만 접근 가능
                            .requestMatchers("/api/**").authenticated() // 나머지는로그인한 사용자만 접근 가능
                            .anyRequest().permitAll()) // 그 외 모든 요청은 허용
                    // 구글 로그인 설정
                    // 로그인 성공시 oAuth2SuccessHandler 실행
                    // 토큰 발급 + redis 저장 + 프론트 리다이렉트
                    .oauth2Login(oauth2 ->oauth2
                            .successHandler(oAuth2SuccessHandler))
                    // jwt 필터를 시큐리티 앞에 추가 -> 모든 요청에서 JWT 토큰 검증 먼저 실행되게
                    .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            return http.build();
        }
        @Bean // 스프링이 관리하는 객체로 등록 -> 비밀번호를 암호화 해서 디비에 저장
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }


        // CORS 설정 -> 다른 주소끼리의 통신을 허용하는 설정, 백과 프론트 사이의 요청 허락하는 설정
        @Bean
    public CorsConfigurationSource corsConfigurationSource() {

            CorsConfiguration config = new CorsConfiguration();

            // 프론트엔드 주소 허용 -> 여기서 오는 요청만 허용
            config.addAllowedOrigin("http://localhost:5173");

            // 모든 HTTP 메소드 허용
            config.addAllowedMethod("*");

            // 모든 헤더 허용 Authorization, Content-Type
            config.addAllowedHeader("*");

            // 쿠키, 인증 정보 포함 허용
            config.setAllowCredentials(true);

            // 모든 경로에 CORS 설정 적용
            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", config);

            return source;
        }



}

