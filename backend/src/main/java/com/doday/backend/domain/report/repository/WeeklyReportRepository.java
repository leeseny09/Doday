package com.doday.backend.domain.report.repository;

import com.doday.backend.domain.report.entity.WeeklyReport;
import com.doday.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, Long> {

    // 특정 유저의 특정 주차 리포트 조회
    // 주차별 리포트 있을수도, 없을수도 -> 널이어도 안전하게
    Optional<WeeklyReport> findByUserAndWeekStartDate(User user, LocalDate weekStartDate);
    // 특정 유저의 전체 리포트 조회
    List<WeeklyReport> findByUser(User user);
}
