package com.teamflow.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teamflow.backend.Entity.User;
import com.teamflow.backend.Repository.UserRepository;
import com.teamflow.backend.Service.WorkspaceService;
import com.teamflow.backend.dto.ApiResponse;
import com.teamflow.backend.dto.ChangeRoleRequest;
import com.teamflow.backend.dto.InviteMemberRequest;
import com.teamflow.backend.dto.JoinWorkspaceRequest;
import com.teamflow.backend.dto.WorkspaceRequest;
import com.teamflow.backend.dto.WorkspaceResponse;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;


@RestController
@RequestMapping("api/workspaces")
public class WorkspaceController {
    @Autowired
    WorkspaceService workspaceService;
    @Autowired
    UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<ApiResponse> createWorkspace(
            @Valid @RequestBody WorkspaceRequest request
    ) {
        try {
            User currentUser = getCurrentUser();
            WorkspaceResponse response = workspaceService.createWorkspace(request, currentUser.getId());
            return ResponseEntity.status(201)
                    .body(ApiResponse.success(response, "Workspace created successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getMyWorkspaces(){
        try {

            User currentuser = getCurrentUser();
            List<WorkspaceResponse> workspaces = workspaceService.getMyWorkspaces(currentuser.getId());
            return ResponseEntity.ok(ApiResponse.success(workspaces, "Workspaces fetched successfully!"));

        } catch (Exception e) {

            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse> getWorkspacesDetails(@PathVariable("id") Long workspaceId){
        try {
            User currentuser = getCurrentUser();
            WorkspaceResponse response = workspaceService.getWorkspaceDetails(workspaceId, currentuser.getId());
            return ResponseEntity.ok(ApiResponse.success(response, "Workspace fetched successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("join")
    public ResponseEntity<ApiResponse> joinWorkspace(@RequestBody JoinWorkspaceRequest request){
        
        try {
            User currentUser = getCurrentUser();
            WorkspaceResponse response =  workspaceService.joinWorkspace(request.getInviteCode(), currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success(response, "Joined workspace successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("{id}/members")
    public ResponseEntity<ApiResponse> inviteMember(
        @RequestBody InviteMemberRequest request,
        @PathVariable("id") Long workspaceId
    ){
        try {
            User currentUser = getCurrentUser();
            workspaceService.inviteMember(workspaceId, request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success( null,"Invited Member Successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("{id}/members/{userId}")
    public ResponseEntity<ApiResponse> removeMember(
        @PathVariable("id") Long workspaceId,
        @PathVariable("userId") Long userId
    ){
        try {
            User currentUser = getCurrentUser();
            workspaceService.removeMember(workspaceId, userId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success(null, "Removed Member!"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("{id}/members/{userId}/role")
    public ResponseEntity<ApiResponse> changeRole(
        @PathVariable("id") Long workspaceId,
        @PathVariable("userId") Long userId,
        @RequestBody ChangeRoleRequest request
    ){
        try {
            User curreUser = getCurrentUser();
            workspaceService.changeRole(workspaceId, userId, request.getRole(), curreUser.getId());
            return ResponseEntity.ok(ApiResponse.success(null, "Role changed successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("{id}/leave")
    public ResponseEntity<ApiResponse> leaveWorkspace(
        @PathVariable("id") Long workspaceId
    ){
        try {
            User currentUser = getCurrentUser();
            workspaceService.leaveWorkspace(workspaceId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success(null, "Left Workspace successfully!"));

        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse> deleteWorkspace(
        @PathVariable("id") Long workspaceId
    ){
        try {
            User currenUser = getCurrentUser();
            workspaceService.deleteWorkspace(workspaceId, currenUser.getId());
            return ResponseEntity.ok(ApiResponse.success(null, "Deleted Workspace successfully!"));

        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    private User getCurrentUser() {
    String email = SecurityContextHolder.getContext()
            .getAuthentication().getName();
    return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}