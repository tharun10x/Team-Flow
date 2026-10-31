import type{ TaskPriority, TaskStatus } from "../../types/task";
import { AlertCircle, AlertTriangle, Flag } from "lucide-react";

export const STATUS_CONFIG: Record<
TaskStatus,
{ label: string; bg: string; text: string; dot: string; border: string }
> = {
    TODO: {
    label: "To Do",
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-400",
    border: "border-gray-200",
  },
    IN_PROGRESS: {
        label: "In Progress",
        bg: "bg-blue-50",
        text: "text-blue-700",
        dot: "bg-blue-500",
        border: "border-blue-200",
    },
    BLOCKED: {
        label: "Blocked",
        bg: "bg-red-50",
        text: "text-red-700",
        dot: "bg-red-500",
        border: "border-red-200",
    },
    COMPLETED: {
        label: "Completed",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        border: "border-emerald-200",
    },
}

export const PRIORITY_CONFIG: Record<
TaskPriority,
{ label: string; bg: string; text: string; border: string }
> = {
    LOW: {
    label: "Low",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    },
    MEDIUM: {
        label: "Medium",
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        border: "border-indigo-200",
    },
    HIGH: {
        label: "High",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
    },
    CRITICAL: {
        label: "Critical",
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
    },
}

export function PriorityBadge({ priority }: { priority: TaskPriority }){
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
    const Icon = priority === "CRITICAL" ? AlertTriangle : Flag;

    return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }){
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.TODO;
    return (
        <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
        >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
        </span>
    );
}

export function OverdueBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
      <AlertCircle className="w-3 h-3" />
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