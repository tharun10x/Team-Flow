package com.teamflow.backend.dto;

import java.time.LocalDateTime;

import com.teamflow.backend.Entity.Enum.TaskPriority;
import com.teamflow.backend.Entity.Enum.TaskStatus;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class TaskResponse {
    private Long id;
    private Long workspaceId;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDateTime deadline;
    private LocalDateTime completedAt;
    private Boolean isOverdue;
    private UserSummary assignee;
    private UserSummary createdBy;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class UserSummary {
        private Long id;
        private String name;
        private String email;
        private String avatarUrl;
    }
}