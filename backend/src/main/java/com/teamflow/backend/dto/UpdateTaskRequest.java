package com.teamflow.backend.dto;

import java.time.LocalDateTime;

import com.teamflow.backend.Entity.Enum.TaskPriority;
import com.teamflow.backend.Entity.Enum.TaskStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data 
public class UpdateTaskRequest {
    @NotBlank (message = "Title is required")
    private String title;
    private String description;
    private Long assigneeId;
    private TaskPriority priority;
    private TaskStatus status;
    private LocalDateTime deadline;
}