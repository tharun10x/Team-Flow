import type{ TaskPriority, TaskStatus } from "../../types/task";
import { AlertCircle, AlertTriangle, Flag } from "lucide-react";

export const STATUS_CONFIG: Record<
TaskStatus,
{ label: string; bg: string; text: string; dot: string; border: string }
> = {
    TODO: {
    label: "To Do",
    bg: "bg-paper-3",
    text: "text-muted",
    dot: "bg-paper-2",
    border: "border-rule",
  },
    IN_PROGRESS: {
        label: "In Progress",
        bg: "bg-accent-wash",
        text: "text-accent",
        dot: "bg-primary",
        border: "border-rule-2",
    },
    BLOCKED: {
        label: "Blocked",
        bg: "bg-error-wash",
        text: "text-error",
        dot: "bg-error",
        border: "border-rule",
    },
    COMPLETED: {
        label: "Completed",
        bg: "bg-success-wash",
        text: "text-success",
        dot: "bg-success",
        border: "border-rule",
    },
}

export const PRIORITY_CONFIG: Record<
TaskPriority,
{ label: string; bg: string; text: string; border: string }
> = {
    LOW: {
    label: "Low",
    bg: "bg-paper-3",
    text: "text-muted",
    border: "border-rule",
    },
    MEDIUM: {
        label: "Medium",
        bg: "bg-paper-3",
        text: "text-ink-2",
        border: "border-rule-2",
    },
    HIGH: {
        label: "High",
        bg: "bg-warn-wash",
        text: "text-warn",
        border: "border-rule",
    },
    CRITICAL: {
        label: "Critical",
        bg: "bg-error-wash",
        text: "text-error",
        border: "border-rule",
    },
}

export function PriorityBadge({ priority }: { priority: TaskPriority }){
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
    const Icon = priority === "CRITICAL" ? AlertTriangle : Flag;

    return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap text-sm ${config.text} ${priority === "LOW" ? "" : "font-medium"}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }){
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.TODO;
    return (
        <span
        className={`inline-flex items-center whitespace-nowrap text-sm font-medium ${config.text}`}
        >
        {config.label}
        </span>
    );
}

export function OverdueBadge() {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-error">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      Overdue
    </span>
  );
}


export function formatDeadline(deadline?: string | null): string {
  if (!deadline) return "No deadline";
  const date = new Date(deadline);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}