package com.teamflow.backend.Service;


import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.teamflow.backend.Entity.Message;
import com.teamflow.backend.Entity.MessageReaction;
import com.teamflow.backend.Entity.User;
import com.teamflow.backend.Entity.WorkspaceMember;
import com.teamflow.backend.Entity.Enum.Role;
import com.teamflow.backend.Repository.ChannelRepository;
import com.teamflow.backend.Repository.MessageReactionRepository;
import com.teamflow.backend.Repository.MessageRepository;
import com.teamflow.backend.Repository.UserRepository;
import com.teamflow.backend.Repository.WorkspaceMemberRepository;
import com.teamflow.backend.Repository.WorkspaceRepository;
import com.teamflow.backend.dto.ChatMessageDto;
import com.teamflow.backend.dto.MessageResponse;
import com.teamflow.backend.dto.ReactionResponse;

import jakarta.transaction.Transactional;

import com.teamflow.backend.Entity.Channel;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ChannelRepository channelRepository;
    private final MessageReactionRepository messageReactionRepository;

    private final WorkspaceMemberRepository workspaceMemberRepository;

    private final SimpMessagingTemplate messagingTemplate;

    @Transactional 
    public MessageResponse saveMessage(
        ChatMessageDto chatMessageDto,
        String username
    ){
        User sender = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
         Channel channel = channelRepository.findById(chatMessageDto.getChannelId())
                .orElseThrow(() -> new RuntimeException("Channel not found"));
                
        validateMembership(channel.getWorkspace().getId(), sender.getId());

        // Optionally: Check if user is a member of the workspace here!

        Message message = Message.builder()
                .content(chatMessageDto.getContent())
                .sender(sender)
                .channel(channel)
                .build();

        Message savedMessage = messageRepository.save(message);

        return mapToResponse(savedMessage);
    }

    public List<MessageResponse> getWorkspaceMessages(
        Long channelId,
        String username,
        int page,
        int size
    ) {

        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Channel channel = channelRepository.findById(channelId)
            .orElseThrow(() -> new RuntimeException("Channel not found"));

        validateMembership(channel.getWorkspace().getId(), user.getId());

        Pageable pageable = PageRequest.of(page, size);

        Page<Message> messages = messageRepository.findByChannelIdOrderByTimestampDesc(channelId, pageable);

        return messages.getContent()
        .stream()
        .sorted(Comparator.comparing(Message::getTimestamp))
        .map(this::mapToResponse)
        .toList();

    }

    @Transactional
    public MessageResponse editMessage(
        Long messageId,
        String newContent,
        String username
    ){
        User sender = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getId().equals(sender.getId())) {
            throw new RuntimeException("You can only edit your own messages");
        }

        if (Boolean.TRUE.equals(message.getIsDeleted())) {
            throw new RuntimeException("Cannot edit a deleted message");
        }

        if (newContent == null || newContent.trim().isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        message.setContent(newContent);
        message.setIsEdited(true);

        Message savedMessage = messageRepository.save(message);

        MessageResponse response = mapToResponse(savedMessage);

        messagingTemplate.convertAndSend("/topic/channel/" + message.getChannel().getId(), response);
        return response;

    }

    @Transactional 
    public  MessageResponse deleteMessage(
        Long messageId,
        String username
    ){
        User sender = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (Boolean.TRUE.equals(message.getIsDeleted())) {
            throw new RuntimeException("Message is already deleted");
        }

        Long workspaceId = message.getChannel().getWorkspace().getId();

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, sender.getId())
                .orElseThrow(() -> new RuntimeException("You are not a member of this workspace"));

        boolean isAuthor = message.getSender().getId().equals(sender.getId());
        boolean isAdminOrOwner = member.getRole() == Role.ADMIN || member.getRole() == Role.OWNER;

        if (!isAuthor && !isAdminOrOwner) {
            throw new RuntimeException("You do not have permission to delete this message");
        }

        

        message.setIsDeleted(true);
        message.setContent("This message was Deleted");
        
        Message savedMessage = messageRepository.save(message);

        MessageResponse response = mapToResponse(savedMessage);

        messagingTemplate.convertAndSend("/topic/channel/" + message.getChannel().getId(), response);
        return response;

    }

    @Transactional 
    public MessageResponse toggleReaction(
        Long messageId,
        String emoji,
        String username
    ){
        if (emoji == null || emoji.trim().isEmpty()) {
            throw new RuntimeException("Emoji cannot be empty");
        }
    
        User sender = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message not found"));

        if(Boolean.TRUE.equals(message.getIsDeleted())){
            throw new RuntimeException("Message is Deleted");
        }
        
        validateMembership(message.getChannel().getWorkspace().getId(), sender.getId());

        Optional<MessageReaction> messageReaction = messageReactionRepository.findByMessageIdAndUserIdAndEmoji(
            messageId, 
            sender.getId(), 
            emoji);

        if (messageReaction.isPresent()) {
            messageReactionRepository.delete(messageReaction.get());
        }else{
            MessageReaction reaction = MessageReaction.builder()
            .message(message)
            .user(sender)   
            .emoji(emoji)
            .build();
            messageReactionRepository.save(reaction);
        }
        MessageResponse response = mapToResponse(message);

        messagingTemplate.convertAndSend("/topic/channel/" + message.getChannel().getId(), response);
        return response;
        
    }

    private MessageResponse mapToResponse(Message message) {
        String senderName = (message.getSender() != null && message.getSender().getName() != null)
                ? message.getSender().getName()
                : "Unknown";
        String avatar = (senderName != null && !senderName.trim().isEmpty())
                ? senderName.trim().substring(0, 1).toUpperCase()
                : "U";

        /*  
         * The code snippet bulids the reactionResponse to pass into the reactions in the messageResponse DTO
         * findByMessageId(message.getId()); gets the list of Message Reaction
         * Then we stream the reactions and group the reactions with the key has the emoji and the usersIds as values 
         * "👍" → [ {emoji="👍", user=User(1)}, {emoji="👍", user=User(3)} ]
         * After that we bulid the List<ReactionResponse> and pass it in the MessageResponseBulider builder

        */
        List<MessageReaction> reactions = messageReactionRepository.findByMessageId(message.getId());

        Map<String, List<MessageReaction>> grouped = reactions
            .stream()
            .collect(Collectors.groupingBy(MessageReaction::getEmoji));

        List<ReactionResponse> reactionResponse = grouped.entrySet().stream()
            .map(
                entry->{
                    String emoji = entry.getKey();
                    List<MessageReaction> group = entry.getValue();

                    List<Long> userIds = group.stream().map(r->r.getUser().getId()).toList();
                    return new ReactionResponse(emoji, userIds.size(), userIds);
                }
            )
            .toList();

        return MessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                .senderName(senderName)
                .senderAvatar(avatar)
                .timestamp(message.getTimestamp())
                .channelId(message.getChannel() != null ? message.getChannel().getId() : null)
                .type(message.getType())
                .isEdited(message.getIsEdited())
                .isDeleted(message.getIsDeleted())
                .replyToId(message.getReplyTo() != null ? message.getReplyTo().getId() : null)
                .updatedAt(message.getUpdatedAt())
                .reactions(reactionResponse)
                .build();
    }

    private void validateMembership(Long workspaceId, Long userId){
        if(!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)){
                throw new RuntimeException("Your not a member of this Workspace");
        }
    }
}
