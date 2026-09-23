package com.teamflow.backend.Repository;

import com.teamflow.backend.Entity.Channel;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository 
public interface ChannelRepository extends JpaRepository<Channel, Long>{
    List<Channel> findByWorkspaceId(Long workspaceId);
}
