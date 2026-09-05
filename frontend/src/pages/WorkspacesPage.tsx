import { Search, Plus, Layers, ChevronDown, Users, Shield, Copy, Check, ArrowRight, LogOut, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { CreateWorkspaceModal } from "../components/CreateWorkspaceModal";
import { JoinWorkspaceModal } from "../components/JoinWorkspaceModal";
import { useWorkspace } from "../context/WorkspaceContext";
import { useNavigate } from "react-router-dom";

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function WorkspacesPage() {
  const { user, logout } = useAuth();
  const initial = (user?.name ?? "User").charAt(0).toUpperCase();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const { workspaces, selectWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleSelectWorkspace = (id: number) => {
    localStorage.setItem("currentWorkspaceId", String(id));
    selectWorkspace(id);
    navigate("/dashboard");
  };

  const copyInviteCode = (e: React.MouseEvent, code: string, id: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-sans text-[#111827]">
      {/* Top Navigation */}
      <header className="h-[72px] px-6 md:px-8 bg-white border-b border-[#E5E7EB] flex items-center justify-between sticky top-0 z-20">
        <div className="font-bold text-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5B3DF5] flex items-center justify-center shadow-sm">
            <Layers className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="tracking-tight text-gray-900">TeamFlow</span>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-semibold bg-[#5B3DF5]">
              {initial}
            </div>
            <span className="font-medium text-sm hidden sm:block">
              {capitalize(user?.name ?? "User")}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button onClick={() => navigate("/settings")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-400" />
                Profile Settings
              </button>
              <button onClick={() => logout()} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 mt-1">
                <LogOut className="w-4 h-4 text-red-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1100px] mx-auto px-6 md:px-8 py-10 md:py-12">
        
        {/* Hero Section */}
        <div className="mb-10">
          <h1 className="text-[28px] md:text-4xl font-bold tracking-tight mb-2 text-gray-900">
            Welcome back, {capitalize(user?.name ?? "User")} :)
          </h1>
          <p className="text-gray-500 text-[15px]">
            Choose a workspace to continue collaborating.
          </p>
        </div>

        {/* Primary Action Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* Join Workspace (Secondary) */}
          <div 
            onClick={() => setIsJoinModalOpen(true)}
            className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex flex-col sm:flex-row sm:items-center gap-5 hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#5B3DF5]/30 transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-[#5B3DF5]/10 transition-colors">
              <Search className="w-5 h-5 text-gray-500 group-hover:text-[#5B3DF5] transition-colors" />
            </div>
            <div className="flex-1">
              <h3 className="text-[17px] font-semibold text-gray-900">Join a Workspace</h3>
              <p className="text-[14px] text-[#667085] mt-1 mb-4 sm:mb-0">Enter an invite code to join your team.</p>
            </div>
            <button className="px-4 py-2 border border-[#5B3DF5] text-[#5B3DF5] text-sm font-medium rounded-[10px] hover:bg-[#5B3DF5]/5 active:bg-[#5B3DF5]/10 transition-colors shrink-0">
              Join with ID
            </button>
          </div>

          {/* Create Workspace (Primary) */}
          <div 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex flex-col sm:flex-row sm:items-center gap-5 hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#5B3DF5]/50 transition-all duration-200 cursor-pointer group relative overflow-hidden"
          >
            {/* Subtle primary accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#5B3DF5] opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="w-12 h-12 rounded-full bg-[#5B3DF5]/10 flex items-center justify-center shrink-0 group-hover:bg-[#5B3DF5]/20 transition-colors">
              <Plus className="w-5 h-5 text-[#5B3DF5]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[17px] font-semibold text-gray-900">Create a Workspace</h3>
              <p className="text-[14px] text-[#667085] mt-1 mb-4 sm:mb-0">Start a new team and invite people.</p>
            </div>
            <button className="px-4 py-2 bg-[#5B3DF5] text-white text-sm font-medium rounded-[10px] hover:bg-[#4930D0] transition-colors shadow-sm shrink-0 flex items-center gap-1.5">
              Create <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspaces Section */}
        {workspaces.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] py-16 px-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workspaces yet</h3>
            <p className="text-[#667085] text-sm max-w-sm mx-auto">
              Create a workspace or join an existing team using an invite code to get started.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-gray-900">Your Workspaces</h2>
              <span className="text-[13px] font-medium text-[#667085] bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-sm">
                {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workspaces.map((ws) => (
                <div 
                  key={ws.id} 
                  onClick={() => handleSelectWorkspace(ws.id)} 
                  className="bg-white border border-[#E5E7EB] rounded-[14px] p-5 flex flex-col hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgb(0,0,0,0.04)] hover:border-gray-300 transition-all duration-200 cursor-pointer group"
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#5B3DF5] to-violet-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="font-semibold text-[16px] text-gray-900 truncate group-hover:text-[#5B3DF5] transition-colors">
                        {ws.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center text-[12px] text-[#667085]">
                          <Users className="w-3.5 h-3.5 mr-1" />
                          {ws.memberCount} Member{ws.memberCount !== 1 ? 's' : ''}
                        </div>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <div className="flex items-center text-[12px] text-[#667085]">
                          <Shield className="w-3.5 h-3.5 mr-1" />
                          <span className="capitalize">{ws.currentUserRole.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[14px] text-[#667085] line-clamp-2 mb-5 flex-1 min-h-[40px]">
                    {ws.description || "No description provided."}
                  </p>

                  {/* Invite Code & Action */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    {ws.inviteCode ? (
                      <div 
                        onClick={(e) => copyInviteCode(e, ws.inviteCode, ws.id)}
                        className="flex items-center gap-2 px-2.5 py-1.5 bg-[#F8F9FC] hover:bg-gray-100 rounded-md transition-colors group/copy"
                        title="Copy invite code"
                      >
                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Invite</span>
                        <code className="text-[13px] font-mono font-semibold text-gray-800 tracking-wide">{ws.inviteCode}</code>
                        {copiedId === ws.id ? (
                          <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400 group-hover/copy:text-gray-600 transition-colors" />
                        )}
                      </div>
                    ) : (
                      <div className="flex-1" />
                    )}
                    
                    <div className="flex items-center text-[13px] font-medium text-[#5B3DF5] group-hover:underline decoration-2 underline-offset-2">
                      Open <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {isCreateModalOpen && <CreateWorkspaceModal onClose={() => setIsCreateModalOpen(false)} />}
      {isJoinModalOpen && <JoinWorkspaceModal onClose={() => setIsJoinModalOpen(false)} />}
    </div>
  );
}