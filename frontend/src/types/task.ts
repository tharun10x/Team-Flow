export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "COMPLETED";

export type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";


export interface TaskUserSummary {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Task{
  id: number;
  workspaceId: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string | null;
  completedAt?: string | null;
  isOverdue: boolean;
  overdue?: boolean; // Fallback in case primitive boolean is used on backend
  assignee?: TaskUserSummary | null;
  createdBy: TaskUserSummary;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment{
    id: number;
  taskId: number;
  user: TaskUserSummary;
  content: string;
  createdAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assigneeId?: number | null;
  priority?: TaskPriority;
  deadline?: string | null; // ISO string: "YYYY-MM-DDTHH:mm:ss"
}

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  assigneeId?: number | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string | null;
}

export interface TaskFilterParams {
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
  assigneeId?: number | "";
  search?: string;
  page?: number;
  size?: number;
  sort?: string; // e.g., "deadline,asc" or "createdAt,desc"
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}