import { useEffect, useState } from "react";
import type { Task, TaskStatus, TaskPriority } from "../types/task";
import { useWorkspace } from "../context/WorkspaceContext";
import api from "../api/axios";
import { taskApi } from "../api/task";
import { useAuth } from "../context/AuthContext";
import { CreateTaskModal } from "../components/task/CreateTaskModal";
import { TaskDetailModal } from "../components/task/TaskDetailModal";
import { TaskCard } from "../components/task/TaskCard";
import { Plus, Search, CheckSquare, X } from "lucide-react";
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

    const counts = [
        { label: "Total", value: totalTasks, tone: "text-ink" },
        { label: "In Progress", value: inProgressTasks, tone: "text-ink" },
        { label: "Completed", value: completedTasks, tone: "text-ink" },
        { label: "Overdue", value: overdueTasks, tone: overdueTasks > 0 ? "text-error" : "text-ink" },
    ];

    return(
        <div className="page space-y-6">
            {/* BLOCK 1: Header, with the counts set as the header figures */}
            <div className="flex flex-col gap-6 border-b border-rule pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="page-title">Tasks</h1>
                    <p className="mt-1 text-sm text-muted">
                        <span className="font-medium text-ink-2">{currentWorkspace?.name}</span>, {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-6">
                    {/* BLOCK 2: Quick Stats */}
                    <dl className="grid grid-cols-2 gap-y-3 sm:flex sm:divide-x sm:divide-rule">
                        {counts.map((c) => (
                            <div key={c.label} className="sm:px-5 sm:first:pl-0 sm:last:pr-0">
                                <dt className="text-xs text-muted">{c.label}</dt>
                                <dd className={`font-display text-2xl font-semibold tabular-nums ${c.tone}`}>{c.value}</dd>
                            </div>
                        ))}
                    </dl>

                    {/* if its owner or admin load the create modal */}
                    {isOwnerOrAdmin && (
                        <button
                            type="button"
                            onClick={() => {
                            setEditingTask(null);
                            setIsCreateModalOpen(true);
                            }}
                            className="btn"
                        >
                            <Plus className="h-4 w-4" />
                            New Task
                        </button>
                    )}
                </div>
            </div>

            {/* BLOCK 3: Filter & Search Bar */}
            <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
                {/* Live Search Input */}
                <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks by title..."
                    aria-label="Search tasks by title"
                    className="field pl-9! pr-9!"
                />
                {search && (
                    <button type="button" onClick={() => setSearch("")} className="btn btn-ghost btn-icon absolute right-0.5 top-1/2 min-h-8! w-8! -translate-y-1/2" aria-label="Clear search">
                    <X className="h-3.5 w-3.5" />
                    </button>
                )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2 overflow-x-auto">
                {/* Status */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "")}
                    aria-label="Filter by status"
                    className="field w-auto!"
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
                    aria-label="Filter by priority"
                    className="field w-auto!"
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
                    aria-label="Filter by assignee"
                    className="field w-auto!"
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
                    type="button"
                    onClick={() => {
                        setStatusFilter("");
                        setPriorityFilter("");
                        setAssigneeFilter("");
                        setSearch("");
                    }}
                    className="btn btn-ghost"
                    >
                    Reset
                    </button>
                )}
                </div>
            </div>

            {/* BLOCK 4: The task ledger */}
            {isLoading ? (
                <div role="status" aria-label="Loading workspace tasks...">
                    <div className="border-b border-rule-2 py-2" />
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-6 border-b border-rule px-3 py-4">
                            <div className="skeleton h-4 flex-1" />
                            <div className="skeleton hidden h-4 w-28 md:block" />
                            <div className="skeleton hidden h-4 w-20 md:block" />
                            <div className="skeleton h-8 w-36" />
                            <div className="skeleton h-4 w-24" />
                        </div>
                    ))}
                </div>
            ) : tasks.length === 0 ? (
                <div className="well flex flex-col items-center justify-center gap-3 p-12 text-center">
                <CheckSquare className="h-6 w-6 text-muted" />
                <h3 className="section-title">No tasks found</h3>
                <p className="max-w-sm text-sm text-ink-2">
                    {search || statusFilter || priorityFilter || assigneeFilter
                    ? "No tasks match your active filters. Try resetting the filters above."
                    : "Get started by creating your first task for this workspace!"}
                </p>
                {isOwnerOrAdmin && !search && !statusFilter && !priorityFilter && !assigneeFilter && (
                    <button
                    type="button"
                    onClick={() => {
                        setEditingTask(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="btn mt-2"
                    >
                    Create First Task
                    </button>
                )}
                </div>
            ) : (
                <div>
                    <div className="hidden grid-cols-[minmax(0,1fr)_9rem_7rem_9.5rem_8rem] gap-x-4 border-b border-rule-2 px-3 py-2 font-display text-sm font-medium text-muted md:grid" aria-hidden="true">
                        <span>Task</span><span>Assignee</span><span>Priority</span><span>Status</span><span className="text-right">Deadline</span>
                    </div>
                    <ul>
                    {tasks.map((task) => (
                        <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTask(task)}
                        onStatusChange={(_id, status) => handleTaskUpdated({ ...task, status })}
                        />
                    ))}
                    </ul>
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
