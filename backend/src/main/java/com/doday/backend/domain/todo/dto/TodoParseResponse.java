package com.doday.backend.domain.todo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TodoParseResponse {

    // 사용자가 자연어 입력 -> ai가 파싱한 결과 담는 dto
    private String title;
    private LocalDateTime deadlineTime;
}
