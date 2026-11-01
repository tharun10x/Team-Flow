import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";

export function Dashboard(){
    const { currentWorkspace } = useWorkspace();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (currentWorkspace?.inviteCode) {
            navigator.clipboard.writeText(currentWorkspace.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return(
        <div className="page">
            <h1 className="page-title mb-6">Dashboard</h1>

            {currentWorkspace && (
                <div className="grid gap-6 border-t border-rule pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                    {/* The workspace */}
                    <div className="flex items-start gap-4">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-card bg-graphite font-display text-2xl font-semibold text-graphite-ink">
                            {currentWorkspace.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                            <h2 className="font-display text-2xl font-semibold tracking-display text-ink">{currentWorkspace.name}</h2>
                            {currentWorkspace.description && (
                                <p className="mt-1 text-ink-2">{currentWorkspace.description}</p>
                            )}
                            <dl className="mt-4 flex divide-x divide-rule text-sm">
                                <div className="pr-4">
                                    <dt className="text-xs text-muted">Members</dt>
                                    <dd className="font-medium tabular-nums text-ink">{currentWorkspace.memberCount}</dd>
                                </div>
                                <div className="pl-4">
                                    <dt className="text-xs text-muted">Your role</dt>
                                    <dd className="font-medium capitalize text-ink">{currentWorkspace.currentUserRole.toLowerCase()}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* The invite code, set large: the one thing to hand to the group */}
                    {currentWorkspace.inviteCode && (
                        <div className="well p-6">
                            <p className="text-sm text-ink-2">Invite Code: share this with your team</p>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                                <code className="mono text-3xl font-medium tracking-normal text-ink">{currentWorkspace.inviteCode}</code>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="btn btn-quiet"
                                >
                                    {copied ? (
                                        <><Check className="h-4 w-4 text-success" /> Copied!</>
                                    ) : (
                                        <><Copy className="h-4 w-4" /> Copy</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
