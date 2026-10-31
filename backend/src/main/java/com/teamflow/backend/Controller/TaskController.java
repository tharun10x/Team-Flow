package com.teamflow.backend.Controller;

import com.teamflow.backend.Security.UserPrincipal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.teamflow.backend.Entity.Task;
import com.teamflow.backend.Entity.Enum.TaskPriority;
import com.teamflow.backend.Entity.Enum.TaskStatus;
import com.teamflow.backend.Repository.UserRepository;
import com.teamflow.backend.Service.TaskService;
import com.teamflow.backend.dto.ApiResponse;
import com.teamflow.backend.dto.CreateTaskRequest;
import com.teamflow.backend.dto.TaskCommentRequest;
import com.teamflow.backend.dto.TaskCommentResponse;
import com.teamflow.backend.dto.TaskResponse;
import com.teamflow.backend.dto.UpdateTaskRequest;
import com.teamflow.backend.dto.UpdateTaskStatusRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor 
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    private Long getUserId(UserPrincipal userPrincipal, Authentication authentication) {
        if (userPrincipal != null && userPrincipal.getId() != null) {
            return userPrincipal.getId();
        }
        if (authentication != null && authentication.getName() != null) {
            return userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();
        }
        String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    // 1. Workspace-scoped endpoints
    @PostMapping("/workspaces/{workspaceId}/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
        @PathVariable Long workspaceId,
        @Valid @RequestBody CreateTaskRequest request,
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        Authentication authentication
    ){
        Long userId = getUserId(userPrincipal, authentication);
        TaskResponse response = taskService.createTask(workspaceId, request, userId);
         return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Task created successfully"));
    }
    
    @GetMapping("/workspaces/{workspaceId}/tasks")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getWorkspaceTasks(
        @PathVariable Long workspaceId,
        @RequestParam(required = false) TaskStatus status,
        @RequestParam(required = false) TaskPriority priority,
        @RequestParam(required = false) Long assigneeId,
        @RequestParam(required = false) String search,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        Authentication authentication
    ){
        Long userId = getUserId(userPrincipal, authentication);
        Page<TaskResponse> tasks = taskService.getWorkspaceTasks(workspaceId, status, priority, assigneeId, search, pageable, userId);
        return ResponseEntity.ok(ApiResponse.success(tasks, "Tasks fetched successfully")); 
    }
    // 2. Task-scoped endpoints
    @GetMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(
        @PathVariable Long id, 
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        Authentication authentication
    ){
        Long userId = getUserId(userPrincipal, authentication);
        TaskResponse response = taskService.getTaskById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Task fetched successfully"));
    }
    @PutMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
        @PathVariable Long id, 
        @Valid @RequestBody UpdateTaskRequest request, 
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        Authentication authentication
    ){
        Long userId = getUserId(userPrincipal, authentication);
        TaskResponse response = taskService.updateTask(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Updated task successfully"));
    }
    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateStatus(
        @PathVariable Long id, 
        @Valid @RequestBody UpdateTaskStatusRequest request, 
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        Authentication authentication
    ){
        Long userId = getUserId(userPrincipal, authentication);
        TaskResponse response = taskService.updateTaskStatus(id, request.getStatus(), userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Status updated successfully"));
    }
    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
        @PathVariable Long id, 
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        Authentication authentication
    ){
        Long userId = getUserId(userPrincipal, authentication);
        taskService.deleteTask(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted successfully"));
    }
    // 3. Comments
    @PostMapping("/tasks/{id}/comments")
    public ResponseEntity<ApiResponse<TaskCommentResponse>> addComment(
        @PathVariable Long id, 
        @Valid @RequestBody TaskCommentRequest request, 
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        Authentication authentication
    ){
        Long userId = getUserId(userPrincipal, authentication);
        TaskCommentResponse response = taskService.addComment(id, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Comment added successfully"));
    }
    @GetMapping("/tasks/{id}/comments")
    public ResponseEntity<ApiResponse<List<TaskCommentResponse>>> getComments(
        @PathVariable Long id, 
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        Authentication authentication
    ){
        Long userId = getUserId(userPrincipal, authentication);
        List<TaskCommentResponse> comments = taskService.getComments(id, userId);
        return ResponseEntity.ok(ApiResponse.success(comments, "Comments fetched successfully"));
    }
}
