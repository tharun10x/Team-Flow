package com.teamflow.backend.dto;

import lombok.Data;

@Data
public class ChatMessageDto {
    private String content;
    private Long channelId;
}
