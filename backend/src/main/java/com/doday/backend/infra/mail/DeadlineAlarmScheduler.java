package com.doday.backend.infra.mail;

import com.doday.backend.domain.todo.entity.Todo;
import com.doday.backend.domain.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DeadlineAlarmScheduler {

    private final TodoRepository todoRepository;
    private final MailService mailService;

    // 1분마다 실행
    @Scheduled(cron = "0 * * * * *")
    public void sendDeadlineAlarms() {

        LocalDateTime now = LocalDateTime.now(); // 현재 시간
        LocalDateTime start = now.minusMinutes(1); // 1분 전
        LocalDateTime end = now.plusMinutes(1); // 1분 후

        // 마감시간이 +,- 1분이고, 미완료 + 알림 안 보낸 할일 조회
        // 이 조건에 맞는 todo만 이메일 발송
        List<Todo> todos = todoRepository
                .findByDeadlineTimeBetweenAndIsCompletedFalseAndAlarmSentFalse(start, end);

        for (Todo todo : todos) {
            // 이메일 발송 - 백그라운드에서 처리
            mailService.sendDeadlineAlarm(
                    todo.getUser().getEmail(), // 받는 사람
                    todo.getTitle(), // 할일 제목
                    todo.getId() // 할일 ID ( 이메일 링크에 사용 )
            );
            // alarmSent = true로 변경 (중복 발송 방지)
            // 같은 할일에 알림이 중복으로 발송되는 것을 방지함
            todo.markAlarmSent();
            todoRepository.save(todo);
        }
    }
}
