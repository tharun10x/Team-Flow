import {createContext, useContext, useState, useEffect} from 'react';
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
    fetchWorkspace():()=>Promise<void>;
    selectWorkspace() :(id:number)=>void;
}

const WorkspaceContext = createContext<WorkspaceContextType|undefined>(undefined);

export const WorkspaceProvider = ({children})=>{

    const {user}= useAuth();
    
    useEffect(()=>{

        const fetchWorkspace = ()=>{

        }
        


    },[])
}

export const useWorkspace = () => useContext(WorkspaceContext)