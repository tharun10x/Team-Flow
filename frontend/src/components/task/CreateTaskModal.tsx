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
    <div className="modal-back">
      {/* Modal Box */}
      <div
        className="modal max-w-lg!"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <h2 className="section-title">
            {initialTask ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="label">
                Title <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design landing page"
                className="field field-lg"
                required
                autoFocus
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="label">
                Description{" "}
                <span className="text-muted font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                rows={3}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What needs to be done?"
                className="field field-lg resize-none"
              />
            </div>

            {/* Two-Column Grid: Assignee & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assignee Select */}
              <div>
                <label className="label">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="field field-lg"
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
                <label className="label">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as TaskPriority)
                  }
                  className="field field-lg"
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
              <label className="label">
                Deadline{" "}
                <span className="text-muted font-normal">(Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="field field-lg"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-rule">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-lg min-w-32"
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