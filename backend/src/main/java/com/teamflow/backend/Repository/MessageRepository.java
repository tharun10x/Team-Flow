package com.teamflow.backend.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.teamflow.backend.Entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChannelIdOrderByTimestampAsc(Long channelId);

    Page<Message> findByChannelIdOrderByTimestampDesc(Long channelId, Pageable pageable);
    
}
