package com.doday.backend.domain.todo.service;

import com.doday.backend.domain.todo.dto.TodoCreateRequest;
import com.doday.backend.domain.todo.dto.TodoResponse;
import com.doday.backend.domain.todo.dto.TodoUpdateRequest;
import com.doday.backend.domain.todo.entity.Todo;
import com.doday.backend.domain.todo.repository.TodoRepository;
import com.doday.backend.domain.user.entity.User;
import com.doday.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.security.access.AccessDeniedException;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    // 투두 생성 메소드
    public TodoResponse createTodo(Long userId, TodoCreateRequest request){

        // 1. 유저아이디로 조회
        User user = userRepository.findById(userId)
                .orElseThrow(()->new NoSuchElementException("존재하지 않는 유저입니다."));

        // 2. todo 객체 만들기
        Todo todo = Todo.builder()
                .user(user)
                .title(request.getTitle())
                .category(request.getCategory())
                .scheduledDate(LocalDate.now())
                .deadlineTime(request.getDeadlineTime())
                .build();

        // 3. 디비 저장
        Todo savedTode = todoRepository.save(todo);

        // 4. todoresponse로 변환하여 반환
        return TodoResponse.builder()
                .id(savedTode.getId())
                .title(savedTode.getTitle())
                .category(savedTode.getCategory())
                .scheduledDate(savedTode.getScheduledDate())
                .deadlineTime(savedTode.getDeadlineTime())
                .isCompleted(savedTode.isCompleted())
                .moveCount(savedTode.getMoveCount())
                .build();


    }

    // 투두 조회 메소드
    public List<TodoResponse> getTodoByDate(Long userId, LocalDate data){

        // 1. 유저아이디 + 날짜로 할일 목록 조회
        List<Todo> todos = todoRepository.findByUserIdAndScheduledDate(userId,data);

        // 2, todo리스트 -> todoresponse 로 변환
        return todos.stream() //stream 리스트를 하나씩 처리하는 방식
                .map(todo -> TodoResponse.builder() // map -> 각 todo를 todoresponse로 변환 리스트의 각 요소를 다른 형태로 변환하는 메소드
                        .id(todo.getId())
                        .title(todo.getTitle())
                        .category(todo.getCategory())
                        .scheduledDate(todo.getScheduledDate())
                        .deadlineTime(todo.getDeadlineTime())
                        .isCompleted(todo.isCompleted())
                        .moveCount(todo.getMoveCount())
                        .build())
                .toList(); // 디시 리스트로 모으기
    }

    public TodoResponse updateTodo(Long userId, Long todoId, TodoUpdateRequest request){

        //1. todoid로 todo 조회
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(()-> new NoSuchElementException("존재하지 않는 할일 입니다."));

        //2. userid와 검증
        if (!todo.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("본인의 할일만 수정할 수 있습니다");
        }

        // 3. 투두수정
        todo.update(request.getTitle(), request.getCategory(), request.getDeadlineTime());

        // 4. 저장후반환
        Todo updatedTodo = todoRepository.save(todo);
        return TodoResponse.builder()
                .id(updatedTodo.getId())
                .title(updatedTodo.getTitle())
                .category(updatedTodo.getCategory())
                .scheduledDate(updatedTodo.getScheduledDate())
                .deadlineTime(updatedTodo.getDeadlineTime())
                .isCompleted(updatedTodo.isCompleted())
                .moveCount(updatedTodo.getMoveCount())
                .build();
    }

    public void deleteTodo(Long userId, Long todoId){

        // 1. todoid로 todo조회
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(()-> new NoSuchElementException("존재하지 않는 할일입니다."));

        // 2. 본인 todo인지 확인
        if (!todo.getUser().getId().equals(userId)){
            throw new AccessDeniedException("본인의 할일만 삭제할 수 있습니다.");
        }

        //3. 삭제
        todoRepository.delete(todo);
    }

    public void completeTodo(Long userId, Long todoId){

        // 1. todoid로 todo조회
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 할일입니다."));

        // 2. 본인 todo인지 확인
        if (!todo.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("본인의 할일만 완료할 수 있습니다.");
        }

        // 3. 완료 처리
        todo.complete(); 
        // 4. 저장
        todoRepository.save(todo);
    }

    public void uncompleteTodo(Long userId, Long todoId){

        // 1. todoid로 todo조회
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 할일입니다."));

        // 2. 본인 todo인지 확인
        if (!todo.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("본인의 할일만 수정할 수 있습니다.");
        }

        // 3. 완료 취소
        todo.uncomplete();
        // 4. 저장
        todoRepository.save(todo);
    }
}
