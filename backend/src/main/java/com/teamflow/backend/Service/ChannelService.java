package com.teamflow.backend.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.teamflow.backend.Entity.Channel;
import com.teamflow.backend.Entity.Workspace;
import com.teamflow.backend.Repository.ChannelRepository;
import com.teamflow.backend.Repository.UserRepository;
import com.teamflow.backend.Repository.WorkspaceRepository;
import com.teamflow.backend.dto.ChannelResponse;
import com.teamflow.backend.dto.createChannel;

@Service 
public class ChannelService {
    @Autowired 
    WorkspaceRepository workspaceRepository;
    @Autowired 
    ChannelRepository channelRepository;
    @Autowired 
    UserRepository userRepository;
    
    public ChannelResponse createChannel(Long workspaceId, createChannel dto){
        Workspace workspace = workspaceRepository.findById(workspaceId)
        .orElseThrow(()->new RuntimeException("Workspace not Found!"));

        String formattedName = dto.getName().trim().toLowerCase().replaceAll("\\s+", "-");

        Channel channel = Channel.builder()
                .name(formattedName)
                .workspace(workspace)
                .isDirectMessage(false)
                .build();

        Channel savedChannel =  channelRepository.save(channel);
        return toResponse(savedChannel);
    }

    public List<ChannelResponse> getChannelsForWorkspace(Long workspaceId, Long userId ){
        userRepository.findById(userId).orElseThrow(()-> new RuntimeException("User not Found"));

        List<Channel> channels = channelRepository.findByWorkspaceId(workspaceId);
        return channels.stream()
        .map(this::toResponse)
        .toList();
    }

    private ChannelResponse toResponse(Channel channel){
        return new ChannelResponse(
            channel.getId(),
            channel.getName(),
            channel.getIsDirectMessage(),
            channel.getWorkspace() != null ? channel.getWorkspace().getId() : null
        );
    }
}
