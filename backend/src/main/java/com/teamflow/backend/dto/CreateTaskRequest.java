package com.teamflow.backend.dto;

import com.teamflow.backend.Entity.Enum.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateTaskRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    private String description;
    private Long assigneeId; // Optional: can be unassigned
    private TaskPriority priority = TaskPriority.MEDIUM;
    private LocalDateTime deadline;
}