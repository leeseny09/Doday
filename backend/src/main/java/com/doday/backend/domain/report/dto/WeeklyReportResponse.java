package com.doday.backend.domain.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
@Builder
public class WeeklyReportResponse {

    private LocalDate weekStartDate;  // 매주 시작 날짜
    private int totalTodos;           // 전체 할일 수
    private int completedTodos;       // 완료한 할일 수
    private int movedTodos;           // 이월한 할일 수
    private double completionRate;    // 완료율 %값

}
