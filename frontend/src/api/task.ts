import api from "./axios";
import type {
  Task,
  TaskComment,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilterParams,
  TaskStatus,
  PageResponse,
} from "../types/task";

export const taskApi = {
  // 1. Get filtered & paginated tasks for a workspace
  getWorkspaceTasks: async (
    workspaceId: number,
    filters: TaskFilterParams = {}
  ): Promise<PageResponse<Task>> => {
    // Strip out empty string or undefined filter values so query URL stays clean
    const params: Record<string, string | number> = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.assigneeId) params.assigneeId = filters.assigneeId;
    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.size !== undefined) params.size = filters.size;
    if (filters.sort) params.sort = filters.sort;

    const response = await api.get(`/workspaces/${workspaceId}/tasks`, { params });
    return response.data.data;
  },

  // 2. Create a new task (OWNER / ADMIN)
  createTask: async (
    workspaceId: number,
    payload: CreateTaskPayload
  ): Promise<Task> => {
    const response = await api.post(`/workspaces/${workspaceId}/tasks`, payload);
    return response.data.data;
  },

  // 3. Get single task details
  getTaskById: async (taskId: number): Promise<Task> => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data.data;
  },

  // 4. Full task update (OWNER / ADMIN)
  updateTask: async (
    taskId: number,
    payload: UpdateTaskPayload
  ): Promise<Task> => {
    const response = await api.put(`/tasks/${taskId}`, payload);
    return response.data.data;
  },

  // 5. Quick status update (OWNER / ADMIN / ASSIGNEE)
  updateTaskStatus: async (
    taskId: number,
    status: TaskStatus
  ): Promise<Task> => {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return response.data.data;
  },

  // 6. Delete task (OWNER / ADMIN)
  deleteTask: async (taskId: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },

  // 7. Get comments for a task
  getComments: async (taskId: number): Promise<TaskComment[]> => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data.data;
  },

  // 8. Add a comment to a task
  addComment: async (taskId: number, content: string): Promise<TaskComment> => {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data.data;
  },
};