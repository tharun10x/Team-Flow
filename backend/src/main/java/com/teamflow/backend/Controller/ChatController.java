package com.teamflow.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamflow.backend.Service.MessageService;
import com.teamflow.backend.dto.ApiResponse;
import com.teamflow.backend.dto.ChatMessageDto;
import com.teamflow.backend.dto.MessageResponse;


import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(
        @Payload ChatMessageDto chatMessageDto,
        Authentication authentication
    ) {
        String username = authentication.getName();
        
        MessageResponse savedMessage = messageService.saveMessage(chatMessageDto, username);
        
        messagingTemplate.convertAndSend("/topic/channel/" + chatMessageDto.getChannelId(), savedMessage);
    }

    @GetMapping("/api/channels/{channelId}/messages")
    
    public ResponseEntity<ApiResponse> getMessageHistory(
        @PathVariable Long channelId,
        @RequestParam (defaultValue = "0") int page,
        @RequestParam (defaultValue = "50") int size,
        Authentication authentication 
    ) {
        try {
            String username = authentication.getName();
            
            List<MessageResponse> messages = messageService.getWorkspaceMessages(
                                                                    channelId,
                                                                    username,
                                                                    page,
                                                                    size);
            return ResponseEntity.ok(ApiResponse.success(messages, "Messages fetched successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping ("/api/messages/{id}")
    public ResponseEntity<ApiResponse> updateMessage(
        @PathVariable Long id,
        @RequestBody ChatMessageDto msg,
        Authentication authentication
    ){
        try {

            String username = authentication.getName();
            MessageResponse response = messageService.editMessage(
                id,
                msg.getContent(),
                username);

            return ResponseEntity.ok(ApiResponse.success(response, "Messages updated successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/api/messages/{id}")
    public ResponseEntity<ApiResponse> deleteMessage(
        @PathVariable Long id,
        Authentication authentication
    ){
        try {

            String username = authentication.getName();
            MessageResponse deleted = messageService.deleteMessage(id, username);
            return ResponseEntity.ok(ApiResponse.success(deleted, "Messages deleted successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }
}
