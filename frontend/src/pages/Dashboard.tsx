import { Copy, Check, Users, Shield } from "lucide-react";
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
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
            
            {currentWorkspace && (
                <div className="max-w-md bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h2 className="font-bold text-xl text-gray-900">{currentWorkspace.name}</h2>
                            {currentWorkspace.description && (
                                <p className="text-sm text-gray-500 mt-1">{currentWorkspace.description}</p>
                            )}
                        </div>
                        <div className="bg-indigo-50 rounded-xl w-10 h-10 flex justify-center items-center text-indigo-600 font-bold text-lg shadow-sm">
                            {currentWorkspace.name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{currentWorkspace.memberCount} <span className="font-normal text-xs">Members</span></span>
                        </div>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium capitalize">{currentWorkspace.currentUserRole.toLowerCase()}</span>
                        </div>
                    </div>

                    {currentWorkspace.inviteCode && (
                        <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-xs text-gray-400 mb-1.5">Invite Code — share this with your team</p>
                            <div className="flex items-center justify-between gap-2">
                                <code className="text-lg font-mono font-bold text-indigo-600 tracking-widest">{currentWorkspace.inviteCode}</code>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors text-sm text-indigo-600 font-medium"
                                >
                                    {copied ? (
                                        <><Check className="w-4 h-4 text-green-500" /> Copied!</>
                                    ) : (
                                        <><Copy className="w-4 h-4" /> Copy</>
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