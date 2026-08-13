import {createContext, useContext, useState, useEffect, type ReactNode} from 'react';
import api from "../api/axios";
import { useAuth } from './AuthContext';

export interface Workspace{
    id:number;
    name: string;
    description: string;
    inviteCode: string;
    ownerId: number;
    ownerName: string;
    currentUserRole: string;
    memberCount: number;
}

interface WorkspaceContextType{
    workspaces: Workspace[];
    currentWorkspace:Workspace|null;
    isLoading:boolean;
    fetchWorkspaces: () => Promise<void>;
    selectWorkspace: (id: number) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType|undefined>(undefined);

export const WorkspaceProvider = ({children}:{children:ReactNode})=>{

    const { isAuthenticated } = useAuth();
    
    // The state for our Context
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace|null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchWorkspaces = async ()=>{
        try {
            setIsLoading(true);
            const response = await api.get("/workspaces");
            setWorkspaces(response.data.data); // Remember ApiResponse format!
        } catch (error) {
            console.error("Failed to fetch workspaces", error);
        } finally {
            setIsLoading(false);
        }
    }

    const selectWorkspace = (id: number) => {
        const found = workspaces.find(w => w.id === id);
        if (found) setCurrentWorkspace(found);
    }
    
    useEffect(()=>{
        // Only fetch if the user is actually logged in
        if (isAuthenticated) {
            fetchWorkspaces();
        } else {
            // Clear out if they log out
            setWorkspaces([]);
            setCurrentWorkspace(null);
        }
    }, [isAuthenticated])

    // Provide the values to all children components
    return (
        <WorkspaceContext.Provider value={{ workspaces, currentWorkspace, isLoading, fetchWorkspaces, selectWorkspace }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export const useWorkspace = () =>{ 
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;   

}