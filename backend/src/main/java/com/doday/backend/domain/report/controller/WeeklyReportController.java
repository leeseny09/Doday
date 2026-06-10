package com.doday.backend.domain.report.controller;

import com.doday.backend.domain.report.dto.WeeklyReportResponse;
import com.doday.backend.domain.report.service.WeeklyReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/report")
public class WeeklyReportController {

    private final WeeklyReportService weeklyReportService;

    // 이번주 리포트 조회 api
    // 로그인 한 사용자의 이번주 할일 통계 반환
    @GetMapping("/weekly")
    public ResponseEntity<WeeklyReportResponse> getWeeklyReport(){

        // SecurityContext에서 현재 로그인한 유저 ID 꺼내기
        // JwtAuthenticationFilter에서 토큰 파싱 후 저장해둔 값
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        // 200 OK + WeeklyReportResponse JSON 반환
        return ResponseEntity.ok(weeklyReportService.getWeeklyReport(userId));
    }
}
