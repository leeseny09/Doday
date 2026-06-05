package com.doday.backend.batch;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/batch")
public class BatchController {

    private final JobLauncher jobLauncher;
    private final Job moveTodoJob;

    // 배치 수동 실행 api( 테스트용 )
    @PostMapping("/run")
    public ResponseEntity<String> ranBatch() throws Exception{

        JobParameters parameters = new JobParametersBuilder()
                .addLocalDateTime("time", LocalDateTime.now())
                // 날짜말고 시간으로 설정해서 테스트 할때마다 실행 가능하게
                .toJobParameters();
        jobLauncher.run(moveTodoJob,parameters);
        return ResponseEntity.ok("배치 실행 완료");
    }
}
