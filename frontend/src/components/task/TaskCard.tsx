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
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
    >
      {/* 1. TOP ROW: Priority, Overdue, and Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <PriorityBadge priority={task.priority} />
          {isOverdue && task.status !== "COMPLETED" && <OverdueBadge />}
        </div>

        {/* Status: interactive dropdown if permitted, otherwise read-only badge */}
        <div onClick={(e) => e.stopPropagation()}>
          {canUpdateStatus ? (
            <select
              value={task.status}
              disabled={isUpdatingStatus}
              onChange={handleStatusSelect}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer transition-colors ${
                STATUS_CONFIG[task.status]?.bg
              } ${STATUS_CONFIG[task.status]?.text} ${
                STATUS_CONFIG[task.status]?.border
              }`}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="COMPLETED">Completed</option>
            </select>
          ) : (
            <StatusBadge status={task.status} />
          )}
        </div>
      </div>

      {/* 2. MIDDLE CONTENT: Title & Description */}
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
            {task.description}
          </p>
        )}
      </div>

      {/* 3. BOTTOM FOOTER: Assignee, Comments, Deadline */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs text-gray-400">
        {/* Assignee */}
        <div className="flex items-center gap-1.5 min-w-0">
          {task.assignee ? (
            <>
              <div className="w-5 h-5 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {task.assignee.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-600 font-medium truncate max-w-24">
                {task.assignee.name}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1 text-gray-400">
              <User className="w-3.5 h-3.5" />
              <span className="italic">Unassigned</span>
            </div>
          )}
        </div>

        {/* Comments & Deadline */}
        <div className="flex items-center gap-3 shrink-0">
          {task.commentCount > 0 && (
            <span className="flex items-center gap-1 text-gray-500 font-medium">
              <MessageSquare className="w-3.5 h-3.5" />
              {task.commentCount}
            </span>
          )}

          <div
            className={`flex items-center gap-1 ${
              isOverdue && task.status !== "COMPLETED"
                ? "text-red-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDeadline(task.deadline)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}