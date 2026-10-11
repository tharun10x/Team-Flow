package com.teamflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data 
public class TaskCommentRequest {
    @NotBlank(message = "Comment content cannot be empty")
    private String content;
}
