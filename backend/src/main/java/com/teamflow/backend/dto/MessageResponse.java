package com.teamflow.backend.dto;

import java.time.Instant;
import java.util.List;

import com.teamflow.backend.Entity.Enum.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private String content;
    private Long senderId;
    private String senderName;
    private String senderAvatar; 
    private Instant timestamp;
    private Long channelId;
    private MessageType type;
    private Boolean isEdited;
    private Boolean isDeleted;
    private Long replyToId;
    private Instant updatedAt;

    private List<ReactionResponse> reactions;

}
