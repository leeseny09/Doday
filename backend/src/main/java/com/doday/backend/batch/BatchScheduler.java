package com.doday.backend.batch;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class BatchScheduler {

    // 자정마다 자동으로 배치를 실행시키는 스케줄러

    private final JobLauncher jobLauncher;
    // JobLauncher = Job을 실제로 실행시키는 객체
    // Spring Batch가 자동으로 Bean 등록해줌

    private final Job moveTodoJob;
    // BatchConfig에서 만든 moveTodoJob Bean 주입
    // 이 Job을 JobLauncher가 실행함

    // 매일 자정에 실행 (00:00:00)
    // cron 표현식: 초 분 시 일 월 요일
    @Scheduled(cron = "0 0 0 * * *")
    public void runMoveTodoJob() throws Exception{
        JobParameters parameters = new JobParametersBuilder()
                .addLocalDate("data", LocalDate.now()) // 중복 실행 방지용 파라미터
                // 오늘 날짜를 파라미터로 추가
                // Spring Batch는 같은 파라미터로 실행된 Job은 재실행 안 함
                // 날짜를 파라미터로 넣어야 매일 새로운 Job으로 인식해서 실행됨
                // 없으면 "이미 실행된 Job"으로 인식해서 자정에 안 돌아감!
                .toJobParameters();
        jobLauncher.run(moveTodoJob,parameters);
        // JobLauncher로 moveTodoJob 실행
        // params = 오늘 날짜 (중복 실행 방지)
    }
}
