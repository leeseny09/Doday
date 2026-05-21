package com.doday.backend.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자를 protected로 외부에서 못쓰게
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AI 와 같은것, DB에 저장될 때 자동 증가
    private Long id;

    @Column(nullable = false,unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private Provider provider; // 어떤 소셜 로그인으로 가입했는지

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    private boolean isActive;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist //새 유저가 가입할 때 일일이 세팅 안 해도 자동으로 기본값 생성해주는 어노테이션
    protected void onCreate(){
        createdAt = LocalDateTime.now();  // 가입 시간 자동 저장
        if (role == null) role = Role.ROLE_USER;  // role 안 넣으면 자동으로 일반유저
        isActive = true;  // 가입하면 자동으로 활성 상태
    }

    public enum Provider { GOOGLE }
    public enum Role { ROLE_USER, ROLE_ADMIN }
}
