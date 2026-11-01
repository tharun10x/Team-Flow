import { useEffect, useState } from "react";
import type { Task, TaskComment, TaskStatus } from "../../types/task";
import { taskApi } from "../../api/task";
import { toast } from "sonner";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import { X, Pencil, Trash2, Calendar, User, MessageSquare, Send, Loader2 } from "lucide-react";
import {
  PriorityBadge,
  StatusBadge,
  OverdueBadge,
  formatDeadline,
  STATUS_CONFIG,
} from "./TaskBadges";

interface TaskDetailModalProps{
    isOpen:boolean;
    task: Task | null;
    onClose: ()=> void;
    onTaskUpdate: (updateTask: Task) => void;
    onTaskDelete: (taskId: number) => void;
    onEditTask: (task: Task) => void;
}

export function TaskDetailModal({
    isOpen,
    task,
    onClose,
    onTaskUpdate,
    onTaskDelete,
    onEditTask
}:TaskDetailModalProps){

    const [currentTask, setCurrentTask] = useState<Task | null>();
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [newCommentText, setNewCommentText] = useState<string>("");
    const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const {currentWorkspace} = useWorkspace();

    useEffect(()=>{
        //check if the modal is open and task is not null
        if(isOpen && task){

            setCurrentTask(task);
            setNewCommentText("");
            
            //we can't use a async directly inside a useEffect we need to define a aync function sep

            const loadComments = async ()=>{
                try {
                    setIsLoadingComments(true);
                    const fetchedComments = await taskApi.getComments(task.id);
                    setComments(fetchedComments);
                } catch (error) {
                    toast.error("Failed to load comments");
                } finally {
                    setIsLoadingComments(false);
                }
            };
            loadComments();

        }
    },[isOpen, task?.id]);

    const handleStatusChange = async (e:React.ChangeEvent<HTMLSelectElement>)=>{
        if (!currentTask) return;
        const newStatus = e.target.value as TaskStatus;
        if (newStatus === currentTask.status) return;
        try {

            const updatedTask = await taskApi.updateTaskStatus(currentTask.id, newStatus);
            setCurrentTask(updatedTask);
            onTaskUpdate(updatedTask);
            toast.success("Task Status updated successfully");

        } catch (error:any) {
            toast.error(error.response?.data?.message || "Error updating task status");
        }
    }

    const handleDelete = async ()=>{

        if(!currentTask) return;

        if(!window.confirm("Are you sure you want to delete this task?")) return;

        const isOwnerOrAdmin = 
        currentWorkspace?.currentUserRole === "OWNER" ||
        currentWorkspace?.currentUserRole === "ADMIN";

        if(!isOwnerOrAdmin) return;
        try {
            setIsDeleting(true);
            const deletedTask = await taskApi.deleteTask(currentTask.id);
            toast.success("Task deleted successfully")
            onTaskDelete(currentTask.id);
            onClose();
        } catch (error:any) {
            toast.error(error.response?.data?.message || "Failed to delete task")
        }finally{
            setIsDeleting(false);
        }
    }

    const handleAddComment = async (e:React.FormEvent)=>{

        e.preventDefault();
        if(!newCommentText.trim() || !currentTask) return;

        try {
            setIsSubmittingComment(true);
            const createdComment = await taskApi.addComment(currentTask.id, newCommentText.trim());
            
            setComments(prev => [...prev, createdComment]);

            const updatedTask = {
                ...currentTask,
                commentCount: (currentTask.commentCount || 0) + 1,
            };
            setCurrentTask(updatedTask);
            onTaskUpdate(updatedTask);

            setNewCommentText("")
            toast.success("Comment posted")
        } catch (error:any) {
            toast.error(error.response?.data?.message || "Failed to post comment")
        }finally{
            setIsSubmittingComment(false);
        }
    }

    const { user } = useAuth();

    // 1. Check roles
    const isOwnerOrAdmin =
      currentWorkspace?.currentUserRole === "OWNER" ||
      currentWorkspace?.currentUserRole === "ADMIN";

    // 2. Check if logged-in user is assigned to this task
    const isAssignee = Boolean(user?.id && currentTask?.assignee?.id === user.id);

    // 3. Either admins or assignee can change status
    const canUpdateStatus = isOwnerOrAdmin || isAssignee;

    // 4. Overdue flag
    const isOverdue = Boolean(currentTask?.isOverdue || currentTask?.overdue);
    if (!isOpen || !currentTask) return null;
    
    return(
        <div className="modal-back">
            {/* The Card Container */}
            <div className="modal max-w-2xl!" onClick={(e)=> e.stopPropagation()}>
                {/* <PriorityBadge></PriorityBadge> */}
                        {/* ========================================================
                                ZONE 1: HEADER BAR (Sticky / Top)
                            ======================================================== */}
                <div className="px-6 py-4 border-b border-rule flex items-center justify-between gap-4">
                
                    {/* LEFT: Priority Badge, Overdue Badge, and Status Selector */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <PriorityBadge priority={currentTask.priority} />

                        {isOverdue && currentTask.status !== "COMPLETED" && (
                        <OverdueBadge />
                        )}

                        {/* Status Dropdown (or read-only badge if not allowed) */}
                        {canUpdateStatus ? (
                        <select
                            value={currentTask.status}
                            onChange={handleStatusChange}
                            aria-label="Status"
                            className={`field min-h-8! w-36! font-medium ${
                            STATUS_CONFIG[currentTask.status]?.text || "text-ink-2"
                            }`}
                        >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="BLOCKED">Blocked</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                        ) : (
                        <StatusBadge status={currentTask.status} />
                        )}
                    </div>

                    {/* RIGHT: Admin Actions (Edit/Delete) + Close Button */}
                    <div className="flex items-center gap-1.5">
                        {isOwnerOrAdmin && (
                        <>
                            {/* Edit Button */}
                            <button
                            type="button"
                            onClick={() => onEditTask(currentTask)}
                            className="btn btn-ghost"
                            >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                            </button>

                            {/* Delete Button */}
                            <button
                            type="button"
                            disabled={isDeleting}
                            onClick={handleDelete}
                            className="btn btn-ghost btn-icon text-error! hover:bg-error-wash!"
                            title="Delete Task"
                            aria-label="Delete Task"
                            >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            </button>
                        </>
                        )}

                        {/* Close (X) Button */}
                        <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost btn-icon"
                        aria-label="Close"
                        >
                        <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* 2A. Task Title & Description */}
                    <div>
                        <h1 className="mb-3 max-w-none break-words font-display text-2xl font-semibold tracking-display text-ink">
                            {currentTask.title}
                        </h1>
                        <div>
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-2">
                                {currentTask.description || (
                                    <span className="italic text-muted">No description provided.</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* 2B. Metadata Grid: Assignee, Deadline, Created By */}
                    <div className="grid grid-cols-1 border-y border-rule sm:grid-cols-3 sm:divide-x sm:divide-rule">
                        {/* Assignee Card */}
                        <div className="flex flex-col gap-1 py-3 sm:px-4 sm:first:pl-0">
                            <span className="flex items-center gap-1.5 text-xs text-muted">
                                <User className="w-3.5 h-3.5 text-muted" /> Assignee
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                                {currentTask.assignee ? (
                                    <>
                                        {currentTask.assignee.avatarUrl ? (
                                            <img
                                                src={currentTask.assignee.avatarUrl}
                                                alt={currentTask.assignee.name}
                                                className="h-6 w-6 shrink-0 rounded-pill object-cover"
                                            />
                                        ) : (
                                            <div className="avatar h-6! w-6!">
                                                {currentTask.assignee.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="truncate text-sm font-medium text-ink">
                                            {currentTask.assignee.name}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm text-muted">Unassigned</span>
                                )}
                            </div>
                        </div>

                        {/* Deadline Card */}
                        <div className="flex flex-col gap-1 py-3 sm:px-4 sm:first:pl-0">
                            <span className="flex items-center gap-1.5 text-xs text-muted">
                                <Calendar className="w-3.5 h-3.5 text-muted" /> Deadline
                            </span>
                            <span
                                className={`text-sm font-medium tabular-nums ${
                                    isOverdue && currentTask.status !== "COMPLETED"
                                        ? "text-error font-semibold"
                                        : "text-ink"
                                }`}
                            >
                                {formatDeadline(currentTask.deadline)}
                            </span>
                        </div>

                        {/* Created By Card */}
                        <div className="flex flex-col gap-1 py-3 sm:px-4 sm:first:pl-0">
                            <span className="text-xs text-muted">
                                Created By
                            </span>
                            <span className="truncate text-sm font-medium text-ink">
                                {currentTask.createdBy?.name || "Unknown"}
                            </span>
                        </div>
                    </div>

                    {/* 2C. Comments Thread */}
                    <div className="space-y-4">
                        {/* Thread Header */}
                        <div className="flex items-center gap-2 border-b border-rule pb-2">
                        <MessageSquare className="w-4 h-4 text-muted" />
                        <h3 className="font-display text-md font-semibold tracking-display text-ink">Comments ({comments.length})</h3>
                        </div>
                        {/* Comment Items */}
                        {isLoadingComments ? (
                            <div className="flex items-center gap-2 py-4 text-sm text-muted" role="status">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading comments…</span>
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="py-4 text-sm text-muted">
                                No comments yet. Start the discussion below!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex items-start gap-2.5">
                                        {/* Avatar */}
                                        {comment.user.avatarUrl ? (
                                            <img
                                                src={comment.user.avatarUrl}
                                                alt={comment.user.name}
                                                className="mt-0.5 h-7 w-7 shrink-0 rounded-pill object-cover"
                                            />
                                        ) : (
                                            <div className="avatar mt-0.5">
                                                {comment.user.name
                                                    ? comment.user.name.charAt(0).toUpperCase()
                                                    : "U"}
                                            </div>
                                        )}

                                        {/* Comment Bubble */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-ink">
                                                    {comment.user.name}
                                                </span>
                                                <span className="text-xs text-muted">
                                                    {new Date(comment.createdAt).toLocaleDateString([], {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}{" "}
                                                    at{" "}
                                                    {new Date(comment.createdAt).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-2">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <form onSubmit={handleAddComment} className="flex items-center gap-2 border-t border-rule p-4">
                    <input 
                        type="text" 
                        value={newCommentText} 
                        onChange={(e) => setNewCommentText(e.target.value)} 
                        placeholder="Write a comment..." 
                        aria-label="Write a comment"
                        className="field field-lg flex-1"
                    />
                    <button
                        type="submit"
                        disabled={isSubmittingComment || !newCommentText.trim()}
                        className="btn btn-lg">
                        {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send</>}
                    </button>
                </form>
            </div>

            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}