import React, { createContext, useContext, useState, useEffect } from "react";
import { useWorkspace } from "./WorkspaceContext";
import api from "../api/axios";

// 1. Define what a Channel looks like
export interface Channel {
  id: number;
  name: string;
  isDirectMessage: boolean;
  workspaceId: number;
}

// 2. Define what our Context exposes to the rest of the app
interface ChannelContextType {
  channels: Channel[];
  currentChannel: Channel | null;
  isLoading: boolean;
  selectChannel: (id: number) => void;
  fetchChannels: () => Promise<void>;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export function ChannelProvider({ children }: { children: React.ReactNode }) {
  // We need the workspace context because channels belong to a workspace!
  const { currentWorkspace } = useWorkspace();
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 3. The function to fetch channels from your Spring Boot backend
  const fetchChannels = async () => {
    if (!currentWorkspace) return;
    
    setIsLoading(true);
    try {   
      const response = await api.get(`workspaces/${currentWorkspace.id}/channels`)
      setChannels(response.data.data);
      
    } catch (error) {
      console.error("Failed to fetch channels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Automatically fetch channels whenever the user switches workspaces
  useEffect(() => {
    if (currentWorkspace) {
      fetchChannels();
      setCurrentChannel(null); // Reset active channel when workspace changes
    } else {
      setChannels([]);
      setCurrentChannel(null);
    }
  }, [currentWorkspace?.id]);

  const selectChannel = (id: number) => {
    const channel = channels.find((c) => c.id === id);
    if (channel) {
      setCurrentChannel(channel);
    }
  };

  return (
    <ChannelContext.Provider
      value={{
        channels,
        currentChannel,
        isLoading,
        selectChannel,
        fetchChannels,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

// 5. A custom hook so your components can easily access the channels
export function useChannel() {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error("useChannel must be used within a ChannelProvider");
  }
  return context;
}