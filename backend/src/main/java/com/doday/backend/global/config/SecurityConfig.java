package com.doday.backend.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration // 설정 클래스 어노테이션
@EnableWebSecurity // 스프링 시큐리티 활성화

    public class SecurityConfig {

        @Bean // 스프링이 관리하는 객체로 등록
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }
    }

