import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, MessageSquare, CheckSquare, Users, Settings,
  Bell, Search, Plus, MoreHorizontal, Sparkles, ChevronDown,
  Clock, CheckCircle2, ArrowUpRight, Hash, Send, X, Calendar,
  Tag, ChevronRight, AtSign, AlertCircle, Edit3, LogOut,
  HelpCircle, Filter, Paperclip, MessageCircle, Activity,
  Mail, Globe, Briefcase, TrendingUp, Zap, Star, BarChart2, MapPin,
  Shield, CreditCard, Moon, Sun, Volume2, Layers, Target,
  Circle, UserPlus, ArrowDownRight, Inbox, CheckCheck,
  RefreshCw, Copy, ExternalLink, MoreVertical, Smile,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Toaster, toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewId = "dashboard" | "messages" | "tasks" | "team" | "settings";
type Priority = "high" | "medium" | "low";
type TaskStatus = "todo" | "in-progress" | "review" | "done";
type MemberStatus = "online" | "away" | "offline";

interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
  color: string;
  status: MemberStatus;
  tasksCompleted: number;
  location: string;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  project: string;
  projectColor: string;
  dueDate: string;
  comments: number;
  attachments: number;
  tags: string[];
}

interface ChatMessage {
  id: string;
  authorId: string;
  content: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
}

interface Channel {
  id: string;
  name: string;
  unread: number;
  type: "channel" | "dm";
}

interface Notification {
  id: string;
  type: "mention" | "task" | "comment" | "done" | "invite";
  actor: string;
  action: string;
  target: string;
  time: string;
  read: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MEMBERS: Member[] = [
  { id: "1", name: "Alex Chen", role: "Product Manager", email: "alex@teamflow.io", initials: "AC", color: "#4F46E5", status: "online", tasksCompleted: 18, location: "San Francisco, CA" },
  { id: "2", name: "Jordan Williams", role: "Lead Engineer", email: "jordan@teamflow.io", initials: "JW", color: "#0EA5E9", status: "online", tasksCompleted: 24, location: "Austin, TX" },
  { id: "3", name: "Priya Patel", role: "UX Designer", email: "priya@teamflow.io", initials: "PP", color: "#8B5CF6", status: "away", tasksCompleted: 15, location: "New York, NY" },
  { id: "4", name: "Marcus Johnson", role: "Backend Developer", email: "marcus@teamflow.io", initials: "MJ", color: "#F59E0B", status: "online", tasksCompleted: 21, location: "Chicago, IL" },
  { id: "5", name: "Sofia Rodriguez", role: "Marketing Lead", email: "sofia@teamflow.io", initials: "SR", color: "#22C55E", status: "offline", tasksCompleted: 11, location: "Miami, FL" },
  { id: "6", name: "David Kim", role: "Frontend Developer", email: "david@teamflow.io", initials: "DK", color: "#EF4444", status: "online", tasksCompleted: 19, location: "Seattle, WA" },
];

const TASKS: Task[] = [
  { id: "t1", title: "Redesign onboarding flow", status: "in-progress", priority: "high", assigneeId: "3", project: "Product Redesign", projectColor: "#4F46E5", dueDate: "Jul 18", comments: 5, attachments: 2, tags: ["design", "ux"] },
  { id: "t2", title: "Fix authentication token refresh", status: "todo", priority: "high", assigneeId: "4", project: "Backend API v2", projectColor: "#0EA5E9", dueDate: "Jul 16", comments: 3, attachments: 0, tags: ["bug", "auth"] },
  { id: "t3", title: "Write API documentation", status: "review", priority: "medium", assigneeId: "2", project: "Backend API v2", projectColor: "#0EA5E9", dueDate: "Jul 20", comments: 7, attachments: 1, tags: ["docs"] },
  { id: "t4", title: "Q3 campaign landing page", status: "in-progress", priority: "high", assigneeId: "5", project: "Q3 Marketing", projectColor: "#F59E0B", dueDate: "Jul 22", comments: 2, attachments: 3, tags: ["marketing"] },
  { id: "t5", title: "Set up CI/CD pipeline", status: "done", priority: "medium", assigneeId: "2", project: "Backend API v2", projectColor: "#0EA5E9", dueDate: "Jul 14", comments: 4, attachments: 0, tags: ["devops"] },
  { id: "t6", title: "User research interviews", status: "todo", priority: "medium", assigneeId: "1", project: "Product Redesign", projectColor: "#4F46E5", dueDate: "Jul 25", comments: 1, attachments: 0, tags: ["research"] },
  { id: "t7", title: "Implement global search", status: "todo", priority: "low", assigneeId: "6", project: "Backend API v2", projectColor: "#0EA5E9", dueDate: "Jul 28", comments: 0, attachments: 0, tags: ["feature"] },
  { id: "t8", title: "Social media asset pack", status: "review", priority: "low", assigneeId: "3", project: "Q3 Marketing", projectColor: "#F59E0B", dueDate: "Jul 19", comments: 6, attachments: 5, tags: ["design"] },
  { id: "t9", title: "Lighthouse performance audit", status: "done", priority: "medium", assigneeId: "6", project: "Product Redesign", projectColor: "#4F46E5", dueDate: "Jul 15", comments: 2, attachments: 1, tags: ["perf"] },
  { id: "t10", title: "Email template redesign", status: "in-progress", priority: "low", assigneeId: "5", project: "Q3 Marketing", projectColor: "#F59E0B", dueDate: "Jul 24", comments: 3, attachments: 2, tags: ["email"] },
  { id: "t11", title: "Mobile push notifications", status: "todo", priority: "high", assigneeId: "4", project: "Mobile App", projectColor: "#22C55E", dueDate: "Jul 30", comments: 0, attachments: 0, tags: ["mobile"] },
  { id: "t12", title: "Migrate to PostgreSQL 16", status: "done", priority: "high", assigneeId: "2", project: "Backend API v2", projectColor: "#0EA5E9", dueDate: "Jul 13", comments: 8, attachments: 2, tags: ["db"] },
];

const CHANNELS: Channel[] = [
  { id: "c1", name: "general", unread: 3, type: "channel" },
  { id: "c2", name: "product", unread: 12, type: "channel" },
  { id: "c3", name: "engineering", unread: 0, type: "channel" },
  { id: "c4", name: "design", unread: 5, type: "channel" },
  { id: "c5", name: "marketing", unread: 0, type: "channel" },
  { id: "c6", name: "Jordan Williams", unread: 1, type: "dm" },
  { id: "c7", name: "Priya Patel", unread: 0, type: "dm" },
];

const MESSAGES: Record<string, ChatMessage[]> = {
  c2: [
    { id: "m1", authorId: "1", content: "Hey team! I've updated the onboarding flow designs in Figma. Would love some feedback before we kick off implementation.", time: "10:24 AM", reactions: [{ emoji: "👍", count: 3 }, { emoji: "🔥", count: 2 }] },
    { id: "m2", authorId: "3", content: "Looking great, Alex! The new user flow is much more intuitive. Left some comments around the tooltip placements on step 3.", time: "10:31 AM" },
    { id: "m3", authorId: "2", content: "From an engineering perspective, the step 3 interactions might need extra thought for mobile viewports. Can we sync this afternoon?", time: "10:45 AM", reactions: [{ emoji: "✅", count: 1 }] },
    { id: "m4", authorId: "1", content: "Absolutely — let's do 3pm. I'll send a calendar invite now.", time: "10:47 AM" },
    { id: "m5", authorId: "6", content: "Also just finished the Lighthouse audit on the current onboarding. Main bottleneck is the hero image loading on step 2 — LCP is at 4.1s. Worth fixing before we ship the new flow.", time: "11:02 AM", reactions: [{ emoji: "💡", count: 2 }] },
    { id: "m6", authorId: "4", content: "Good catch David. I can optimize the asset pipeline this sprint and bring that LCP down well under 2.5s.", time: "11:15 AM" },
    { id: "m7", authorId: "3", content: "I'll export all new assets with next-gen formats (AVIF/WebP) and proper srcsets. Will share the Figma export settings too so we stay consistent.", time: "11:22 AM", reactions: [{ emoji: "🙌", count: 4 }] },
    { id: "m8", authorId: "1", content: "Perfect. Let's aim to have the optimised assets merged by Thursday so QA has Friday for a full pass.", time: "11:35 AM" },
  ],
  c1: [
    { id: "g1", authorId: "5", content: "Good morning everyone! 🌅 Weekly standup notes are in Notion. Big week ahead — Q3 campaign launches Friday.", time: "9:01 AM" },
    { id: "g2", authorId: "2", content: "Morning! Backend deploy went smoothly overnight. All green on staging.", time: "9:04 AM", reactions: [{ emoji: "🎉", count: 5 }] },
    { id: "g3", authorId: "4", content: "PostgreSQL migration is fully done and verified. We're on v16 now. Performance improvements are noticeable on the dashboard queries.", time: "9:12 AM" },
  ],
};

const ACTIVITY_DATA = [
  { day: "Mon", tasksCreated: 4, tasksCompleted: 2, messages: 23 },
  { day: "Tue", tasksCreated: 7, tasksCompleted: 5, messages: 31 },
  { day: "Wed", tasksCreated: 5, tasksCompleted: 3, messages: 18 },
  { day: "Thu", tasksCreated: 9, tasksCompleted: 8, messages: 42 },
  { day: "Fri", tasksCreated: 6, tasksCompleted: 6, messages: 29 },
  { day: "Sat", tasksCreated: 2, tasksCompleted: 2, messages: 8 },
  { day: "Sun", tasksCreated: 3, tasksCompleted: 1, messages: 11 },
];

const PROJECT_PROGRESS = [
  { name: "Product Redesign", total: 8, done: 5, color: "#4F46E5" },
  { name: "Backend API v2", total: 6, done: 4, color: "#0EA5E9" },
  { name: "Q3 Marketing", total: 5, done: 2, color: "#F59E0B" },
  { name: "Mobile App", total: 4, done: 1, color: "#22C55E" },
];

const NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "mention", actor: "Jordan Williams", action: "mentioned you in", target: "#engineering", time: "2m ago", read: false },
  { id: "n2", type: "task", actor: "Priya Patel", action: "assigned you a task:", target: "Redesign onboarding flow", time: "15m ago", read: false },
  { id: "n3", type: "comment", actor: "Marcus Johnson", action: "commented on", target: "Fix authentication token refresh", time: "1h ago", read: false },
  { id: "n4", type: "done", actor: "David Kim", action: "completed", target: "Lighthouse performance audit", time: "2h ago", read: true },
  { id: "n5", type: "invite", actor: "Alex Chen", action: "added you to project", target: "Mobile App", time: "Yesterday", read: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMember(id: string) {
  return MEMBERS.find((m) => m.id === id)!;
}

function priorityConfig(p: Priority) {
  return {
    high: { label: "High", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
    medium: { label: "Medium", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
    low: { label: "Low", bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  }[p];
}

function statusConfig(s: TaskStatus) {
  return {
    "todo": { label: "To Do", bg: "bg-slate-100", text: "text-slate-600" },
    "in-progress": { label: "In Progress", bg: "bg-indigo-50", text: "text-indigo-600" },
    "review": { label: "Review", bg: "bg-amber-50", text: "text-amber-600" },
    "done": { label: "Done", bg: "bg-green-50", text: "text-green-600" },
  }[s];
}

function memberStatusColor(s: MemberStatus) {
  return { online: "bg-green-400", away: "bg-amber-400", offline: "bg-slate-300" }[s];
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Avatar({ id, size = "md" }: { id: string; size?: "xs" | "sm" | "md" | "lg" }) {
  const member = getMember(id);
  const sizes = { xs: "w-5 h-5 text-[9px]", sm: "w-7 h-7 text-xs", md: "w-8 h-8 text-xs", lg: "w-10 h-10 text-sm" };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: member.color }}
    >
      {member.initials}
    </div>
  );
}

function MeAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-8 h-8 text-xs", lg: "w-10 h-10 text-sm" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600`}>
      AC
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "indigo" | "green" | "amber" | "red" | "slate" }) {
  const variants = {
    default: "bg-slate-100 text-slate-600",
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

function Btn({
  children, variant = "primary", size = "md", onClick, className = "", disabled = false,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer select-none";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300",
    ghost: "text-gray-500 hover:text-gray-800 hover:bg-gray-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

function ProgressBar({ value, color = "#4F46E5", className = "" }: { value: number; color?: string; className?: string }) {
  return (
    <div className={`h-1.5 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />;
}

function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 ${onClick ? "cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "messages", label: "Messages", icon: MessageSquare, badge: 15 },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "team", label: "Team", icon: Users },
];

const PROJECTS = [
  { name: "Product Redesign", color: "#4F46E5", id: "p1" },
  { name: "Backend API v2", color: "#0EA5E9", id: "p2" },
  { name: "Q3 Marketing", color: "#F59E0B", id: "p3" },
  { name: "Mobile App", color: "#22C55E", id: "p4" },
];

function Sidebar({ view, onNavigate }: { view: ViewId; onNavigate: (v: ViewId) => void }) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  return (
    <aside className="w-60 shrink-0 h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
            <Layers className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-gray-900 font-semibold text-[15px] tracking-tight">TeamFlow</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6 scrollbar-none">
        {/* Workspace Selector */}
        <div className="relative">
          <button
            onClick={() => setWorkspaceOpen((o) => !o)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-150 group"
          >
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">S</div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">Startup HQ</p>
              <p className="text-[11px] text-gray-400">6 members</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${workspaceOpen ? "rotate-180" : ""}`} />
          </button>
          {workspaceOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-100 z-50 py-1.5 overflow-hidden">
              {["Startup HQ", "Side Project", "Personal"].map((ws) => (
                <button
                  key={ws}
                  onClick={() => { setWorkspaceOpen(false); toast.success(`Switched to ${ws}`); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  <div className="w-5 h-5 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {ws[0]}
                  </div>
                  {ws}
                </button>
              ))}
              <div className="border-t border-gray-50 mt-1 pt-1">
                <button
                  onClick={() => { setWorkspaceOpen(false); toast("Create workspace coming soon"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-500"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Nav */}
        <nav className="flex flex-col gap-0.5">
          <p className="px-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Main</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id as ViewId)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 1.75} />
                <span className="flex-1 text-left">{label}</span>
                {badge && !active && (
                  <span className="text-[10px] font-semibold bg-indigo-600 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between px-2.5 mb-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Projects</p>
            <button onClick={() => toast("Create project coming soon")} className="text-gray-300 hover:text-gray-500 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all duration-150"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="flex-1 text-left truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-50 px-3 py-3 flex flex-col gap-0.5">
        <button
          onClick={() => onNavigate("settings")}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
            view === "settings" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          Settings
        </button>
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all duration-150">
          <HelpCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          Help & Support
        </button>
        <div className="flex items-center gap-2.5 px-2.5 py-2 mt-1">
          <div className="relative">
            <MeAvatar size="sm" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Alex Chen</p>
            <p className="text-[10px] text-gray-400 truncate">Product Manager</p>
          </div>
          <button className="text-gray-300 hover:text-gray-500 transition-colors">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── TopNav ───────────────────────────────────────────────────────────────────

const VIEW_TITLES: Record<ViewId, string> = {
  dashboard: "Dashboard",
  messages: "Messages",
  tasks: "Tasks",
  team: "Team",
  settings: "Settings",
};

function TopNav({
  view,
  onBell,
  unreadCount,
}: {
  view: ViewId;
  onBell: () => void;
  unreadCount: number;
}) {
  const [search, setSearch] = useState("");

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900">{VIEW_TITLES[view]}</h1>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search anything…"
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Btn
          variant="primary"
          size="sm"
          onClick={() => toast.success("Create dialog coming soon")}
        >
          <Plus className="w-3.5 h-3.5" />
          Create
        </Btn>

        <button
          onClick={onBell}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150"
        >
          <Bell className="w-4.5 h-4.5" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          )}
        </button>

        <button className="relative group flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-all duration-150">
          <div className="relative">
            <MeAvatar size="sm" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white" />
          </div>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    </header>
  );
}

// ─── Notification Panel ───────────────────────────────────────────────────────

function NotifIcon({ type }: { type: Notification["type"] }) {
  const configs = {
    mention: { icon: AtSign, bg: "bg-indigo-50", color: "text-indigo-600" },
    task: { icon: CheckSquare, bg: "bg-green-50", color: "text-green-600" },
    comment: { icon: MessageCircle, bg: "bg-amber-50", color: "text-amber-600" },
    done: { icon: CheckCircle2, bg: "bg-green-50", color: "text-green-600" },
    invite: { icon: UserPlus, bg: "bg-violet-50", color: "text-violet-600" },
  };
  const { icon: Icon, bg, color } = configs[type];
  return (
    <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
  );
}

function NotificationPanel({ onClose, onRead }: { onClose: () => void; onRead: () => void }) {
  useEffect(() => {
    onRead();
  }, []);

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="absolute top-16 right-4 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-2">
            <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Mark all read</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {NOTIFICATIONS.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? "bg-indigo-50/30" : ""}`}
            >
              <NotifIcon type={n.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-snug">
                  <span className="font-medium text-gray-900">{n.actor}</span> {n.action}{" "}
                  <span className="font-medium text-gray-900">{n.target}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-gray-50">
          <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium w-full text-center">
            View all notifications
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Activity Chart (CSS — avoids recharts multi-series clipPath key collision) ─

function ActivityChart() {
  const maxVal = Math.max(...ACTIVITY_DATA.map((d) => Math.max(d.tasksCreated, d.tasksCompleted)));
  const chartH = 148;

  return (
    <div className="flex gap-3">
      {/* Y axis */}
      <div className="flex flex-col justify-between text-[10px] text-gray-400 pb-5" style={{ height: chartH + 20 }}>
        {[maxVal, Math.round(maxVal * 0.5), 0].map((v) => (
          <span key={v} className="leading-none">{v}</span>
        ))}
      </div>
      {/* Bars + x-axis */}
      <div className="flex-1">
        <div className="relative flex items-end justify-around gap-1" style={{ height: chartH }}>
          {/* Gridlines */}
          <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2].map((i) => <div key={i} className="border-t border-gray-100 w-full" />)}
          </div>
          {ACTIVITY_DATA.map((d) => {
            const hCreated = Math.max(4, Math.round((d.tasksCreated / maxVal) * (chartH - 8)));
            const hCompleted = Math.max(4, Math.round((d.tasksCompleted / maxVal) * (chartH - 8)));
            return (
              <div key={d.day} className="flex-1 flex justify-center items-end group relative z-10">
                {/* Hover tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-lg">
                  <p className="font-semibold mb-0.5">{d.day}</p>
                  <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-300 inline-block" />{d.tasksCreated} created</p>
                  <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />{d.tasksCompleted} completed</p>
                </div>
                <div className="flex items-end gap-0.5">
                  <div className="w-4 bg-indigo-200 rounded-t-md group-hover:bg-indigo-300 transition-colors duration-150" style={{ height: hCreated }} />
                  <div className="w-4 bg-indigo-600 rounded-t-md group-hover:bg-indigo-700 transition-colors duration-150" style={{ height: hCompleted }} />
                </div>
              </div>
            );
          })}
        </div>
        {/* X-axis labels */}
        <div className="flex justify-around mt-2">
          {ACTIVITY_DATA.map((d) => (
            <span key={d.day} className="flex-1 text-center text-[10px] text-gray-400">{d.day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-2 text-gray-500">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="capitalize">{p.name.replace(/([A-Z])/g, " $1")}</span>:
          <span className="font-semibold text-gray-700">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function StatCard({ label, value, delta, icon: Icon, iconBg, trend }: {
  label: string;
  value: string;
  delta: string;
  icon: React.ElementType;
  iconBg: string;
  trend: "up" | "down";
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-500"}`}>
          {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {delta}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
    </Card>
  );
}

function DashboardView() {
  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Good morning, Alex 👋</h2>
          <p className="text-sm text-gray-400 mt-0.5">Tuesday, July 15 · 3 high-priority tasks due this week</p>
        </div>
        <Btn variant="secondary" size="sm" onClick={() => toast("Week overview coming soon")}>
          <Activity className="w-3.5 h-3.5" />
          Week overview
        </Btn>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Tasks completed" value="47" delta="12% this week" icon={CheckCircle2} iconBg="bg-green-50 text-green-600" trend="up" />
        <StatCard label="Open tasks" value="23" delta="3 new today" icon={CheckSquare} iconBg="bg-indigo-50 text-indigo-600" trend="up" />
        <StatCard label="Messages sent" value="162" delta="8% vs last week" icon={MessageSquare} iconBg="bg-violet-50 text-violet-600" trend="up" />
        <StatCard label="Overdue tasks" value="4" delta="2 from yesterday" icon={AlertCircle} iconBg="bg-red-50 text-red-500" trend="down" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Activity Chart */}
        <Card className="col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Team Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Tasks created and completed · This week</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-200 inline-block" />Created</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />Completed</span>
            </div>
          </div>
          <ActivityChart />
        </Card>

        {/* Project Progress */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Project Progress</h3>
            <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">View all</button>
          </div>
          <div className="flex flex-col gap-5">
            {PROJECT_PROGRESS.map((p) => {
              const pct = Math.round((p.done / p.total) * 100);
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[110px]">{p.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} color={p.color} />
                  <p className="text-[10px] text-gray-400 mt-1">{p.done} of {p.total} tasks done</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* AI Summary + Recent Tasks */}
      <div className="grid grid-cols-3 gap-4">
        {/* AI Summary */}
        <Card className="p-5 col-span-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/30 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">AI Summary</h3>
                  <p className="text-[10px] text-gray-400">Updated just now</p>
                </div>
              </div>
              <button
                onClick={() => toast.success("Summary refreshed")}
                className="text-gray-300 hover:text-indigo-500 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <ul className="flex flex-col gap-3">
              {[
                { text: "Team completed 47 tasks this week — 20% ahead of sprint target.", color: "bg-indigo-400" },
                { text: "4 high-priority tasks are due in the next 48 hours.", color: "bg-red-400" },
                { text: "#product is the most active channel with 47 messages today.", color: "bg-indigo-400" },
                { text: "Jordan Williams leads completion rate at 89% this sprint.", color: "bg-green-400" },
                { text: "Q3 Marketing project is 2 days behind — 3 tasks still in review.", color: "bg-amber-400" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0 mt-1.5`} />
                  {item.text}
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-indigo-100/60">
              <p className="text-[10px] text-gray-400">Generated by TeamFlow AI · Powered by your team's activity data</p>
            </div>
          </div>
        </Card>

        {/* Recent Tasks */}
        <Card className="col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Tasks</h3>
            <Btn variant="ghost" size="sm">View all <ChevronRight className="w-3.5 h-3.5" /></Btn>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Task", "Project", "Assignee", "Priority", "Due", "Status"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TASKS.slice(0, 6).map((t) => {
                  const member = getMember(t.assigneeId);
                  const pri = priorityConfig(t.priority);
                  const sta = statusConfig(t.status);
                  return (
                    <tr key={t.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{t.title}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: t.projectColor }} />
                          <span className="truncate max-w-[100px]">{t.project}</span>
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1.5">
                          <Avatar id={t.assigneeId} size="xs" />
                          <span className="text-xs text-gray-500 truncate max-w-[70px]">{member.name.split(" ")[0]}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${pri.bg} ${pri.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
                          {pri.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-gray-500">{t.dueDate}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${sta.bg} ${sta.text}`}>
                          {sta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Team Activity Feed */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Team Activity</h3>
          <Btn variant="ghost" size="sm">See all</Btn>
        </div>
        <div className="flex flex-wrap gap-3">
          {MEMBERS.map((m) => (
            <div key={m.id} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="relative">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: m.color }}>
                  {m.initials}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${memberStatusColor(m.status)}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{m.name.split(" ")[0]}</p>
                <p className="text-[10px] text-gray-400">{m.tasksCompleted} tasks done</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Messages View ────────────────────────────────────────────────────────────

function MessagesView() {
  const [activeChannel, setActiveChannel] = useState("c2");
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState(MESSAGES);
  const bottomRef = useRef<HTMLDivElement>(null);

  const channel = CHANNELS.find((c) => c.id === activeChannel)!;
  const msgs = localMessages[activeChannel] || [];

  function sendMessage() {
    if (!input.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      authorId: "1",
      content: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setLocalMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg],
    }));
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <div className="flex h-full gap-0 -m-6 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      {/* Channel List */}
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="px-4 pt-5 pb-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Channels</p>
          {CHANNELS.filter((c) => c.type === "channel").map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChannel(c.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all duration-150 mb-0.5 ${
                activeChannel === c.id ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <Hash className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 text-left">{c.name}</span>
              {c.unread > 0 && activeChannel !== c.id && (
                <span className="text-[10px] font-bold bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center">{c.unread}</span>
              )}
            </button>
          ))}
        </div>
        <div className="px-4 pt-2 pb-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Direct Messages</p>
          {CHANNELS.filter((c) => c.type === "dm").map((c) => {
            const member = MEMBERS.find((m) => m.name === c.name);
            return (
              <button
                key={c.id}
                onClick={() => setActiveChannel(c.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all duration-150 mb-0.5 ${
                  activeChannel === c.id ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: member?.color || "#6B7280" }}>
                    {member?.initials || c.name[0]}
                  </div>
                  {member && <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${memberStatusColor(member.status)}`} />}
                </div>
                <span className="flex-1 text-left truncate">{c.name.split(" ")[0]}</span>
                {c.unread > 0 && <span className="text-[10px] font-bold bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center">{c.unread}</span>}
              </button>
            );
          })}
        </div>
        <div className="mt-auto px-4 py-3 border-t border-gray-50">
          <button onClick={() => toast("Browse channels coming soon")} className="w-full flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add channels
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Channel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">{channel.name}</h2>
            <span className="text-xs text-gray-400">· {channel.members ?? 6} members</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {MEMBERS.slice(0, 4).map((m) => (
                <div key={m.id} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: m.color }}>
                  {m.initials[0]}
                </div>
              ))}
            </div>
            <Btn variant="ghost" size="sm">
              <Search className="w-3.5 h-3.5" />
            </Btn>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-1">
          {msgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to say something in #{channel.name}</p>
            </div>
          ) : (
            msgs.map((msg, i) => {
              const author = getMember(msg.authorId);
              const isMe = msg.authorId === "1";
              const prevAuthor = i > 0 ? msgs[i - 1].authorId : null;
              const grouped = prevAuthor === msg.authorId;
              return (
                <div key={msg.id} className={`flex items-start gap-3 group ${grouped ? "mt-0.5" : "mt-4"}`}>
                  {grouped ? (
                    <div className="w-8 shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ backgroundColor: author.color }}>
                      {author.initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {!grouped && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">{author.name}</span>
                        <span className="text-[10px] text-gray-400">{msg.time}</span>
                      </div>
                    )}
                    <p className={`text-sm text-gray-700 leading-relaxed ${isMe ? "text-gray-800" : ""}`}>{msg.content}</p>
                    {msg.reactions && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {msg.reactions.map((r) => (
                          <button key={r.emoji} className="flex items-center gap-1 bg-gray-100 hover:bg-indigo-50 rounded-full px-2 py-0.5 text-xs transition-colors">
                            <span>{r.emoji}</span>
                            <span className="text-gray-500 font-medium">{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 pt-1">
                    <button className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 pb-5 pt-3">
          <div className="flex items-end gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 focus-within:border-indigo-200 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <div className="flex items-center gap-2 shrink-0">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={`Message #${channel.name}`}
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none resize-none"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Smile className="w-4 h-4" />
              </button>
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  input.trim() ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tasks View ───────────────────────────────────────────────────────────────

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-slate-400" },
  { id: "in-progress", label: "In Progress", color: "bg-indigo-500" },
  { id: "review", label: "In Review", color: "bg-amber-400" },
  { id: "done", label: "Done", color: "bg-green-500" },
];

function TaskCard({ task }: { task: Task }) {
  const member = getMember(task.assigneeId);
  const pri = priorityConfig(task.priority);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50 transition-all duration-200 cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md"
          style={{ backgroundColor: task.projectColor + "18", color: task.projectColor }}
        >
          {task.project}
        </span>
        <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all">
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-sm font-medium text-gray-800 mb-3 leading-snug">{task.title}</p>
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">#{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar id={task.assigneeId} size="xs" />
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${pri.bg} ${pri.text}`}>
            <span className={`w-1 h-1 rounded-full ${pri.dot}`} />
            {pri.label}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-gray-400">
          {task.comments > 0 && (
            <span className="flex items-center gap-1 text-[10px]">
              <MessageCircle className="w-3 h-3" /> {task.comments}
            </span>
          )}
          {task.attachments > 0 && (
            <span className="flex items-center gap-1 text-[10px]">
              <Paperclip className="w-3 h-3" /> {task.attachments}
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px]">
            <Calendar className="w-3 h-3" /> {task.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
}

function TasksView() {
  const [filter, setFilter] = useState<string>("all");

  const filteredTasks = (status: TaskStatus) =>
    TASKS.filter(
      (t) =>
        t.status === status &&
        (filter === "all" || t.priority === filter)
    );

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl p-1">
          {[{ id: "all", label: "All" }, { id: "high", label: "High" }, { id: "medium", label: "Medium" }, { id: "low", label: "Low" }].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                filter === f.id ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <Btn variant="secondary" size="sm">
          <Filter className="w-3.5 h-3.5" /> Filter
        </Btn>
        <div className="flex-1" />
        <Btn
          variant="primary"
          size="sm"
          onClick={() => toast.success("Task creation coming soon")}
        >
          <Plus className="w-3.5 h-3.5" /> Add Task
        </Btn>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const tasks = filteredTasks(col.id);
          return (
            <div key={col.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color}`} />
                  <span className="text-xs font-semibold text-gray-700">{col.label}</span>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 rounded-md px-1.5 py-0.5">{tasks.length}</span>
                </div>
                <button
                  onClick={() => toast.success("Task creation coming soon")}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-100 rounded-xl text-center">
                    <p className="text-xs text-gray-400">No tasks here</p>
                  </div>
                ) : (
                  tasks.map((t) => <TaskCard key={t.id} task={t} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Team View ────────────────────────────────────────────────────────────────

function TeamView() {
  const [search, setSearch] = useState("");
  const filtered = MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-100 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
          />
        </div>
        <div className="flex-1" />
        <Btn variant="primary" size="sm" onClick={() => toast("Invite member coming soon")}>
          <UserPlus className="w-3.5 h-3.5" /> Invite Member
        </Btn>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: "6", icon: Users, color: "text-indigo-600 bg-indigo-50" },
          { label: "Online Now", value: "4", icon: Activity, color: "text-green-600 bg-green-50" },
          { label: "Tasks This Week", value: "108", icon: CheckSquare, color: "text-amber-600 bg-amber-50" },
          { label: "Avg Completion", value: "85%", icon: Target, color: "text-violet-600 bg-violet-50" },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Member Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((m) => {
          const pct = Math.round((m.tasksCompleted / 28) * 100);
          return (
            <Card key={m.id} className="p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: m.color }}>
                      {m.initials}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${memberStatusColor(m.status)}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.role}</p>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-gray-500 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  <span className="truncate">{m.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  {m.location}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-medium text-gray-400">Sprint progress</span>
                  <span className="text-[10px] font-bold text-gray-600">{m.tasksCompleted}/28</span>
                </div>
                <ProgressBar value={pct} color={m.color} />
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                <Badge variant={m.status === "online" ? "green" : m.status === "away" ? "amber" : "slate"}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${m.status === "online" ? "bg-green-500" : m.status === "away" ? "bg-amber-500" : "bg-slate-400"}`} />
                  {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                </Badge>
                <Btn variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => toast(`Opening DM with ${m.name}`)}>
                  Message
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-600">No members found</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}

// ─── Settings View ────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-9 h-5 rounded-full transition-all duration-200 ${enabled ? "bg-indigo-600" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${enabled ? "left-4" : "left-0.5"}`} />
    </button>
  );
}

function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

function SettingsView() {
  const [notifs, setNotifs] = useState({ mentions: true, taskAssigned: true, comments: false, weeklyDigest: true });
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex@teamflow.io");

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <SettingsSection title="Profile" description="Manage your personal information">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <MeAvatar size="lg" />
            <button className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-indigo-700 transition-colors">
              <Edit3 className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Alex Chen</p>
            <p className="text-xs text-gray-400">Product Manager · Startup HQ</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Full Name", value: name, onChange: setName },
            { label: "Email Address", value: email, onChange: setEmail },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{f.label}</label>
              <input
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
              />
            </div>
          ))}
          <div className="col-span-2">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Role</label>
            <select className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-800 focus:outline-none appearance-none">
              <option>Product Manager</option>
              <option>Engineer</option>
              <option>Designer</option>
              <option>Marketing</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Btn variant="primary" size="sm" onClick={() => toast.success("Profile saved!")}>Save Changes</Btn>
        </div>
      </SettingsSection>

      <SettingsSection title="Notifications" description="Choose what alerts you receive">
        <div className="flex flex-col gap-4">
          {[
            { key: "mentions", label: "Mentions & direct messages", desc: "When someone @mentions you or sends a DM" },
            { key: "taskAssigned", label: "Task assignments", desc: "When a task is assigned to you" },
            { key: "comments", label: "Task comments", desc: "When someone comments on your tasks" },
            { key: "weeklyDigest", label: "Weekly digest", desc: "A summary of your team's activity every Monday" },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-800">{n.label}</p>
                <p className="text-xs text-gray-400">{n.desc}</p>
              </div>
              <Toggle
                enabled={notifs[n.key as keyof typeof notifs]}
                onChange={(v) => setNotifs((prev) => ({ ...prev, [n.key]: v }))}
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Workspace" description="Manage your workspace preferences">
        <div className="flex flex-col gap-3">
          {[
            { icon: Globe, label: "Workspace Name", value: "Startup HQ" },
            { icon: Briefcase, label: "Plan", value: "Pro · $12/mo" },
            { icon: Users, label: "Members", value: "6 of 20 seats used" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{item.value}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Danger Zone" description="Irreversible actions for your account">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-800">Delete Account</p>
              <p className="text-xs text-gray-400">Permanently delete your account and all your data</p>
            </div>
            <Btn variant="danger" size="sm" onClick={() => toast.error("This action cannot be undone")}>Delete</Btn>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-800">Sign Out</p>
              <p className="text-xs text-gray-400">Sign out of your account on this device</p>
            </div>
            <Btn variant="secondary" size="sm">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Btn>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<ViewId>("dashboard");
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(NOTIFICATIONS.filter((n) => !n.read).length);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-[Inter,sans-serif]">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { borderRadius: "12px", fontSize: "13px", fontFamily: "Inter, sans-serif" },
        }}
      />
      <Sidebar view={view} onNavigate={setView} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav
          view={view}
          onBell={() => setShowNotifs((s) => !s)}
          unreadCount={unreadCount}
        />

        <main
          className={`flex-1 overflow-auto ${
            view === "messages" ? "p-0" : "p-6"
          } bg-background`}
        >
          {view === "dashboard" && <DashboardView />}
          {view === "messages" && <MessagesView />}
          {view === "tasks" && <TasksView />}
          {view === "team" && <TeamView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>

      {showNotifs && (
        <NotificationPanel
          onClose={() => setShowNotifs(false)}
          onRead={() => setUnreadCount(0)}
        />
      )}
    </div>
  );
}
