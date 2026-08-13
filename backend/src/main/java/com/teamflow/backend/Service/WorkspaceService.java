package com.teamflow.backend.Service;

import java.security.SecureRandom;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamflow.backend.Entity.User;
import com.teamflow.backend.Entity.Workspace;
import com.teamflow.backend.Entity.WorkspaceMember;
import com.teamflow.backend.Entity.Enum.Role;
import com.teamflow.backend.Repository.UserRepository;
import com.teamflow.backend.Repository.WorkspaceMemberRepository;
import com.teamflow.backend.Repository.WorkspaceRepository;
import com.teamflow.backend.dto.InviteMemberRequest;
import com.teamflow.backend.dto.WorkspaceRequest;
import com.teamflow.backend.dto.WorkspaceResponse;

@Service
public class WorkspaceService {
    @Autowired
    UserRepository userRepo;

    @Autowired
    WorkspaceRepository workspaceRepository;

    @Autowired
    WorkspaceMemberRepository workspaceMemberRepository;
    
    @Transactional
    public WorkspaceResponse createWorkspace(WorkspaceRequest request, Long userId){
        User owner = userRepo.findById(userId)
        .orElseThrow(() -> new RuntimeException("User NOt Found"));

        String inviteCode = generateInviteCode();

        Workspace workspace = Workspace.builder()
                                .name(request.getName())
                                .description(request.getDescription())
                                .inviteCode(inviteCode)
                                .owner(owner)
                                .build();
        workspace = workspaceRepository.save(workspace);

        WorkspaceMember member = WorkspaceMember.builder()
                                .workspace(workspace)
                                .user(owner)
                                .role(Role.OWNER)
                                .build();
        workspaceMemberRepository.save(member);
        
        return toResponse(workspace, userId);
    }

    private String generateInviteCode() {
    String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    StringBuilder code = new StringBuilder();
    SecureRandom random = new SecureRandom();
    for (int i = 0; i < 8; i++) {
        code.append(chars.charAt(random.nextInt(chars.length())));
    }
    
    if (workspaceRepository.existsByInviteCode(code.toString())) {
        return generateInviteCode();  
    }
    return code.toString();
    }
    
    @Transactional
    public WorkspaceResponse joinWorkspace(String inviteCode, Long userId){
        Workspace workspace = workspaceRepository.findByInviteCode(inviteCode)
                    .orElseThrow(()-> new RuntimeException("Workspace Not Found"));

        boolean alreadyMember = workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), userId);

        if(alreadyMember){
            throw new RuntimeException("Your already a Member");
        }

        User user = userRepo.findById(userId)
            .orElseThrow(()->new RuntimeException("User Not Found"));

        WorkspaceMember member = WorkspaceMember.builder()
                                    .workspace(workspace)
                                    .user(user)
                                    .role(Role.MEMBER)
                                    .build();

        workspaceMemberRepository.save(member);

        return toResponse(workspace, userId);

    }

    private WorkspaceResponse toResponse(Workspace workspace, Long currentUserId) {

    // Get current user's role in this workspace
    String currentRole = workspaceMemberRepository
            .findByWorkspaceIdAndUserId(workspace.getId(), currentUserId)
            .map(m -> m.getRole().name())
            .orElse(null);

    // Get member count
    int memberCount = (int) workspaceMemberRepository.countByWorkspaceId(workspace.getId());

    return WorkspaceResponse.builder()
            .id(workspace.getId())
            .name(workspace.getName())
            .description(workspace.getDescription())
            .inviteCode(workspace.getInviteCode())
            .ownerName(workspace.getOwner().getName())
            .ownerId(workspace.getOwner().getId())
            .currentUserRole(currentRole)
            .memberCount(memberCount)
            .createdAt(workspace.getCreatedAt())
            .updatedAt(workspace.getUpdatedAt())
            .build();
    // Note: `members` list is left null here (excluded from JSON by @JsonInclude)
    // Populate it only in getWorkspaceDetails() where you need the full member list
}

// For detailed view — includes full member list
private WorkspaceResponse toDetailedResponse(Workspace workspace, Long currentUserId) {
    WorkspaceResponse response = toResponse(workspace, currentUserId);

    List<WorkspaceMember> members = workspaceMemberRepository
            .findByWorkspaceId(workspace.getId());

    List<WorkspaceResponse.MemberInfo> memberInfos = members.stream()
            .map(m -> WorkspaceResponse.MemberInfo.builder()
                    .userId(m.getUser().getId())
                    .name(m.getUser().getName())
                    .email(m.getUser().getEmail())
                    .avatarUrl(m.getUser().getAvatarUrl())
                    .role(m.getRole().name())
                    .joinedAt(m.getJoinedAt())
                    .build())
            .toList();

    response.setMembers(memberInfos);
    return response;
    }
    public WorkspaceResponse getWorkspaceDetails(Long workspaceId, Long currentUserId) {
    
    getMemberWithRole(workspaceId, currentUserId, Role.OWNER, Role.ADMIN, Role.MEMBER);
    
    Workspace workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new RuntimeException("Workspace not found"));

    return toDetailedResponse(workspace, currentUserId); 
}

    @Transactional
    public void inviteMember(Long workspaceId, InviteMemberRequest request, Long inviterId){
        WorkspaceMember inviter = getMemberWithRole(workspaceId, inviterId, Role.OWNER, Role.ADMIN);

        User invitee = userRepo.findByEmail(request.getEmail())
            .orElseThrow(()->new RuntimeException("User Not Found"));
        
        boolean alreadyMember = workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, invitee.getId());

        if(alreadyMember){
            throw new RuntimeException("You are already part of this Workspace");
        }

        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow(()-> new RuntimeException("Workspace Not Found"));

        WorkspaceMember member = WorkspaceMember.builder()
                                    .workspace(workspace)
                                    .user(invitee)
                                    .role(Role.MEMBER)
                                    .build();

        workspaceMemberRepository.save(member);

        //TODO: ADD Notification
    }

    private WorkspaceMember getMemberWithRole(Long workspaceId, Long userId, 
                                           Role... allowedRoles) {
    WorkspaceMember member = workspaceMemberRepository
            .findByWorkspaceIdAndUserId(workspaceId, userId)
            .orElseThrow(() -> new RuntimeException("You are not a member of this workspace"));

    boolean hasRole = Arrays.stream(allowedRoles)
            .anyMatch(role -> member.getRole() == role);

    if (!hasRole) {
        throw new RuntimeException("You don't have permission for this action");
    }

    return member;
    }

    @Transactional
    public void removeMember(Long workspaceId, Long memberUserId, Long requesterId){
        WorkspaceMember requester = getMemberWithRole(workspaceId, requesterId, Role.OWNER , Role.ADMIN);

        WorkspaceMember target = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, memberUserId)
        .orElseThrow(()->new RuntimeException("Member Not Found"));

        if(target.getRole()==Role.OWNER){
            throw new RuntimeException("Cannot Remove the Owner");
        }

        if(target.getRole()==Role.ADMIN && requester.getRole()!=Role.OWNER){
            throw new RuntimeException("Only the Owner can remove the Admin");
        }

        workspaceMemberRepository.delete(target);
    }

    @Transactional
    public void changeRole(Long workspaceId, Long targetUserId, Role newRole, Long requesterId){
        WorkspaceMember requester = getMemberWithRole(workspaceId, requesterId, Role.OWNER);

        WorkspaceMember target = workspaceMemberRepository
        .findByWorkspaceIdAndUserId(workspaceId, targetUserId)
        .orElseThrow(()->new RuntimeException("User not found"));

        if(target.getRole()==Role.OWNER){
            throw new RuntimeException("Cannot change the owner;s role");
        }

        if(newRole ==  Role.OWNER){
            throw new RuntimeException("Cannot assign OWNER role. Use transfer ownership instead.");
        }

        target.setRole(newRole);
        workspaceMemberRepository.save(target);

    }

    @Transactional
    public void leaveWorkspace(Long workspaceId, Long userId){
        WorkspaceMember member = workspaceMemberRepository
        .findByWorkspaceIdAndUserId(workspaceId, userId)
        .orElseThrow(()->new RuntimeException("Member Not Found"));

        if(member.getRole()==Role.OWNER){
            List<WorkspaceMember> admins = workspaceMemberRepository
                .findByWorkspaceIdAndRole(workspaceId, Role.ADMIN);

            if(admins.isEmpty()){
                long memberCount = workspaceMemberRepository.countByWorkspaceId(workspaceId);
                    if (memberCount == 1) {
                    workspaceRepository.deleteById(workspaceId);
                    return;
                } else {
                    throw new RuntimeException(
                        "You must promote another member to Admin or Owner before leaving");
                }
            }

            WorkspaceMember newOwner = admins.get(0);
            newOwner.setRole(Role.OWNER);
            workspaceMemberRepository.save(newOwner);

            Workspace workspace = workspaceRepository.findById(workspaceId).get();
            workspace.setOwner(newOwner.getUser());
            workspaceRepository.save(workspace);    
        }
        workspaceMemberRepository.delete(member);
    }

    @Transactional
    public void deleteWorkspace(Long workspaceId, Long userId) {

        getMemberWithRole(workspaceId, userId, Role.OWNER);
    workspaceRepository.deleteById(workspaceId);

    }

    public List<WorkspaceResponse> getMyWorkspaces(Long userId){

        List<WorkspaceMember> memberships = workspaceMemberRepository.findByUserId(userId);

        return memberships.stream()
            .map(member-> toResponse(member.getWorkspace(), userId))
            .toList();
    }
}
