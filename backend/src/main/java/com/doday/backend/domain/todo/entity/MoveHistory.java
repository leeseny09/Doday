package com.doday.backend.domain.todo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자를 protected로 외부에서 못쓰게
@AllArgsConstructor
@Getter
@Builder
public class MoveHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)// AI 와 같은것, DB에 저장될 때 자동 증가
    private Long id;

    @ManyToOne
    @JoinColumn(name = "todo_id",nullable = false)
    private Todo todo; // 어떤 할일이 이월됐는지

    @Column(nullable = false)
    private LocalDate movedFrom; // 이월 전 날짜

    @Column(nullable = false)
    private LocalDate movedTo; // 이월 후 날짜

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now(); // 이월 시간 현재로
    }
}
