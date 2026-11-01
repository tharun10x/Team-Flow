import { Plus, Layers, ChevronDown, Copy, Check, LogOut, Settings } from "lucide-react";
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
    <div className="min-h-screen bg-paper font-body text-ink">
      {/* Top Navigation */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-rule bg-paper px-6">
        <span className="font-display text-xl font-semibold tracking-display text-ink">TeamFlow</span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            className="row-btn w-auto! gap-2! pl-1!"
          >
            <span className="avatar bg-graphite text-graphite-ink">
              {initial}
            </span>
            <span className="hidden font-medium text-ink sm:block">
              {capitalize(user?.name ?? "User")}
            </span>
            <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown */}
          {isDropdownOpen && (
            <div className="pop absolute right-0 mt-2 w-60 overflow-hidden py-1">
              <div className="mb-1 border-b border-rule px-3 py-2">
                <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
              <button type="button" onClick={() => navigate("/settings")} className="row-btn rounded-none!">
                <Settings className="h-4 w-4 text-muted" />
                Profile Settings
              </button>
              <button type="button" onClick={() => logout()} className="row-btn rounded-none! text-error! hover:bg-error-wash!">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="page max-w-5xl!">

        {/* Heading and the two ways in */}
        <div className="mb-8 flex flex-col gap-6 border-b border-rule pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="page-title">
              Welcome back, {capitalize(user?.name ?? "User")} :)
            </h1>
            <p className="mt-1 text-ink-2">
              Choose a workspace to continue collaborating.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Join Workspace (Secondary) */}
            <div className="flex items-center gap-3">
              <p className="hidden max-w-44 text-right text-xs text-muted lg:block">Enter an invite code to join your team.</p>
              <button type="button" onClick={() => setIsJoinModalOpen(true)} className="btn btn-quiet btn-lg" aria-label="Join a Workspace">
                Join with ID
              </button>
            </div>
            {/* Create Workspace (Primary) */}
            <button type="button" onClick={() => setIsCreateModalOpen(true)} className="btn btn-lg" aria-label="Create a Workspace" title="Start a new team and invite people.">
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>

        {/* Workspaces Section */}
        {workspaces.length === 0 ? (
          <div className="well flex flex-col items-center px-6 py-16 text-center">
            <Layers className="mb-4 h-6 w-6 text-muted" />
            <h3 className="section-title mb-2">No workspaces yet</h3>
            <p className="mx-auto max-w-sm text-sm text-ink-2">
              Create a workspace or join an existing team using an invite code to get started.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="section-title">Your Workspaces</h2>
              <span className="text-sm tabular-nums text-muted">
                {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
              </span>
            </div>

            <table className="w-full border-collapse text-sm">
              <thead className="sr-only md:not-sr-only">
                <tr className="border-b border-rule-2 text-left text-muted">
                  <th scope="col" className="py-2 pr-4 font-display font-medium">Workspace</th>
                  <th scope="col" className="py-2 pr-4 font-display font-medium">Members</th>
                  <th scope="col" className="py-2 pr-4 font-display font-medium">Your role</th>
                  <th scope="col" className="py-2 pr-4 font-display font-medium">Invite</th>
                  <th scope="col" className="py-2"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((ws) => (
                  <tr
                    key={ws.id}
                    onClick={() => handleSelectWorkspace(ws.id)}
                    className="group grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-b border-rule py-3 transition-colors hover:bg-paper-2 md:table-row md:py-0"
                  >
                    {/* Name and description */}
                    <td className="min-w-0 md:py-3 md:pr-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-input bg-paper-3 font-display font-semibold text-ink-2">
                          {ws.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-ink">{ws.name}</span>
                          <span className="block truncate text-muted">{ws.description || "No description provided."}</span>
                        </span>
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap tabular-nums text-ink-2 md:table-cell md:py-3 md:pr-4">
                      {ws.memberCount} Member{ws.memberCount !== 1 ? 's' : ''}
                    </td>
                    <td className="hidden text-ink-2 md:table-cell md:py-3 md:pr-4">
                      <span className="capitalize">{ws.currentUserRole.toLowerCase()}</span>
                    </td>
                    {/* Invite Code */}
                    <td className="col-span-2 md:py-3 md:pr-4">
                      {ws.inviteCode ? (
                        <button
                          type="button"
                          onClick={(e) => copyInviteCode(e, ws.inviteCode, ws.id)}
                          className="btn btn-ghost min-h-8! gap-2! px-2!"
                          title="Copy invite code"
                          aria-label={`Copy invite code ${ws.inviteCode}`}
                        >
                          <code className="mono text-sm font-medium text-ink">{ws.inviteCode}</code>
                          {copiedId === ws.id ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted" />
                          )}
                        </button>
                      ) : null}
                    </td>
                    <td className="col-start-2 row-start-1 text-right md:py-3">
                      <span className="link text-sm">Open</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modals */}
      {isCreateModalOpen && <CreateWorkspaceModal onClose={() => setIsCreateModalOpen(false)} />}
      {isJoinModalOpen && <JoinWorkspaceModal onClose={() => setIsJoinModalOpen(false)} />}
    </div>
  );
}
