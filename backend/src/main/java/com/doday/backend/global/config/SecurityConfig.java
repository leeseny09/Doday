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

@Configuration // 설정 클래스 어노테이션
@EnableWebSecurity // 스프링 시큐리티 활성화
@RequiredArgsConstructor
    public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final OAuth2SuccessHandler oAuth2SuccessHandler;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
            http
                    .csrf(csrf->csrf.disable()) //jwt 사용, 세션 사용 안함
                    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .authorizeHttpRequests(auth -> auth
                            // 회원가입, 로그인은 누구나 접근 가능
                            .requestMatchers("/api/auth/**").permitAll()
                            .requestMatchers("/api/admin/batch/**").permitAll() // 테스트용 임시
                            .requestMatchers("/api/admin/**").hasRole("ADMIN")
                            .requestMatchers("/api/**").authenticated()
                            .anyRequest().permitAll())
                    // 구글 로그인 설정
                    .oauth2Login(oauth2 ->oauth2
                            .successHandler(oAuth2SuccessHandler))
                    // jwt 필터를 시큐리티 앞에 추가
                    .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            return http.build();
        }
        @Bean // 스프링이 관리하는 객체로 등록
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }
    }

