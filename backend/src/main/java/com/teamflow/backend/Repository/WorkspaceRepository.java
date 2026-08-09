package com.teamflow.backend.Repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamflow.backend.Entity.Workspace;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    Boolean existsByInviteCode(String code);

    Optional<Workspace> findByInviteCode(String Code);
}
