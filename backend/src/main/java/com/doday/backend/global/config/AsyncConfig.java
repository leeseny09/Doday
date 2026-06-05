package com.doday.backend.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync // @Async 어노테이션 활성화 → 이걸 켜야 @Async가 동작함
public class AsyncConfig {

    // 이메일 발송은 시간이 걸리기에 동기로 처리하면 이메일을 다 보낼때까지 사용자가 대기
    // @Async 를 사용하면 이메일 발송을 백그라운드에서 처리 가능함

    @Bean
    public Executor asyncExecutor() {

        // ThreadPoolTaskExecutor = 비동기 작업을 처리하는 스레드 풀
        // 스레드 풀 = 미리 만들어둔 스레드 여러 개를 재사용하는 방식
        // 이메일 발송 같은 오래 걸리는 작업을 별도 스레드에서 처리
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setCorePoolSize(2);
        // 기본으로 유지할 스레드 수
        // 동시에 이메일 2개까지 발송 가능

        executor.setMaxPoolSize(5);
        // 최대 스레드 수
        // 동시 요청이 많아지면 최대 5개까지 늘어남

        executor.setQueueCapacity(10);
        // 스레드가 다 차면 대기열에 최대 10개까지 쌓아둠
        // 대기열도 꽉 차면 예외 발생


        executor.setThreadNamePrefix("async-");
        // 스레드 이름 prefix
        // 로그에서 "async-1", "async-2" 형태로 확인 가능

        executor.initialize(); // 설정 완료 후 초기화
        return executor;
        }
    }

