package com.teamflow.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamflow.backend.Entity.MessageReaction;

public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long>{
    Optional<MessageReaction> findByMessageIdAndUserIdAndEmoji(
        Long messageId,
        Long userId,
        String emoji
    );
    List<MessageReaction> findByMessageId(Long messageId);
    
}
