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
      const response = await api.post("workspaces", {
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
    <div className="modal-back">
      <div 
        className="modal"
        onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <h2 className="section-title">Create Workspace</h2>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            type="button"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            
            {/* Name Input */}
            <div>
              <label className="label">
                Workspace Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Startup HQ, Marketing Team"
                className="field field-lg"
                autoFocus
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="label">
                Description <span className="text-muted font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this workspace for?"
                rows={3}
                className="field field-lg resize-none"
              />
            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-lg min-w-32"
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
