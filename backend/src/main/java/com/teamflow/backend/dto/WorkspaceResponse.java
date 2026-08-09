package com.teamflow.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceResponse {
    private Long id;
    private String name;
    private String description;
    private String inviteCode;
    private String ownerName;
    private Long ownerId;
    private String currentUserRole;   // The role of whoever is requesting this
    private int memberCount;
    private List<MemberInfo> members;  // Optional — only included in detailed views
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberInfo {
        private Long userId;
        private String name;
        private String email;
        private String avatarUrl;
        private String role;
        private LocalDateTime joinedAt;
    }
}
