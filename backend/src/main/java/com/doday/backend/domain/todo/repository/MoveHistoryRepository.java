package com.doday.backend.domain.todo.repository;

import com.doday.backend.domain.todo.entity.MoveHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MoveHistoryRepository extends JpaRepository<MoveHistory, Long> {

    // 특정 할일의 전체 이월 이력 조회하기
    List<MoveHistory> findByTodo_Id(Long todoId);

    // 특정 유저의 전체 이월 이력 조회하기
    List<MoveHistory> findByTodo_User_Id(Long userId);
    // _는 연관 엔티티를 타고 들어가는 것, movehistory에 userId 컬럼 추가시
    // MoveHistory는 Todo와 연관관계가 있고
    // Todo에 이미 user_id가 있어서 todo → user 로 접근 가능
    // 컬럼 중복을 피하기 위해 findByTodo_User_Id로 설계
}
