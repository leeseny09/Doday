package com.doday.backend.batch;

import com.doday.backend.domain.todo.entity.MoveHistory;
import com.doday.backend.domain.todo.entity.Todo;
import com.doday.backend.domain.todo.repository.MoveHistoryRepository;
import com.doday.backend.domain.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
public class BatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final TodoRepository todoRepository;
    private final MoveHistoryRepository moveHistoryRepository;

    // job 설정
    // 전체 배치 작업 묶기
    @Bean
    public Job moveTodoJob() {
        return new JobBuilder("moveTodoJob", jobRepository)
                .start(moveTodoStep())
                .build();
    }

    // Step 설정
    // 실제 처리 단계 Reader -> Processor -> Writer
    @Bean
    public Step moveTodoStep() {
        return new StepBuilder("moveTodoStep", jobRepository)
                .<Todo, Todo>chunk(50, transactionManager)
                // chunk(50) = 50개씩 묶어서 처리
                .reader(todoItemReader())  // 오늘 날짜 전 미완료 할 일 db에서 읽기
                .processor(todoItemProcessor()) //
                .writer(todoItemWriter())
                .build();
    }

    @Bean
    // 오늘 날짜 전 미완료 할일 조회
    public ItemReader<Todo> todoItemReader(){

        return new ListItemReader<>(todoRepository.findByScheduledDateBeforeAndIsCompletedFalse(LocalDate.now()));
        // listitemreader -> 리스트를 하나씩 읽어주는 reader
    }

    @Bean
    // 읽어온 todo의날짜를 내일로 변경, movecount +1
    public ItemProcessor<Todo, Todo> todoItemProcessor() {

        return todo -> {
            // scheduledDate를 내일로 변경
            todo.move();
            return todo;
        };
    }

    @Bean
    @StepScope // @StepScope = Step 실행 시점에 Bean 생성 (매번 새로 읽어옴)
    // 변경 된 todo 저장 및 이월 기록 생성
    public ItemWriter<Todo> todoItemWriter() {
        return todos -> {
            for (Todo todo : todos) {
                // 1. 변경된 todo 저장
                todoRepository.save(todo);

                // 2. 이월 이력 생성
                MoveHistory history = MoveHistory.builder()
                        .todo(todo)
                        .movedFrom(todo.getScheduledDate().minusDays(1)) // 이월 전 날짜
                        .movedTo(todo.getScheduledDate()) // 이월 후 날짜
                        .build();

                moveHistoryRepository.save(history);
            }
        };
    }


}
