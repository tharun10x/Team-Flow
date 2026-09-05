import { useState, useEffect } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Copy, Trash2, LogOut, Shield, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MemberInfo {
  userId: number;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  joinedAt: string;
}

interface DetailedWorkspace {
  id: number;
  name: string;
  description: string;
  inviteCode: string;
  ownerName: string;
  ownerId: number;
  currentUserRole: string;
  memberCount: number;
  members: MemberInfo[];
}

export function WorkspaceSettings() {
  const { currentWorkspace, fetchWorkspaces } = useWorkspace();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState<DetailedWorkspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadDetailedWorkspace();
    }
  }, [currentWorkspace?.id]);

  const loadDetailedWorkspace = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/workspaces/${currentWorkspace?.id}`);
      setWorkspace(response.data.data);
    } catch (error) {
      toast.error("Failed to load workspace details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInvite = () => {
    if (workspace?.inviteCode) {
      navigator.clipboard.writeText(workspace.inviteCode);
      toast.success("Invite code copied to clipboard!");
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      await api.put(`/workspaces/${workspace?.id}/members/${userId}/role`, { role: newRole });
      toast.success("Member role updated!");
      loadDetailedWorkspace(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.delete(`/workspaces/${workspace?.id}/members/${userId}`);
      toast.success("Member removed!");
      loadDetailedWorkspace(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!confirm("Are you sure you want to leave this workspace?")) return;
    try {
      setActionLoading(true);
      await api.post(`/workspaces/${workspace?.id}/leave`);
      toast.success("You have left the workspace.");
      localStorage.removeItem("currentWorkspaceId");
      await fetchWorkspaces();
      navigate("/workspaces");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to leave workspace");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!confirm("WARNING: This will permanently delete the workspace for everyone. Are you sure?")) return;
    try {
      setActionLoading(true);
      await api.delete(`/workspaces/${workspace?.id}`);
      toast.success("Workspace deleted permanently.");
      localStorage.removeItem("currentWorkspaceId");
      await fetchWorkspaces();
      navigate("/workspaces");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete workspace");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!workspace) return null;

  const canManageMembers = workspace.currentUserRole === "OWNER" || workspace.currentUserRole === "ADMIN";
  const isOwner = workspace.currentUserRole === "OWNER";

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workspace Settings</h1>
        <p className="text-gray-500 mt-1">Manage your team's workspace details and access.</p>
      </div>

      {/* General Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">General</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
              <input 
                type="text" 
                value={workspace.name} 
                disabled 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={workspace.inviteCode} 
                  disabled 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-mono font-medium outline-none tracking-widest uppercase"
                />
                <button 
                  onClick={handleCopyInvite}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              value={workspace.description || "No description provided."} 
              disabled 
              rows={2}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Members ({workspace.memberCount})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {workspace.members?.map((member) => (
            <div key={member.userId} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Role Badge / Dropdown */}
                {canManageMembers && member.role !== "OWNER" ? (
                  <select 
                    value={member.role}
                    onChange={(e) => handleChangeRole(member.userId, e.target.value)}
                    className="text-sm font-medium px-3 py-1.5 bg-gray-100 border-none rounded-lg text-gray-700 outline-none cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                    member.role === "OWNER" ? "bg-amber-100 text-amber-700" : 
                    member.role === "ADMIN" ? "bg-violet-100 text-violet-700" : 
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {member.role === "OWNER" && <Shield className="w-3 h-3" />}
                    {member.role}
                  </span>
                )}

                {/* Remove Button */}
                {canManageMembers && member.role !== "OWNER" && (
                  <button 
                    onClick={() => handleRemoveMember(member.userId)}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    title="Remove Member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            Danger Zone
          </h2>
        </div>
        <div className="p-6">
          {!isOwner ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Leave Workspace</h3>
                <p className="text-sm text-gray-500 mt-1">You will lose access to all tasks and data in this workspace.</p>
              </div>
              <button 
                onClick={handleLeaveWorkspace}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-semibold rounded-xl transition-all flex items-center gap-2 shrink-0"
              >
                <LogOut className="w-4 h-4" />
                Leave Workspace
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Delete Workspace</h3>
                <p className="text-sm text-gray-500 mt-1">Permanently delete this workspace and all of its data. This cannot be undone.</p>
              </div>
              <button 
                onClick={handleDeleteWorkspace}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-semibold rounded-xl transition-all flex items-center gap-2 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Delete Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}