import { useState } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import { useWorkspace } from "../context/WorkspaceContext";
import { X, Loader2 } from "lucide-react";
import { useChannel } from "../context/ChannelContext";
interface CreateChannelModalProps {
  onClose: () => void;
}
export function CreateChannelModal({onClose}: CreateChannelModalProps){
    const [name, setName] = useState("");
    const {currentWorkspace} = useWorkspace();
    const [isLoading, setIsLoading] = useState(false);

    const { fetchChannels } = useChannel();

    const handleSubmit = async (e:React.FormEvent)=>{
        e.preventDefault();

        if(!name.trim()){
            toast.error("Channel name is required");
            return
        }

        if (!currentWorkspace) {
            toast.error("No workspace selected");
            return;
        }

        try {
            setIsLoading(true);
            
            await api.post(`workspaces/${currentWorkspace?.id}/channels`,{
                name
            })
            await fetchChannels();  
            toast.success("Channel created!");
            onClose();

        } catch (error:any) {
            toast.error(error.response?.data?.message || "Failed to create Channel");
        }finally{
            setIsLoading(false);
        }
    }

    return(
        <div
            className="modal-back"
            onClick={onClose}
        >
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
                    <h2 className="section-title">Create Channel</h2>
                    <button 
                        onClick={onClose}
                        className="btn btn-ghost btn-icon"
            type="button"
            aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="label">
                                Channel Name <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="field field-lg"
                                autoFocus
                            />
                        </div>
                    </div>

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
                            "Create Channel"
                        )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}