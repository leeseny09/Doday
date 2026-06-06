package com.doday.backend.infra.ai;


import com.doday.backend.domain.todo.dto.TodoParseResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class AiParsingService {

    // 자연어 -> 제미나이 api 호출 -> 파싱 -> 반환

    @Value("${gemini.api-key}")
    private String apiKey;
    // 어플리케이션 파일의 gemini apikey 주입 받기

    // RestTemplate = HTTP 요청을 보내는 Spring 도구
    // Gemini API는 REST API라서 HTTP POST 요청으로 호출
    private final RestTemplate restTemplate = new RestTemplate();

    public TodoParseResponse parse(String input) {

        // Gemini API 엔드포인트 URL
        // key= 뒤에 API 키를 붙여서 인증
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;        // 프롬프트
        // Gemini에게 어떻게 응답할지 지시하는 텍스트
        String prompt = """
            오늘 날짜는 %s입니다.
            다음 텍스트에서 할일 제목과 마감시간을 추출해주세요.
            반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.
            마감시간이 없으면 deadlineTime은 null로 하세요.
            {"title": "할일 제목", "deadlineTime": "yyyy-MM-ddTHH:mm:ss 또는 null"}
            입력: %s
            """.formatted(LocalDate.now(), input);
        // %s 자리에 오늘 날짜와 사용자 입력값이 들어감
        // 오늘 날짜를 넣는 이유: "내일", "모레" 같은 상대적 날짜를 AI가 계산할 수 있게

        // Gemini API 요청 바디 구성
        // Gemini API가 요구하는 JSON 형식
        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)  // "text" 키에 프롬프트 넣기
                        ))
                )
        );

        // Gemini API 호출
        // postForObject = POST 요청 보내고 응답을 Map으로 받기
        Map response = restTemplate.postForObject(url, body, Map.class);

        // 응답에서 텍스트 추출
        // Gemini 응답 구조: candidates[0].content.parts[0].text
        List contents = (List) ((Map) response).get("candidates");
        Map candidate = (Map) contents.get(0);
        Map content = (Map) candidate.get("content");
        List parts = (List) content.get("parts");
        String text = (String) ((Map) parts.get(0)).get("text");
        // text = AI가 응답한 JSON 문자열

        // JSON 파싱
        return parseJson(text);
    }

    private TodoParseResponse parseJson(String text) {

            try {
                // 마크다운 코드블록 제거 (```json ... ```)
                String cleaned = text.trim()
                        .replaceAll("```json", "")
                        .replaceAll("```", "")
                        .trim();

                ObjectMapper mapper = new ObjectMapper();
                // JavaTimeModule = LocalDateTime 같은 Java 시간 타입을 JSON으로 변환할 때 필요
                mapper.registerModule(new JavaTimeModule());
                return mapper.readValue(cleaned, TodoParseResponse.class);
                // readValue = JSON 문자열 → Java 객체로 변환

            } catch (Exception e) {
                // AI 응답이 JSON 형식이 아닐 때 (파싱 실패)
                // 입력값 그대로 제목으로 사용하고 마감시간은 null로 반환
                return new TodoParseResponse(text, null);
            }
        }
    }

