package com.teamflow.backend.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class TaskCommentResponse {
    private Long id;
    private Long taskId;
    private TaskResponse.UserSummary user;
    private String content;
    private LocalDateTime createdAt;
}