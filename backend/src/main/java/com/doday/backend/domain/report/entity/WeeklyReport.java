package com.doday.backend.domain.report.entity;

import com.doday.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)// 기본 생성자를 protected로 외부에서 못쓰게
@AllArgsConstructor
@Builder // 객체 편하게 만들게 해주는 어노테이션
public class WeeklyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) //AI 와 같은것, DB에 저장될 때 자동 증가
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id",nullable = false) // 누구의 리포트 인지
    private User user;

    @Column(nullable = false)
    private LocalDate weekStartDate; // 해당 주의 시작날짜

    @Column(nullable = false)
    private int totalCount; // 전체 할일 수

    @Column(nullable = false)
    private int completedCount; // 완료한 할일 수

    @Column(nullable = false)
    private int movedCount; // 이월 된 할일 수

    @Column
    private String aiComment; // ai코멘트

    @Column(nullable = false)
    private LocalDateTime createdAt; // 생성시간

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now(); // 생성될때 현재시간으로 지정
    }
}
