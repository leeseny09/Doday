package com.doday.backend.domain.report.service;

import com.doday.backend.domain.report.dto.WeeklyReportResponse;
import com.doday.backend.domain.todo.entity.Todo;
import com.doday.backend.domain.todo.repository.MoveHistoryRepository;
import com.doday.backend.domain.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WeeklyReportService {

    // 주간리포트 서비스

    private final TodoRepository todoRepository;
    private final MoveHistoryRepository moveHistoryRepository;

    public WeeklyReportResponse getWeeklyReport(Long userId) {

        // 이번주 할일 통계 계산 후 반환하는 메소드

        // 1. 이번주 시작일과 종료일 계산 월~일
        LocalDate today = LocalDate.now();

        // DayOfWeek.MONDAY = 이번 주 월요일로 이동
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);

        // DayOfWeek.SUNDAY = 이번 주 일요일로 이동
        LocalDate weekEnd = today.with(DayOfWeek.SUNDAY);

        // 2. 이번주 할 일 목록 조회
        // 위에서 구한 월 ~ 일 까지의 모든 할일 조회
        List<Todo> todos = new ArrayList<>();

        // !date.isAfter(weekEnd) = date가 일요일을 넘지 않는 동안 반복
        // date.plusDays(1) = 하루씩 증가 (월→화→수→목→금→토→일)
        for (LocalDate date = weekStart; !date.isAfter(weekEnd); date = date.plusDays(1)) {

            // 해당 날짜의 내 할일 전부 가져와서 todos에 추가
            todos.addAll(todoRepository.findByUserIdAndScheduledDate(userId, date));
        }

        // 3. 통계 계산

        // 이번 주 전체 할일 수
        // 리스트에 담긴 할일 개수
        int totalTodos = todos.size();

        // 완료된 할일 수
        // stream().filter() = 완료된 할일만 필터링, stream -> 리스트를 하나씩 처리하는 방식으로 변환
        // Todo::isCompleted = isCompleted가 true인 것만 카운트 todo.isCompleted() 와 동일한 표현
        int completedTodos = (int) todos.stream().filter(Todo::isCompleted).count();
        // count 함수가 long 타입 반환이라 int로 형변환

        // 이월된 할일 수
        // t -> t.getMoveCount() > 0 = 람다식, moveCount가 0보다 크면 통과
        // moveCount > 0 = 한 번이라도 이월된 할일
        int movedTodos = (int) todos.stream().filter(t -> t.getMoveCount() > 0).count();

        // totalTodos == 0 ? 0 = 할일이 없으면 0% (0으로 나누기 방지) -> 삼항연산자
        // 완료율 = 완료한 수 / 전체 수 * 100 / 소수점 계산을 위해 double로 형변환
        double completionRate = totalTodos == 0 ? 0 : (double) completedTodos / totalTodos * 100;

        // 4. 반환
        return WeeklyReportResponse.builder()
                .weekStartDate(weekStart)
                .totalTodos(totalTodos)
                .completedTodos(completedTodos)
                .movedTodos(movedTodos)
                // Math.round(* 10.0) / 10.0 = 소수점 첫째자리까지 반올림
                // ex) 66.666... → 66.7
                .completionRate(Math.round(completionRate * 10.0) / 10.0)
                .build();
    }
}
