package com.teamflow.backend.Repository;

import com.teamflow.backend.Entity.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    List<TaskComment> findByTaskIdOrderByCreatedAtAsc(Long taskId);
    int countByTaskId(Long taskId);
    void deleteByTaskId(Long taskId);
}