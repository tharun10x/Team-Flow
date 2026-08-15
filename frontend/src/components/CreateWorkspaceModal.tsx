import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../api/axios";
import { useWorkspace } from "../context/WorkspaceContext";
import { useNavigate } from "react-router-dom";

interface CreateWorkspaceModalProps {
  onClose: () => void;
}

export function CreateWorkspaceModal({ onClose }: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { fetchWorkspaces, selectWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    try {
      setIsLoading(true);
      // 1. Call backend API
      const response = await api.post("/workspaces", {
        name,
        description
      });
      
      const newWorkspaceId = response.data.data.id;
      
      localStorage.setItem("currentWorkspaceId", String(newWorkspaceId));

      await fetchWorkspaces();
            
      toast.success("Workspace created successfully!");
      onClose();
      
      // 4. Navigate to dashboard
      navigate("/dashboard");

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create workspace");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create Workspace</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Workspace Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Startup HQ, Marketing Team"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm"
                autoFocus
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this workspace for?"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm resize-none"
              />
            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center min-w-30 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Workspace"
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Click outside to close - invisible overlay covering the backdrop */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
