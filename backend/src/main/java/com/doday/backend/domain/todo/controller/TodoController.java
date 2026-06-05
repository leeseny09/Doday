package com.doday.backend.domain.todo.controller;

import com.doday.backend.domain.todo.dto.TodoCreateRequest;
import com.doday.backend.domain.todo.dto.TodoResponse;
import com.doday.backend.domain.todo.dto.TodoUpdateRequest;
import com.doday.backend.domain.todo.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/todo")
public class TodoController {

    private final TodoService todoService;

    // 할일 생성
    // 클라이언트가 api 요청시, 필터가 요청 가로채서 토큰에서 유저 정보 추출 후
    // 시큐리티컨텍스트에 저장 됨 ! 그래서 바로 꺼내서 사용
    @PostMapping("")
    public ResponseEntity<TodoResponse> createTodo(@RequestBody @Valid TodoCreateRequest request) {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ResponseEntity.ok(todoService.createTodo(userId, request));
    }

    // 날짜별 할일 조회
    @GetMapping
    public ResponseEntity<List<TodoResponse>> getTodosByDate(
            @RequestParam LocalDate date) {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ResponseEntity.ok(todoService.getTodoByDate(userId, date));
    }

    // 할일 수정
    @PatchMapping("/{todoId}")
    public ResponseEntity<TodoResponse> updateTodo(
            @PathVariable Long todoId,
            @RequestBody TodoUpdateRequest request) {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ResponseEntity.ok(todoService.updateTodo(userId, todoId, request));
    }

    // 할일 삭제
    @DeleteMapping("/{todoId}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long todoId) {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        todoService.deleteTodo(userId, todoId);
        return ResponseEntity.ok().build();
    }

    // 할일 완료
    @PatchMapping("/{todoId}/complete")
    public ResponseEntity<Void> completeTodo(@PathVariable Long todoId) {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        todoService.completeTodo(userId, todoId);
        return ResponseEntity.ok().build();
    }

    // 할일 완료 취소
    @PatchMapping("/{todoId}/uncomplete")
    public ResponseEntity<Void> uncompleteTodo(@PathVariable Long todoId) {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        todoService.uncompleteTodo(userId, todoId);
        return ResponseEntity.ok().build();
    }

}
