import { useState } from "react";
import { LayoutDashboard, MessageSquare, CheckSquare, Users, Settings, Plus, ChevronDown, HelpCircle, Layers, MoreHorizontal, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { useNavigate } from "react-router-dom";



export type ViewId = "dashboard" | "messages" | "tasks" | "team" | "settings";

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


function MeAvatar({ initial }: { initial: string }) {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white shrink-0 bg-linear-to-br from-indigo-500 to-violet-600">
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
    <aside className="w-60 shrink-0 h-screen bg-white border-r border-gray-200 flex flex-col">
      
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
            <Layers className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-gray-900 font-bold text-lg tracking-tight">TeamFlow</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6">
        
        {/* Workspace Dropdown */}
        <div className="relative">
          <button onClick={() => setWorkspaceOpen(!workspaceOpen)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{currentWorkspace?.name.charAt(0)}</div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{currentWorkspace?.name}</p>
              <p className="text-xs text-gray-400">{currentWorkspace?.memberCount} members</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${workspaceOpen ? "rotate-180" : ""}`} />
          </button>
          {workspaceOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100 z-50 py-1.5 overflow-hidden">
    
              {/* Other workspaces list */}
              {workspaces
                .filter(ws => ws.id !== currentWorkspace?.id)
                .map(ws => (
                  <button 
                    key={ws.id} 
                    onClick={() => handleSwitch(ws.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {ws.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{ws.name}</p>
                      <p className="text-xs text-gray-400">{ws.memberCount} members</p>
                    </div>
                  </button>
                ))
              }

              {/* Divider */}
              <div className="my-1.5 border-t border-gray-100" />

              {/* View all button */}
              <button 
                onClick={() => navigate("/workspaces")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                View all Workspaces
              </button>

            </div>
          )}
        </div>

        {/* Main Navigation Links */}
        <nav className="flex flex-col gap-1">
          <p className="px-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Main</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => {
            const active = view === id;
            return (
              <button key={id} onClick={() => onNavigate(id as ViewId)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                <Icon className="w-5 h-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
                <span className="flex-1 text-left">{label}</span>
                {badge && !active && (
                  <span className="text-[10px] font-bold bg-indigo-600 text-white rounded-full px-2 py-0.5 min-w-5 text-center">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between px-2.5 mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Projects</p>
            <button onClick={() => toast("Create project coming soon")} className="text-gray-400 hover:text-indigo-600 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {PROJECTS.map((p) => (
              <button key={p.id} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: p.color }} />
                <span className="flex-1 text-left font-medium truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Settings & Profile Area */}
      <div className="border-t border-gray-100 px-3 py-4 flex flex-col gap-1">
        <button onClick={() => onNavigate("settings")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${view === "settings" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
          <Settings className="w-5 h-5 shrink-0" /> Settings
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
          <HelpCircle className="w-5 h-5 shrink-0" /> Help & Support
        </button>
        
        {/* Profile Card & Menu Wrapper */}
        <div className="relative">
          
          {/* The Popup Menu */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100 z-50 px-0.5 py-1.5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button 
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" /> 
                Sign Out
              </button>
            </div>
          )}

          {/* The Clickable Card */}
          <div 
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer border ${isProfileMenuOpen ? 'bg-gray-50 border-gray-200' : 'border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <div className="relative">
              <MeAvatar initial={initial} />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 font-medium truncate">{user?.email || 'No email'}</p>
            </div>
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </aside>
  );
}