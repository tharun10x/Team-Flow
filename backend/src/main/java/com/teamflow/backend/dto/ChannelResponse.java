package com.teamflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class ChannelResponse {
    private Long id;
    private  String name;
    private Boolean isDirectMessage;
    private Long workspaceId;
}
