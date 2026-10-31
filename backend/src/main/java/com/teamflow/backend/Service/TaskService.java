package com.teamflow.backend.Service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.teamflow.backend.Entity.Task;
import com.teamflow.backend.Entity.TaskComment;
import com.teamflow.backend.Entity.User;
import com.teamflow.backend.Entity.Workspace;
import com.teamflow.backend.Entity.WorkspaceMember;
import com.teamflow.backend.Entity.Enum.Role;
import com.teamflow.backend.Entity.Enum.TaskPriority;
import com.teamflow.backend.Entity.Enum.TaskStatus;
import com.teamflow.backend.Exception.BadRequestException;
import com.teamflow.backend.Exception.ResourceNotFoundException;
import com.teamflow.backend.Exception.UnauthorizedActionException;
import com.teamflow.backend.Repository.TaskCommentRepository;
import com.teamflow.backend.Repository.TaskRepository;
import com.teamflow.backend.Repository.UserRepository;
import com.teamflow.backend.Repository.WorkspaceMemberRepository;
import com.teamflow.backend.Repository.WorkspaceRepository;
import com.teamflow.backend.dto.CreateTaskRequest;
import com.teamflow.backend.dto.TaskCommentRequest;
import com.teamflow.backend.dto.TaskResponse;
import com.teamflow.backend.dto.UpdateTaskRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import com.teamflow.backend.dto.TaskCommentResponse;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Transactional 
    public TaskResponse createTask(
        Long workspaceId,
        CreateTaskRequest request,
        Long currentUserId
    ){
        Workspace workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow(()->  new ResourceNotFoundException("Workspace Not Found"));
        
        WorkspaceMember creatorMembership = workspaceMemberRepository
            .findByWorkspaceIdAndUserId(workspaceId, currentUserId)
            .orElseThrow(() ->  new ResourceNotFoundException("Member Not Found"));
        
        if (creatorMembership.getRole() != Role.OWNER && creatorMembership.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only workspace OWNER or ADMIN can create tasks");
        }
        
        User creator = creatorMembership.getUser();

        // * Handling the part where the assignee Id might not be provided 
        User assignee = null;

        if(request.getAssigneeId() != null){
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(()->new ResourceNotFoundException("Assignee user not found"));
            
            boolean isAssigneeMember = workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(workspaceId, request.getAssigneeId());
            
            if (!isAssigneeMember) {
                throw new ResourceNotFoundException("Assignee is not a member of this workspace");
            }
        }

        Task task = Task.builder()
                .workspace(workspace)
                .title(request.getTitle())
                .description(request.getDescription())
                .assignee(assignee)
                .createdBy(creator)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .status(TaskStatus.TODO)
                .deadline(request.getDeadline())
                .build();

        Task savedTask = taskRepository.save(task);
        return mapToResponse(savedTask);

    }
    
    @Transactional(readOnly = true)
    public Page<TaskResponse> getWorkspaceTasks(
        Long workspaceId, 
        TaskStatus status, 
        TaskPriority priority, 
        Long assigneeId, 
        String search, 
        Pageable pageable, 
        Long currentUserId
    ){
        boolean isMember = workspaceMemberRepository
            .existsByWorkspaceIdAndUserId(workspaceId, currentUserId);
        
        if(!isMember){
            throw new UnauthorizedActionException("You are not a member of this workspace");
        }

        // Cleaning the search parameter for null check and empty string
        String searchParam = (search != null && !search.trim().isEmpty()) 
            ? search.trim() 
            : null;

        org.springframework.data.jpa.domain.Specification<Task> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            predicates.add(cb.equal(root.get("workspace").get("id"), workspaceId));

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (assigneeId != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), assigneeId));
            }
            if (searchParam != null) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + searchParam.toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Task> task = taskRepository.findAll(spec, pageable);
        
        return task.map(this::mapToResponse);
    }

    public TaskResponse getTaskById(
        Long taskId, 
        Long currentUserId
    ){
        Task task = taskRepository.findById(taskId)
                .orElseThrow(()-> new ResourceNotFoundException("Task not Found"));

        boolean isMember = workspaceMemberRepository
            .existsByWorkspaceIdAndUserId(task.getWorkspace().getId(), currentUserId);

        if (!isMember) {
            throw new BadRequestException("You do not have permission to view this task");
        }
        
        return mapToResponse(task);
    }

    @Transactional 
    public TaskResponse updateTask(
        Long taskId, 
        UpdateTaskRequest request, 
        Long currentUserId
    ){
        Task task = taskRepository.findById(taskId)
                .orElseThrow(()-> new ResourceNotFoundException("Task not Found"));

        Long workspaceId = task.getWorkspace().getId();

        WorkspaceMember member = workspaceMemberRepository
            .findByWorkspaceIdAndUserId(workspaceId, currentUserId)
            .orElseThrow(() -> new BadRequestException("You are not a member of this workspace"));

        if (member.getRole() != Role.OWNER && member.getRole()!=Role.ADMIN) {
             throw new UnauthorizedActionException("Only workspace OWNER or ADMIN can update task details");
        }

        if (request.getAssigneeId()!=null) {
            User newAssignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(()-> new ResourceNotFoundException("Assignee user not found"));
            boolean isAssigneeMember = workspaceMemberRepository
                    .existsByWorkspaceIdAndUserId(workspaceId, newAssignee.getId());
            
            if(!isAssigneeMember){
                throw new BadRequestException("Assignee is not a member of this workspace");
            }
            task.setAssignee(newAssignee);
        } else {
            task.setAssignee(null);
        }
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        task.setDeadline(request.getDeadline());

        //Check for setting the completedAt Time
        if (request.getStatus() != null) {
            if (request.getStatus() == TaskStatus.COMPLETED && task.getStatus() != TaskStatus.COMPLETED) {
                task.setCompletedAt(LocalDateTime.now());
            } else if (request.getStatus() != TaskStatus.COMPLETED) {
                task.setCompletedAt(null);
            }
            task.setStatus(request.getStatus());
        }

        Task updatedTask = taskRepository.save(task);
        return mapToResponse(updatedTask);
    }

    @Transactional 
    public TaskResponse updateTaskStatus(
        Long taskId, 
        TaskStatus newStatus, 
        Long currentUserId
    ){
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        WorkspaceMember member = workspaceMemberRepository
            .findByWorkspaceIdAndUserId(task.getWorkspace().getId(), currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("You are not a member of this workspace"));
        
        boolean isAdminOrOwner = member.getRole()==Role.OWNER || member.getRole()==Role.ADMIN;
        boolean isAssignee = task.getAssignee() != null && task.getAssignee().getId().equals(currentUserId);

        if (!isAdminOrOwner && !isAssignee) {
            throw new UnauthorizedActionException("Only the assignee, admin, or owner can change task status");
        }

        if(newStatus == TaskStatus.COMPLETED && task.getStatus() != TaskStatus.COMPLETED){
            task.setCompletedAt(LocalDateTime.now());
        }else if(newStatus != TaskStatus.COMPLETED){
            task.setCompletedAt(null);
        }

        task.setStatus(newStatus);
        return mapToResponse(taskRepository.save(task));
    }
    @Transactional 
    public void deleteTask(
        Long taskId, 
        Long currentUserId
    ){
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        
        WorkspaceMember member = workspaceMemberRepository
            .findByWorkspaceIdAndUserId(task.getWorkspace().getId(), currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("You are not a member of this workspace"));

        if (member.getRole() != Role.OWNER && member.getRole()!=Role.ADMIN) {
             throw new UnauthorizedActionException("Only workspace OWNER or ADMIN can delete tasks");
        }

        taskCommentRepository.deleteByTaskId(taskId);

        taskRepository.delete(task);
    }

    @Transactional 
    public TaskCommentResponse addComment(
        Long taskId, 
        TaskCommentRequest request, 
        Long currentUserId
    ){
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        WorkspaceMember member = workspaceMemberRepository
            .findByWorkspaceIdAndUserId(task.getWorkspace().getId(), currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("You are not a member of this workspace"));

        TaskComment comment = TaskComment.builder()
            .task(task)
            .user(member.getUser())
            .content(request.getContent())
            .createdAt(LocalDateTime.now())
            .build();

        TaskComment savedComment = taskCommentRepository.save(comment);
        
        return mapToCommentResponse(savedComment);
    }

    public List<TaskCommentResponse> getComments(
        Long taskId, 
        Long currentUserId
    ){
         Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        boolean isMember = workspaceMemberRepository
            .existsByWorkspaceIdAndUserId(task.getWorkspace().getId(), currentUserId);
        
        if (!isMember) {
            throw new BadRequestException("You are not a member of this workspace");
        }
        return taskCommentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
            .stream()
            .map(this::mapToCommentResponse)
            .toList();
    }
    
    private TaskResponse mapToResponse(Task task){
        boolean isOverdue = task.getDeadline() != null &&
                            task.getDeadline().isBefore(LocalDateTime.now()) &&
                            task.getStatus() != TaskStatus.COMPLETED;

        int commentCount = taskCommentRepository.countByTaskId(task.getId());

        return TaskResponse.builder()
                .id(task.getId())
                .workspaceId(task.getWorkspace().getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .deadline(task.getDeadline())
                .completedAt(task.getCompletedAt())
                .isOverdue(isOverdue)
                .assignee(toUserSummary(task.getAssignee()))
                .createdBy(toUserSummary(task.getCreatedBy()))
                .commentCount(commentCount)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private TaskResponse.UserSummary toUserSummary(User user) {
        if (user == null) return null;
        return TaskResponse.UserSummary.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .avatarUrl(user.getAvatarUrl())
            .build();
    }

        private TaskCommentResponse mapToCommentResponse(TaskComment comment) {
        return TaskCommentResponse.builder()
            .id(comment.getId())
            .taskId(comment.getTask().getId())
            .user(toUserSummary(comment.getUser()))
            .content(comment.getContent())
            .createdAt(comment.getCreatedAt())
            .build();
    }

}
