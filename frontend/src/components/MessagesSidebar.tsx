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
    <aside className="flex h-full w-44 shrink-0 select-none flex-col border-r border-rule bg-paper-2 md:w-60">

      {/* 1. Header */}
      <div className="flex h-14 items-center justify-between border-b border-rule px-4">
        <h2 className="section-title">Messages</h2>
        {/* Quick Add icon */}

      </div>

      {/* 2. Scrollable Channels List */}
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">

        {/* --- CHANNELS SECTION --- */}
        <div>
          <div className="mb-1 flex items-center justify-between pl-3">
            <span className="text-xs text-muted">
              Channels
            </span>
            <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-ghost btn-icon min-h-7! w-7!"
          title="Create channel"
          aria-label="Create channel"
        >
          <Plus className="h-4 w-4" />
        </button>
          </div>

          <div className="space-y-0.5">
            {isLoading ? (
              <div className="space-y-2 px-3 py-1" role="status" aria-label="Loading channels...">
                <div className="skeleton h-4 w-3/4" /><div className="skeleton h-4 w-1/2" /><div className="skeleton h-4 w-2/3" />
              </div>
            ) : regularChannels.length === 0 ? (
              <p className="px-3 py-1 text-sm text-muted">No channels yet.</p>
            ) : (
              regularChannels.map((channel) => {
                // Check if this channel is the active one in the URL
                const isActive = String(channel.id) === channelId;

                return (
                  <button
                    type="button"
                    key={channel.id}
                    onClick={() => navigate(`/messages/${channel.id}`)}
                    aria-current={isActive ? "page" : undefined}
                    className="row-btn gap-2!"
                  >
                    <Hash className={`h-4 w-4 shrink-0 ${isActive ? "text-accent" : "text-muted"}`} />
                    <span className="truncate">{channel.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* --- DIRECT MESSAGES SECTION --- */}
        <div>
          <div className="mb-1 pl-3">
            <span className="text-xs text-muted">
              Direct Messages
            </span>
          </div>

          <div className="space-y-0.5">
            {/* For now, placeholder or mapping DMs */}
            <p className="px-3 py-1 text-sm text-muted">Coming soon</p>
          </div>
        </div>

      </div>

      {/* 3. Bottom Button: + Add Channels */}
      <div className="border-t border-rule p-3">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="row-btn"
        >
          <Plus className="h-4 w-4" />
          <span>Add channels</span>
        </button>
      </div>

      {/* 4. Modal for creating a channel */}
      {isModalOpen && <CreateChannelModal onClose={() => setIsModalOpen(false)} />}
    </aside>
  );
}
