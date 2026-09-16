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
            
            const response = await api.post(`workspaces/${currentWorkspace?.id}/channels`,{
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Create Channel</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Channel Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm"
                                autoFocus
                            />
                        </div>
                    </div>

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
                            "Create Channel"
                        )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}