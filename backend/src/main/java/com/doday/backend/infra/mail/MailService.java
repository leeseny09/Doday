package com.doday.backend.infra.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MailService {

    private final RedisTemplate<String, String> redisTemplate;
    private final JavaMailSender mailSender;
    // JavaMailSender = Spring이 제공하는 이메일 발송 인터페이스
    // application-secret.yml의 mail 설정을 읽어서 자동으로 Bean 등록됨

    @Async
    // 이 메서드를 별도 스레드에서 비동기로 실행
    // @Async 없으면 이메일 다 보낼 때까지 API 응답이 안 됨
    // @Async 있으면 이메일 발송을 백그라운드에서 처리하고 바로 응답
    public void sendDeadlineAlarm(String toEmail, String todoTitle,
                                  Long todoId) {

        // 일회용 토큰 생성
        String completeToken = generateToken(todoId, "complete");
        String moveToken = generateToken(todoId, "move");

        // SimpleMailMessage = 텍스트 형식의 간단한 이메일 객체
        SimpleMailMessage message = new SimpleMailMessage();

        // 받는 사람 이메일 주소
        message.setTo(toEmail);

        // 이메일 제목
        message.setSubject("[Doday] 마감 알림: " + todoTitle);

        // 이메일 본문
        // 완료/이월 링크에 일회용 토큰 포함
        // 토큰이 있어야 로그인 없이 이메일에서 바로 처리 가능
        message.setText(
                "'" + todoTitle + "' 마감이 다가왔어요!\n\n" +
                        "✅ 완료했어요: http://localhost:8080/api/todo/" + todoId + "/complete?token=" + completeToken + "\n\n" +
                        "⏭️ 내일로 넘길게요: http://localhost:8080/api/todo/" + todoId + "/move?token=" + moveToken
        );
        mailSender.send(message); // 실제 이메일 발송
    }

    // 일회용 토큰 생성 메소드
    // 이메일 클릭시 로그인 없이 완료, 이월 처리가 되어야하기에
    // 일회용 토큰을 만들어서 redis에 저장하고 검증 후 처리
    private String generateToken(Long todoId, String type) {
        String token = UUID.randomUUID().toString();
        // "mail:complete:todoId" = token 형식으로 저장
        redisTemplate.opsForValue().set(
                "mail:" + type + ":" + todoId,
                token,
                24, TimeUnit.HOURS // 24시간 후 자동 삭제
        );
        return token;
    }
}
