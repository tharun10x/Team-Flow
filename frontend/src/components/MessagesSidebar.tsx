import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";
import { useChannel } from "../context/ChannelContext";
import { Hash, Plus } from "lucide-react";
import { CreateChannelModal } from "./CreateChannelModal";

export function MessagesSidebar() {
  const { currentWorkspace } = useWorkspace();
  const { channels, isLoading } = useChannel();
  const { channelId } = useParams(); // Tells us which channel is active
  const navigate = useNavigate();

  // State to control channel creation modal/input
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Filter channels (standard channels vs direct messages)
  const regularChannels = channels.filter((c) => !c.isDirectMessage);
  const directMessages = channels.filter((c) => c.isDirectMessage);

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col shrink-0 select-none">
      
      {/* 1. Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-900">Messages</h2>
        {/* Quick Add icon */}
        
      </div>

      {/* 2. Scrollable Channels List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* --- CHANNELS SECTION --- */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Channels
            </span>
            <button 
          onClick={() => setIsModalOpen(true)}
          className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
          title="Create channel"
        >
          <Plus className="w-4 h-4" />
        </button>
          </div>

          <div className="space-y-0.5">
            {isLoading ? (
              <p className="text-xs text-gray-400 px-2 py-1">Loading channels...</p>
            ) : regularChannels.length === 0 ? (
              <p className="text-xs text-gray-400 px-2 py-1">No channels yet.</p>
            ) : (
              regularChannels.map((channel) => {
                // Check if this channel is the active one in the URL
                const isActive = String(channel.id) === channelId;

                return (
                  <button
                    key={channel.id}
                    onClick={() => navigate(`/messages/${channel.id}`)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors text-left ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Hash className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                    <span className="truncate">{channel.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* --- DIRECT MESSAGES SECTION --- */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Direct Messages
            </span>
          </div>

          <div className="space-y-0.5">
            {/* For now, placeholder or mapping DMs */}
            <p className="text-xs text-gray-400 px-2 py-1">Coming soon</p>
          </div>
        </div>

      </div>

      {/* 3. Bottom Button: + Add Channels */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add channels</span>
        </button>
      </div>

      {/* 4. Modal for creating a channel */}
      {isModalOpen && <CreateChannelModal onClose={() => setIsModalOpen(false)} />}
    </aside>
  );
}