package com.teamflow.backend.dto;

import com.teamflow.backend.Entity.Enum.TaskStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data 
public class UpdateTaskStatusRequest {
    @NotNull(message = "Status is required")
    private TaskStatus status;
}