package com.doday.backend.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis 설정 클래스
 * RedisTemplate의 직렬화 방식을 String으로
 * 기본 설정으로는 키/값이 바이트 배열로 저장되어 redis-cli에서 알아볼 수 없음
 * StringRedisSerializer 사용 시 "refresh:1" 같은 형태로 읽기 가능하게 저장됨
 */

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String,String> redisTemplate(RedisConnectionFactory connectionFactory){
        // RedisConnectionFactory = application.yml의 Redis 연결 정보(host, port)를
        // Spring이 자동으로 만들어서 주입

        RedisTemplate<String,String> template = new RedisTemplate<>();
        // RedisTemplate = Redis에 데이터를 읽고 쓰는 도구
        // <String, String> = 키와 값 모두 String 타입으로 사용

        template.setConnectionFactory(connectionFactory);
        // Redis 서버와 실제로 연결하는 설정
        // 이 설정이 없으면 Redis에 접근 자체가 불가능

        template.setKeySerializer(new StringRedisSerializer());
        // 키를 String으로 직렬화
        // ex) "refresh:1" → Redis에 "refresh:1" 그대로 저장
        // 기본값(JdkSerializationRedisSerializer) 사용 시 알 수 없는 바이트로 저장됨

        template.setValueSerializer(new StringRedisSerializer());
        // 설정 완료된 RedisTemplate을 Spring Bean으로 등록
        // 다른 클래스에서 RedisTemplate<String, String>을 주입받으면 이 Bean이 사용됨

        return template;

    }
}
