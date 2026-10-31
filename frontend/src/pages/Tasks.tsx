import { useEffect, useState } from "react";
import type { Task, TaskStatus, TaskPriority } from "../types/task";
import { useWorkspace } from "../context/WorkspaceContext";
import api from "../api/axios";
import { taskApi } from "../api/task";
import { useAuth } from "../context/AuthContext";
import { CreateTaskModal } from "../components/task/CreateTaskModal";
import { TaskDetailModal } from "../components/task/TaskDetailModal";
import { TaskCard } from "../components/task/TaskCard";
import { Plus, Search, CheckSquare, Clock, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export function Tasks(){

    const {currentWorkspace} = useWorkspace();
    const {user} = useAuth();
    //Task data
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [members, setMembers] = useState<Array<{ userId: number; name: string}>>([]);

    //Filter & Search
    const [search, setSearch] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("");

    //Modal controllers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    //counters from the task array
    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
    const overdueTasks = tasks.filter(
    (t) => (t.isOverdue || t.overdue) && t.status !== "COMPLETED"
    ).length;

    const isOwnerOrAdmin =
    currentWorkspace?.currentUserRole === "OWNER" ||
    currentWorkspace?.currentUserRole === "ADMIN";

    //Data Fetching logic
    const fetchMembers = async ()=>{
        if(!currentWorkspace?.id) return;
        try {
            const res = await api.get(`/workspaces/${currentWorkspace.id}`);
            setMembers(res.data.data.members ||[]);
        } catch (error) {
            console.error("Failed to fetch workspace members", error);
        }
    };

    //*Fetching tasks
    const fetchTasks = async ()=>{
        if(!currentWorkspace?.id) return;
        setIsLoading(true);

         // Convert assignee filter: if "me", pass user.id; if number string, pass Number(val)
        let assigneeId: number | undefined = undefined;
        if(assigneeFilter==="me"){
            assigneeId = user?.id;
        } 
        else if(assigneeFilter != ""){
            assigneeId = Number(assigneeFilter);
        } 

        try {
            const res = await taskApi.getWorkspaceTasks(currentWorkspace.id,{
                search: search.trim(),
                status: statusFilter,
                priority: priorityFilter,
                assigneeId: assigneeId,
            });
            setTasks(res.content || []);
        } catch (error: any) {
            console.error("Failed to fetch tasks", error);
            toast.error(error.response?.data?.message || "Failed to load tasks");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(()=>{
        fetchMembers();
    },[currentWorkspace?.id]);

    useEffect(()=>{
        fetchTasks();
    },[currentWorkspace?.id, statusFilter, priorityFilter, assigneeFilter, search]);

    // *Syncing up the updates from the modal
    // When status changes on a card or modal
    const handleTaskUpdated = (updatedTask: Task) => {
        setTasks((prev)=>
            prev.map((t)=> updatedTask.id === t.id ? updatedTask : t)
        );
        if(selectedTask?.id ===updatedTask.id){
            setSelectedTask(updatedTask);
        }
    };

    //When a task is deleted
    const handleTaskDeleted = (taskId:number) =>{
        setTasks((prev)=>
            prev.filter((t)=>t.id!==taskId)
        );
        if (selectedTask?.id === taskId) {
            setSelectedTask(null);
        }
    };

    //When user clicks "Edit" inside TaskDetailModal
    const handleEditFromDetail = (task: Task) => {
        setSelectedTask(null);        // Close view modal
        setEditingTask(task);         // Pass task to create/edit modal
        setIsCreateModalOpen(true);   // Open edit modal
        };

    return(
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* BLOCK 1: Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Tasks</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        <span className="font-semibold text-gray-700">{currentWorkspace?.name}</span> • {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
                    </p>
                </div>

                {/* if its owner or admin load the create modal */}
                {isOwnerOrAdmin && (
                    <button
                        onClick={() => {
                        setEditingTask(null);
                        setIsCreateModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        New Task
                    </button>
                )}

            </div>
            {/* BLOCK 2: Quick Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                    <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total</p>
                    <p className="text-xl font-bold text-gray-900">{totalTasks}</p>
                </div>
                </div>

                {/* In Progress */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">In Progress</p>
                    <p className="text-xl font-bold text-gray-900">{inProgressTasks}</p>
                </div>
                </div>

                {/* Completed */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Completed</p>
                    <p className="text-xl font-bold text-gray-900">{completedTasks}</p>
                </div>
                </div>

                {/* Overdue */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${overdueTasks > 0 ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"}`}>
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Overdue</p>
                    <p className={`text-xl font-bold ${overdueTasks > 0 ? "text-red-600" : "text-gray-900"}`}>{overdueTasks}</p>
                </div>
                </div>
            </div>

            {/* BLOCK 3: Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Live Search Input */}
                <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks by title..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                />
                {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                    </button>
                )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {/* Status */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "")}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="COMPLETED">Completed</option>
                </select>

                {/* Priority */}
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "")}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                    <option value="">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>

                {/* Assignee */}
                <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                    <option value="">All Assignees</option>
                    <option value="me">Assigned to Me</option>
                    {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                        {m.name}
                    </option>
                    ))}
                </select>

                {/* Reset Filters button if any filter is active */}
                {(statusFilter || priorityFilter || assigneeFilter || search) && (
                    <button
                    onClick={() => {
                        setStatusFilter("");
                        setPriorityFilter("");
                        setAssigneeFilter("");
                        setSearch("");
                    }}
                    className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors whitespace-nowrap"
                    >
                    Reset
                    </button>
                )}
                </div>
            </div>

            {/* BLOCK 4: Task Cards Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium">Loading workspace tasks...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">No tasks found</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                    {search || statusFilter || priorityFilter || assigneeFilter
                    ? "No tasks match your active filters. Try resetting the filters above."
                    : "Get started by creating your first task for this workspace!"}
                </p>
                {isOwnerOrAdmin && !search && !statusFilter && !priorityFilter && !assigneeFilter && (
                    <button
                    onClick={() => {
                        setEditingTask(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                    Create First Task
                    </button>
                )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task) => (
                    <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    onStatusChange={(id, status) => handleTaskUpdated({ ...task, status })}
                    />
                ))}
                </div>
            )}
            
            {/* BLOCK 5: Modals */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={()=>{setIsCreateModalOpen(false); setEditingTask(null)}}
                onSuccess={fetchTasks}
                members={members}
                initialTask={editingTask}
            />

            <TaskDetailModal 
                isOpen={Boolean(selectedTask)} 
                task={selectedTask} 
                onClose={() => setSelectedTask(null)} 
                onTaskUpdate={handleTaskUpdated} 
                onTaskDelete={handleTaskDeleted} 
                onEditTask={handleEditFromDetail} 
            />
        </div>
    );
}