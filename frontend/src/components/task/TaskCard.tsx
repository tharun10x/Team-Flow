import React, { useState } from "react";
import { Calendar, MessageSquare, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Task, TaskStatus } from "../../types/task";
import { taskApi } from "../../api/task";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  PriorityBadge,
  StatusBadge,
  OverdueBadge,
  formatDeadline,
  STATUS_CONFIG,
} from "./TaskBadges";

interface TaskCardProps{
    task: Task;
    onClick: () => void; 
    onStatusChange?: (taskId: number, newStatus: TaskStatus) => void;
}
export function TaskCard({ task, onClick, onStatusChange }: TaskCardProps){
    const {user} = useAuth();
    const {currentWorkspace} = useWorkspace();
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const isOwnerOrAdmin = 
    currentWorkspace?.currentUserRole === "OWNER" ||
    currentWorkspace?.currentUserRole === "ADMIN";

    const isAssignee = Boolean(user?.id && task.assignee?.id === user.id);

    const canUpdateStatus = isOwnerOrAdmin || isAssignee;

    const isOverdue = Boolean(task.isOverdue || task.overdue);

    const handleStatusSelect = async (e:React.ChangeEvent<HTMLSelectElement>) =>{
        e.stopPropagation(); // this function prevents from opening the modal

        const newStatus = e.target.value as TaskStatus; // as TaskStatus tells the complier to treat the value as a TaskStatus value

        if(newStatus===task.status) return;

        try {
            setIsUpdatingStatus(true);
            await taskApi.updateTaskStatus(task.id, newStatus);
            toast.success(`Task moved to ${STATUS_CONFIG[newStatus].label}`);

            if (onStatusChange) {
                onStatusChange(task.id, newStatus);
            }
        } catch (error:any) {
            toast.error(error.response?.data?.message || "Failed to update status")
        }finally{
            setIsUpdatingStatus(false);
        }
    }

      return (
    <li
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) onClick(); }}
      tabIndex={0}
      className={`group grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-rule px-3 py-3 transition-colors hover:bg-paper-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus md:grid-cols-[minmax(0,1fr)_9rem_7rem_9.5rem_8rem] ${isOverdue && task.status !== "COMPLETED" ? "bg-error-wash/60" : ""}`}
    >
      {/* Title & Description */}
      <div className="min-w-0">
        <h3 className="truncate font-body text-sm font-medium tracking-normal text-ink">
          {task.title}
        </h3>
        <p className="flex items-center gap-3 truncate text-xs text-muted">
          {task.description && <span className="truncate">{task.description}</span>}
          {task.commentCount > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1" aria-label={`${task.commentCount} comments`}>
              <MessageSquare className="h-3.5 w-3.5" />
              {task.commentCount}
            </span>
          )}
        </p>
      </div>

      {/* Assignee */}
      <div className="hidden min-w-0 items-center gap-2 text-sm md:flex">
        {task.assignee ? (
          <>
            <span className="avatar h-6! w-6!">
              {task.assignee.name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate text-ink-2">
              {task.assignee.name}
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1 text-muted">
            <User className="h-3.5 w-3.5" />
            Unassigned
          </span>
        )}
      </div>

      {/* Priority, Overdue */}
      <div className="hidden flex-col items-start gap-0.5 md:flex">
        <PriorityBadge priority={task.priority} />
        {isOverdue && task.status !== "COMPLETED" && <OverdueBadge />}
      </div>

      {/* Status: interactive dropdown if permitted, otherwise read-only badge */}
      <div onClick={(e) => e.stopPropagation()} className="row-start-1 col-start-2 md:col-start-auto md:row-start-auto">
        {canUpdateStatus ? (
          <span className="relative inline-flex items-center">
            <select
              value={task.status}
              disabled={isUpdatingStatus}
              onChange={handleStatusSelect}
              aria-label={`Status of ${task.title}`}
              className={`field min-h-8! w-36! font-medium ${STATUS_CONFIG[task.status]?.text}`}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="COMPLETED">Completed</option>
            </select>
            {isUpdatingStatus && <Loader2 className="absolute -right-6 h-4 w-4 animate-spin text-muted" aria-label="Saving" />}
          </span>
        ) : (
          <StatusBadge status={task.status} />
        )}
      </div>

      {/* Deadline */}
      <div
        className={`flex items-center gap-1.5 whitespace-nowrap text-sm tabular-nums md:justify-end ${
          isOverdue && task.status !== "COMPLETED"
            ? "font-medium text-error"
            : "text-ink-2"
        }`}
      >
        <Calendar className="h-3.5 w-3.5 shrink-0" />
        <span>{formatDeadline(task.deadline)}</span>
      </div>
    </li>
  );
}
