import { useState, useEffect } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Copy, Trash2, LogOut, Shield, UserMinus } from "lucide-react";
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
      <div className="page max-w-5xl! space-y-4" role="status" aria-label="Loading workspace settings">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-4 w-96" />
        <div className="skeleton mt-8 h-40 w-full" />
      </div>
    );
  }

  if (!workspace) return null;

  const canManageMembers = workspace.currentUserRole === "OWNER" || workspace.currentUserRole === "ADMIN";
  const isOwner = workspace.currentUserRole === "OWNER";

  return (
    <div className="page max-w-5xl!">
      <div className="mb-8">
        <h1 className="page-title">Workspace Settings</h1>
        <p className="mt-1 text-ink-2">Manage your team’s workspace details and access.</p>
      </div>

      {/* General Settings */}
      <section className="grid gap-6 border-t border-rule py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
        <h2 className="section-title">General</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="ws-name" className="label">Workspace Name</label>
              <input
                id="ws-name"
                type="text"
                value={workspace.name}
                disabled
                className="field"
              />
            </div>
            <div>
              <label htmlFor="ws-invite" className="label">Invite Code</label>
              <div className="flex gap-2">
                <input
                  id="ws-invite"
                  type="text"
                  value={workspace.inviteCode}
                  disabled
                  className="field mono font-medium"
                />
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="btn btn-quiet"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="ws-description" className="label">Description</label>
            <textarea
              id="ws-description"
              value={workspace.description || "No description provided."}
              disabled
              rows={2}
              className="field resize-none"
            />
          </div>
        </div>
      </section>

      {/* Members Section */}
      <section className="grid gap-6 border-t border-rule py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
        <h2 className="section-title">Members ({workspace.memberCount})</h2>
        <ul className="divide-y divide-rule border-y border-rule">
          {workspace.members?.map((member) => (
            <li key={member.userId} className="flex items-center justify-between gap-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="avatar avatar-lg">
                  {member.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{member.name}</p>
                  <p className="truncate text-sm text-muted">{member.email}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {/* Role Badge / Dropdown */}
                {canManageMembers && member.role !== "OWNER" ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole(member.userId, e.target.value)}
                    aria-label={`Role of ${member.name}`}
                    className="field w-32!"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-medium capitalize text-ink-2">
                    {member.role === "OWNER" && <Shield className="h-3.5 w-3.5" />}
                    {member.role.toLowerCase()}
                  </span>
                )}

                {/* Remove Button */}
                {canManageMembers && member.role !== "OWNER" && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.userId)}
                    className="btn btn-danger btn-icon"
                    title="Remove Member"
                    aria-label={`Remove ${member.name}`}
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Danger Zone */}
      <section className="grid gap-6 border-t border-rule py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
        <h2 className="section-title text-error!">
          Danger Zone
        </h2>
        <div className="border-y border-rule py-4">
          {!isOwner ? (
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="font-body text-sm font-medium tracking-normal text-ink">Leave Workspace</h3>
                <p className="text-sm text-muted">You will lose access to all tasks and data in this workspace.</p>
              </div>
              <button
                type="button"
                onClick={handleLeaveWorkspace}
                disabled={actionLoading}
                aria-busy={actionLoading}
                className="btn btn-danger shrink-0"
              >
                <LogOut className="h-4 w-4" />
                Leave Workspace
              </button>
            </div>
          ) : (
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="font-body text-sm font-medium tracking-normal text-ink">Delete Workspace</h3>
                <p className="text-sm text-muted">Permanently delete this workspace and all of its data. This cannot be undone.</p>
              </div>
              <button
                type="button"
                onClick={handleDeleteWorkspace}
                disabled={actionLoading}
                aria-busy={actionLoading}
                className="btn btn-danger shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                Delete Workspace
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
