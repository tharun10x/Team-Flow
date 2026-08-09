package com.teamflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinWorkspaceRequest {
    @NotBlank(message = "Invite code is required")
    private String inviteCode;
}