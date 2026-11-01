import { useState, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../api/axios";
import { useWorkspace } from "../context/WorkspaceContext";
import { useNavigate } from "react-router-dom";

interface JoinWorkspaceModalProps {
  onClose: () => void;
}

export function JoinWorkspaceModal({ onClose }: JoinWorkspaceModalProps) {
  const [code, setCode] = useState<string[]>(Array(8).fill(""));
  const [isLoading, setIsLoading] = useState(false);
 
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { fetchWorkspaces, selectWorkspace } = useWorkspace();
  const navigate = useNavigate();


  const handleChange = (index: number, value: string) => {

    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    // If they typed more than 1 character (like a paste), ignore it here
    // We handle pastes in onPaste
    if (cleanValue.length > 1) return;

    const newCode = [...code];
    newCode[index] = cleanValue;
    setCode(newCode);

    // If they typed a character and we aren't at the last box, move to the next box
    if (cleanValue !== "" && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace to move to the previous box
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle pasting an 8 character code
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < 8; i++) {
        if (pastedData[i]) {
          newCode[i] = pastedData[i];
        }
      }
      setCode(newCode);
      
      // Focus the last filled box, or the 8th box
      const focusIndex = Math.min(pastedData.length, 8) - 1;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCode = code.join("");
    
    if (finalCode.length !== 8) {
      toast.error("Please enter all 8 characters of the invite code");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("workspaces/join", {
        inviteCode: finalCode
      });
      
      const joinedWorkspaceId = response.data.data.id;
      localStorage.setItem("currentWorkspaceId", String(joinedWorkspaceId));
      
      await fetchWorkspaces();
      toast.success("Successfully joined the workspace!");
      onClose();

      navigate("/dashboard");

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid invite code or failed to join");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-back">
      <div 
        className="modal max-w-lg!"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <h2 className="section-title">Join Workspace</h2>
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
        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex flex-col items-center">
            
            <label className="label mb-6! text-center">
              Enter the 8-character invite code from your team
            </label>
            
            {/* The 8 Boxes! */}
            <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
              {code.map((char, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={char}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  aria-label={`Invite code character ${index + 1}`}
                  className="field mono h-12 w-10 px-0! text-center text-xl! font-medium sm:h-14 sm:w-12 sm:text-2xl!"
                />
              ))}
            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="mt-10 flex items-center justify-between w-full">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || code.join("").length !== 8}
              className="btn btn-lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Join Workspace"
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Invisible overlay covering the backdrop */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}