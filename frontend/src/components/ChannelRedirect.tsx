import { Navigate } from "react-router-dom";
import { useChannel } from "../context/ChannelContext";

export function ChannelRedirect() {
  const { channels, isLoading } = useChannel();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 text-gray-400 text-sm">
        Loading channels...
      </div>
    );
  }

  const defaultChannel = channels.find((c) => !c.isDirectMessage) || channels[0];

  if (defaultChannel) {
    return <Navigate to={`/messages/${defaultChannel.id}`} replace />;
  }

  return (
    <div className="flex h-full items-center justify-center bg-gray-50 text-gray-500 text-sm font-medium">
      No channels available. Create a channel to start chatting!
    </div>
  );
}
