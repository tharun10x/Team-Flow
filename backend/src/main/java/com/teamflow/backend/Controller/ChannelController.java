package com.teamflow.backend.Controller;

import com.teamflow.backend.Entity.User;
import com.teamflow.backend.Service.ChannelService;
import com.teamflow.backend.Service.UserService;
import com.teamflow.backend.dto.ApiResponse;
import com.teamflow.backend.dto.ChannelResponse;
import com.teamflow.backend.dto.createChannel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChannelController {

    private final ChannelService channelService;
    private final UserService userService;

    @GetMapping("/workspaces/{workspaceId}/channels")
    public ResponseEntity<ApiResponse> getChannels(@PathVariable Long workspaceId) {
        try {
            User user = getCurrentUser();
            List<ChannelResponse> channels = channelService.getChannelsForWorkspace(workspaceId, user.getId());
            return ResponseEntity.ok(ApiResponse.success(channels, "Fetched all channels"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/workspaces/{workspaceId}/channels")
    public ResponseEntity<ApiResponse> createChannel(
            @PathVariable Long workspaceId,
            @RequestBody createChannel dto
    ) {
        try {
            ChannelResponse createdChannel = channelService.createChannel(workspaceId, dto);
            return ResponseEntity.ok(ApiResponse.success(createdChannel, "Channel created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUser(email);
    }
}