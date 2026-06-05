package com.doday.backend.domain.todo.entity;

import com.doday.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자를 protected로 외부에서 못쓰게
@AllArgsConstructor
@Builder
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AI 와 같은것, DB에 저장될 때 자동 증가
    private Long id;

    @ManyToOne // 할일 여러개가 유저 한명에 속하는 N:1 관계
    @JoinColumn(name = "user_id", nullable = false) // tode 테이블에 user_id로 컬럼 자동 생성해줌, user의 id와 연결
    private User user;

    @Column(nullable = false)
    private String title;

    @Column
    private String category; // 카테고리 애매할 수 있으니 nullable X

    @Column(nullable = false)
    private LocalDate scheduledDate; // 일정 할 날짜, 계속 바뀔 수 있음

    @Column
    private LocalDateTime deadlineTime; // 마감일 없을 수도 있으니 nullable X

    @Column
    private boolean isCompleted; // 완료 여부

    @Column
    private int moveCount; // 미룬 횟수, 기본값 0

    @Column
    private boolean alarmSent; // 알람 보냈는지 여부

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist // 초기세팅
    protected void onCreate(){
        createdAt = LocalDateTime.now(); // 현재시간
        isCompleted = false; // 미완료로 초기 세팅
        moveCount = 0; // 이월 횟수 0으로 초기화
        alarmSent = false; // 초기엔 알람 안보낸 상태로 지정
    }

    // todo 업데이트 메소드
    public void update(String title, String category, LocalDateTime deadlineTime) {
        if (title != null) this.title = title;
        if (category != null) this.category = category;
        if (deadlineTime != null) this.deadlineTime = deadlineTime;
    }

    // todo 완료 처리 메소드
    public void complete() {
        this.isCompleted = true;
    }

    // todo 완료 취소 메소드
    public void uncomplete() {
        this.isCompleted = false;
    }

    // todo 미루는 메소드
    public void move() {
        this.scheduledDate = this.scheduledDate.plusDays(1); // 하루 뒤로 이월
        this.moveCount++;  // 이월 횟수 +1
    }
}
