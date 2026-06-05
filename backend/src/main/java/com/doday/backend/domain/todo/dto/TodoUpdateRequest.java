package com.doday.backend.domain.todo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TodoUpdateRequest {

    private String title; // 할일 제목 ( 필수 )

    private String category; // 카테고리 ( 선택 )

    private LocalDateTime deadlineTime; // 마감 시간 ( 선택 )
}
