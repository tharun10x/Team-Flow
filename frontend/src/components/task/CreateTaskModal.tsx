import { useState, useEffect } from "react";
import { taskApi } from "../../api/task";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import type { Task, TaskPriority } from "../../types/task";
import { useWorkspace } from "../../context/WorkspaceContext";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  members: Array<{ userId: number; name: string }>;
  initialTask?: Task | null;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
  members,
  initialTask,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string | number>("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [deadline, setDeadline] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || "");
      setDescription(initialTask.description || "");
      setAssigneeId(
        initialTask.assignee?.id ? String(initialTask.assignee.id) : ""
      );
      setPriority(initialTask.priority || "MEDIUM");
      setDeadline(
        initialTask.deadline ? initialTask.deadline.substring(0, 16) : ""
      );
    } else {
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setPriority("MEDIUM");
      setDeadline("");
    }
  }, [initialTask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim() === "") {
      toast.error("Title is required");
      return;
    }

    const cleanAssigneeId = assigneeId ? Number(assigneeId) : null;
    const cleanDescription = description.trim() ? description.trim() : undefined;
    const cleanDeadline = deadline
      ? deadline.length === 16
        ? `${deadline}:00`
        : deadline
      : null;

    const payload = {
      title: title.trim(),
      description: cleanDescription,
      assigneeId: cleanAssigneeId,
      priority: priority,
      deadline: cleanDeadline,
    };

    try {
      setIsLoading(true);
      if (initialTask) {
        await taskApi.updateTask(initialTask.id, payload);
        toast.success("Task updated successfully!");
      } else {
        if (!currentWorkspace?.id) return;
        await taskApi.createTask(currentWorkspace.id, payload);
        toast.success("Task created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save task");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Box */}
      <div
        className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {initialTask ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design landing page"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm"
                required
                autoFocus
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                rows={3}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm resize-none"
              />
            </div>

            {/* Two-Column Grid: Assignee & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assignee Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm bg-white"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option value={m.userId} key={m.userId}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as TaskPriority)
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm bg-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {/* Deadline Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Deadline{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm text-gray-700 bg-white"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center min-w-30 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : initialTask ? (
                "Save Changes"
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Click outside backdrop overlay */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}