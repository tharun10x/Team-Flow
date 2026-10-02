package com.teamflow.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor 
@AllArgsConstructor
@Data 
public class ReactionResponse {
    private String emoji;
    private int count;
    private List<Long> userIds;
}
