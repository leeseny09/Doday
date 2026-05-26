package com.doday.backend.domain.todo.repository;

import com.doday.backend.domain.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo,Long> {

    // 메소드 매개변수 -> 메소드 이름의 조건 값
    // 오늘 내 할일 보여주는 메소드, id와 날짜
    List<Todo> findByUserIdAndScheduledDate(
            Long userId, LocalDate scheduledDate);
    // 오늘 날짜 전에 미완료인 할일, 내일로 넘겨야하는 것들ㄷ Batch용...
    List<Todo> findByScheduledDateBeforeAndIsCompletedFalse(
            LocalDate scheduledDateBefore);
    // 1분 간격으로 조회하는 알림 스케줄러용 메소드
    // Between은 범위 조회라 시작/끝 두 개가 필요해서 변수가 2개
    List<Todo> findByDeadlineTimeBetweenAndIsCompletedFalseAndAlarmSentFalse(
            LocalDateTime deadlineTimeStart, LocalDateTime deadlineTimeEnd
    );
}
