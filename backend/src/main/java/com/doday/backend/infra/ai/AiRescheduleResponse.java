package com.doday.backend.infra.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class AiRescheduleResponse {

    // AI 재배치 결과 담을 dto

    private String recommendedTime; // 추천 시간대 -> 14:00
    private String reason; // 배치 이유
}
