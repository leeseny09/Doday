package com.doday.backend.infra.ai;

import com.doday.backend.domain.todo.entity.Todo;
import com.doday.backend.domain.todo.repository.TodoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiRescheduleService {

    @Value("${gemini.api-key}")
    private String apiKey;
    // api 키값 주입

    private final TodoRepository todoRepository;

    // RestTemplate = HTTP 요청을 보내는 Spring 도구
    private final RestTemplate restTemplate = new RestTemplate();

    public AiRescheduleResponse reschedule(Long todoId) {

        // 1. 이월한 할일 조회
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 할일입니다."));


        // 2. 내일 할일 목록 조회
        // 이월된 할일을 배치할 내일 일정을 파악하기 위해
        List<Todo> tomorrowTodos = todoRepository.findByUserIdAndScheduledDate(
                todo.getUser().getId(),
                LocalDate.now().plusDays(1) // 내일 날짜
        );

        // 3. 내일 할일 목록을 문자열로 변환 -> ai 프롬프트 용
        String tomorrowTodoList = tomorrowTodos.stream()
                .map(t -> t.getTitle() + (t.getDeadlineTime() != null ? " (" + t.getDeadlineTime() + ")" : ""))
                .collect(Collectors.joining("\n"));

        // 4. 프롬프트 작성
        // AI에게 내일 일정 분석 후 최적 시간대 추천 요청
        String prompt = """
                이월할 할일: %s
                내일 등록된 할일 목록:
                %s
                
                내일 일정을 분석해서 이월된 할일을 배치하기 좋은 최적 시간대를 추천해주세요.
                반드시 아래 JSON 형식으로만 응답하세요.
                {"recommendedTime": "HH:mm", "reason": "배치 이유 한 줄"}
                """.formatted(todo.getTitle(), tomorrowTodoList.isEmpty() ? "없음" : tomorrowTodoList);
        // tomorrowTodoList.isEmpty() ? "없음" = 내일 할일이 없으면 "없음"으로 표시

        // 5. Gemini API 호출 (AiParsingService와 동일한 방식)
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );
        Map response = restTemplate.postForObject(url, body, Map.class);
        // postForObject = POST 요청 보내고 응답을 Map으로 받기

        // 6. 응답 텍스트 추출
        List candidates = (List) ((Map) response).get("candidates");
        String text = (String) ((Map) ((List) ((Map) ((Map) candidates.get(0)).get("content")).get("parts")).get(0)).get("text");

        // 7. JSON 파싱
        return parseJson(text);
    }

    private AiRescheduleResponse parseJson(String text) {
        try {
            // 마크다운 코드블록 제거 (```json ... ```)
            String cleaned = text.trim()
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(cleaned, AiRescheduleResponse.class);
            // readValue = JSON 문자열 → AiRescheduleResponse 객체로 변환

        } catch (Exception e) {
            // 파싱 실패 시 기본값 반환
            return new AiRescheduleResponse("09:00", "기본 시간대로 배치했어요.");
        }
    }
}