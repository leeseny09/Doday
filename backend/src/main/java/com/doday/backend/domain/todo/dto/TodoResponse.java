package com.doday.backend.domain.todo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class TodoResponse {

    private Long id;
    private String title;
    private String category;
    private LocalDate scheduledDate;
    private LocalDateTime deadlineTime;
    private boolean isCompleted;
    private int moveCount;

}
