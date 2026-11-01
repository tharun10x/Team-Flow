import { useState } from "react";
import { LayoutDashboard, MessageSquare, CheckSquare, Users, Settings, Plus, ChevronDown, HelpCircle, Layers, MoreHorizontal, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { useNavigate } from "react-router-dom";



export type ViewId = "dashboard" | "messages" | "tasks" | "team" | "settings" | "workspace-settings";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "messages", label: "Messages", icon: MessageSquare, badge: 15 },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "team", label: "Team", icon: Users },
];

const PROJECTS = [
  { name: "Product Redesign", id: "p1" },
  { name: "Backend API v2", id: "p2" },
  { name: "Q3 Marketing", id: "p3" },
  { name: "Mobile App", id: "p4" },
];


function MeAvatar({ initial }: { initial: string }) {
  return (
    <div className="avatar avatar-lg bg-graphite text-graphite-ink">
      {initial}
    </div>
  );
}


export function Sidebar({ view, onNavigate }: { view: ViewId; onNavigate: (v: ViewId) => void }) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.name || 'User';
  const { workspaces, currentWorkspace, selectWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const handleSwitch = (id: number) => {
    localStorage.setItem("currentWorkspaceId", String(id));
    selectWorkspace(id);
    setWorkspaceOpen(false);
  };
  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col border-r border-rule bg-paper-2 md:w-60">

      {/* Logo */}
      <div className="flex h-14 items-center px-5">
        <span className="font-display text-xl font-semibold tracking-display text-ink"><span className="md:hidden" aria-hidden="true">T</span><span className="hidden md:inline">TeamFlow</span></span>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-2 pb-4 md:px-3">

        {/* Workspace Dropdown */}
        <div className="relative">
          <button type="button" onClick={() => setWorkspaceOpen(!workspaceOpen)} aria-expanded={workspaceOpen} aria-label={currentWorkspace?.name}
            className="row-btn panel min-h-12! justify-center gap-3! px-2! md:justify-start md:px-3!">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-input bg-graphite font-display text-sm font-semibold text-graphite-ink">{currentWorkspace?.name.charAt(0)}</span>
            <span className="hidden min-w-0 flex-1 md:block">
              <span className="block truncate font-medium text-ink">{currentWorkspace?.name}</span>
              <span className="block text-xs text-muted">{currentWorkspace?.memberCount} members</span>
            </span>
            <ChevronDown className={`hidden h-4 w-4 text-muted transition-transform duration-200 md:block ${workspaceOpen ? "rotate-180" : ""}`} />
          </button>
          {workspaceOpen && (
            <div className="pop absolute left-0 top-full mt-2 w-60 overflow-hidden py-1 md:w-full">

              {/* Other workspaces list (Max 5) */}
              {workspaces
                .filter(ws => ws.id !== currentWorkspace?.id)
                .slice(0, 5)
                .map(ws => (
                  <button
                    type="button"
                    key={ws.id}
                    onClick={() => handleSwitch(ws.id)}
                    className="row-btn rounded-none! py-1"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-input bg-paper-3 text-xs font-medium text-ink-2">
                      {ws.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{ws.name}</span>
                      <span className="block text-xs text-muted">{ws.memberCount} members</span>
                    </span>
                  </button>
                ))
              }

              {/* Divider */}
              <div className="my-1 border-t border-rule" />

              {/* View all button */}
              <button
                type="button"
                onClick={() => navigate("/workspaces")}
                className="row-btn rounded-none! font-medium text-ink!"
              >
                <Plus className="h-4 w-4" />
                View all Workspaces
              </button>

            </div>
          )}
        </div>

        {/* Main Navigation Links */}
        <nav className="flex flex-col gap-0.5" aria-label="Main">
          <p className="mb-1 hidden px-3 text-xs text-muted md:block">Main</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => {
            const active = view === id;
            return (
              <button type="button" key={id} onClick={() => onNavigate(id as ViewId)} aria-current={active ? "page" : undefined} aria-label={label} className="row-btn justify-center md:justify-start">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden flex-1 md:inline">{label}</span>
                {badge && !active && (
                  <span className="hidden min-w-6 rounded-pill bg-paper-3 px-2 py-0.5 text-center text-xs font-medium tabular-nums text-ink-2 md:inline">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Projects Section */}
        <div className="hidden md:block">
          <div className="mb-1 flex items-center justify-between pl-3">
            <p className="text-xs text-muted">Projects</p>
            <button type="button" onClick={() => toast("Create project coming soon")} className="btn btn-ghost btn-icon min-h-7! w-7!" aria-label="Create project">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            {PROJECTS.map((p) => (
              <button type="button" key={p.id} className="row-btn">
                <span className="flex-1 truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Settings & Profile Area */}
      <div className="flex flex-col gap-0.5 border-t border-rule px-2 py-3 md:px-3">
        <button type="button" onClick={() => onNavigate("settings")} aria-current={view === "settings" ? "page" : undefined} aria-label="Personal Settings" className="row-btn justify-center md:justify-start">
          <Settings className="h-4 w-4 shrink-0" /> <span className="hidden md:inline">Personal Settings</span>
        </button>
        <button type="button" onClick={() => onNavigate("workspace-settings")} aria-current={view === "workspace-settings" ? "page" : undefined} aria-label="Workspace Settings" className="row-btn justify-center md:justify-start">
          <Layers className="h-4 w-4 shrink-0" /> <span className="hidden md:inline">Workspace Settings</span>
        </button>
        <button type="button" aria-label="Help & Support" className="row-btn justify-center md:justify-start">
          <HelpCircle className="h-4 w-4 shrink-0" /> <span className="hidden md:inline">Help & Support</span>
        </button>

        {/* Profile Card & Menu Wrapper */}
        <div className="relative mt-2">

          {/* The Popup Menu */}
          {isProfileMenuOpen && (
            <div className="pop absolute bottom-full left-0 mb-2 w-48 overflow-hidden py-1 md:w-full">
              <button
                type="button"
                className="row-btn rounded-none! font-medium text-error! hover:bg-error-wash!"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}

          {/* The Clickable Card */}
          <button
            type="button"
            aria-label={displayName}
            className="row-btn min-h-12! justify-center gap-3! px-1! md:justify-start md:px-3!"
            aria-expanded={isProfileMenuOpen}
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <MeAvatar initial={initial} />
            <span className="hidden min-w-0 flex-1 md:block">
              <span className="block truncate font-medium text-ink">{displayName}</span>
              <span className="block truncate text-xs text-muted">{user?.email || 'No email'}</span>
            </span>
            <MoreHorizontal className="hidden h-4 w-4 text-muted md:block" />
          </button>
        </div>
      </div>
    </aside>
  );
}
