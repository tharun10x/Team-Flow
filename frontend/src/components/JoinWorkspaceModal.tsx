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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Join Workspace</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex flex-col items-center">
            
            <label className="block text-sm font-semibold text-gray-700 mb-6 text-center">
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
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 outline-none transition-all uppercase"
                />
              ))}
            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="mt-10 flex items-center justify-between w-full">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || code.join("").length !== 8}
              className="flex items-center justify-center min-w- px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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