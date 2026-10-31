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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* The Card Container */}
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e)=> e.stopPropagation()}>
                {/* <PriorityBadge></PriorityBadge> */}
                        {/* ========================================================
                                ZONE 1: HEADER BAR (Sticky / Top)
                            ======================================================== */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                
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
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer transition-colors ${
                            STATUS_CONFIG[currentTask.status]?.bg || "bg-gray-100"
                            } ${
                            STATUS_CONFIG[currentTask.status]?.text || "text-gray-700"
                            } ${
                            STATUS_CONFIG[currentTask.status]?.border || "border-gray-200"
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
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                            </button>

                            {/* Delete Button */}
                            <button
                            type="button"
                            disabled={isDeleting}
                            onClick={handleDelete}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                            title="Delete Task"
                            >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
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
                        className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors ml-1"
                        >
                        <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* 2A. Task Title & Description */}
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2.5 break-words">
                            {currentTask.title}
                        </h1>
                        <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
                                {currentTask.description || (
                                    <span className="italic text-gray-400">No description provided.</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* 2B. Metadata Grid: Assignee, Deadline, Created By */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Assignee Card */}
                        <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-gray-400" /> Assignee
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                                {currentTask.assignee ? (
                                    <>
                                        {currentTask.assignee.avatarUrl ? (
                                            <img
                                                src={currentTask.assignee.avatarUrl}
                                                alt={currentTask.assignee.name}
                                                className="w-6 h-6 rounded-full object-cover shrink-0"
                                            />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                                {currentTask.assignee.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-xs font-semibold text-gray-800 truncate">
                                            {currentTask.assignee.name}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                                )}
                            </div>
                        </div>

                        {/* Deadline Card */}
                        <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Deadline
                            </span>
                            <span
                                className={`text-xs font-semibold mt-0.5 ${
                                    isOverdue && currentTask.status !== "COMPLETED"
                                        ? "text-red-600 font-bold"
                                        : "text-gray-800"
                                }`}
                            >
                                {formatDeadline(currentTask.deadline)}
                            </span>
                        </div>

                        {/* Created By Card */}
                        <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Created By
                            </span>
                            <span className="text-xs font-semibold text-gray-800 truncate mt-0.5">
                                {currentTask.createdBy?.name || "Unknown"}
                            </span>
                        </div>
                    </div>

                    {/* 2C. Comments Thread */}
                    <div className="space-y-4">
                        {/* Thread Header */}
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-bold text-sm text-gray-900">Comments ({comments.length})</h3>
                        </div>
                        {/* Comment Items */}
                        {isLoadingComments ? (
                            <div className="flex items-center justify-center py-6 text-gray-400 gap-2 text-xs">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                <span>Loading comments...</span>
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="py-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
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
                                                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                {comment.user.name
                                                    ? comment.user.name.charAt(0).toUpperCase()
                                                    : "U"}
                                            </div>
                                        )}

                                        {/* Comment Bubble */}
                                        <div className="flex-1 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-xs text-gray-900">
                                                    {comment.user.name}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
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
                                            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <form onSubmit={handleAddComment} className="p-4 border-t border-gray-100 bg-white flex items-center gap-2">
                    <input 
                        type="text" 
                        value={newCommentText} 
                        onChange={(e) => setNewCommentText(e.target.value)} 
                        placeholder="Write a comment..." 
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={isSubmittingComment || !newCommentText.trim()}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors">
                        {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send</>}
                    </button>
                </form>
            </div>

            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}