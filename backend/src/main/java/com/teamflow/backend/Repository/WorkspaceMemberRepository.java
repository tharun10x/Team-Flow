package com.teamflow.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamflow.backend.Entity.WorkspaceMember;
import com.teamflow.backend.Entity.Enum.Role;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long>{
    // Find a specific membership (used for auth checks)
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    // Check if someone is already a member
    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    // Find members by role (e.g., find all ADMINs for ownership transfer)
    List<WorkspaceMember> findByWorkspaceIdAndRole(Long workspaceId, Role role);
    // Get all members of a workspace
    List<WorkspaceMember> findByWorkspaceId(Long workspaceId);
    // Get all workspaces a user belongs to
    List<WorkspaceMember> findByUserId(Long userId);
    // Count members in a workspace
    long countByWorkspaceId(Long workspaceId);
    // Delete a specific membership
    void deleteByWorkspaceIdAndUserId(Long workspaceId, Long userId);
}
