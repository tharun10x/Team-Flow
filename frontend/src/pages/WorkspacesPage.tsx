import {Search, Plus, Layers, ChevronDown} from "lucide-react"
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Person from "../assets/Person.png"
import { CreateWorkspaceModal } from "../components/CreateWorkspaceModal";
import { JoinWorkspaceModal } from "../components/JoinWorkspaceModal";
import { useWorkspace } from "../context/WorkspaceContext";
import { useNavigate } from "react-router-dom";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function WorkspacesPage(){
const {user} = useAuth();
const initial = (user?.name ??"User").charAt(0).toUpperCase();
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

const { workspaces, selectWorkspace } = useWorkspace();
const navigate = useNavigate();

const handleSelectWorkspace = (id: number) => {
    localStorage.setItem("currentWorkspaceId", String(id));
    selectWorkspace(id);
    navigate("/dashboard");
};
    return(
        <div className="min-h-screen px-8 py-6 bg-gray-50">
            <header className="flex justify-between">

                <div className="font-bold text-xl flex gap-2">
                    <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-600 to-violet-600 
                        flex items-center justify-center shadow-sm">
                        <Layers className="w-3.5 h-3.5 text-white " strokeWidth={2.5} />
                    </div>
                    TeamFlow
                </div>

                <div id="Profile" className="flex gap-3 items-center rounded-xl p-2 shadow-2xl border border-indigo-600 hover:shadow-indigo-400/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-semibold bg-linear-to-br from-indigo-500 to-violet-600 shrink-0">
                        {initial}
                    </div>
                    <div className="font-medium text-gray-900">
                        {capitalize(user?.name ?? "User")}
                    </div>
                    <button onClick={()=>setIsDropdownOpen(!isDropdownOpen)}>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>            
                </div>
            </header>

            <main className="flex justify-center items-center min-h-screen flex-col">
                <div className="flex  justify-center items-center">

                <div>
                <h1 className="font-bold text-4xl">
                    Welcome, {capitalize(user?.name ?? "User")}!
                    <br /> You're almost ready to start.
                </h1>
                <p>To begin collaborating, you first need a shared workspace.</p>
                </div>
                <img src={Person} alt=""  className="float-left me-4 mb-2 max-w-[25%] h-auto rounded" />
                </div>
                <div id="cards" className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mt-5">
    
                    {/* Card 1: Join Workspace */}
                    <div 
                    id="card1" 
                    onClick={() => setIsJoinModalOpen(true)}
                    className="group p-6 bg-white border border-gray-200 rounded-2xl 
                                hover:border-indigo-300 hover:shadow-lg 
                                transition-all duration-300 cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center 
                                        justify-center mb-4 group-hover:bg-indigo-100 
                                        transition-colors">
                            <Search className="w-9 h-9 text-indigo-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">
                            Join an Existing Workspace
                        </p>
                        <p className="text-sm text-gray-500">
                            Enter an invite code to join your team.
                        </p>

                        <button className="mt-4 mx-auto block px-6 py-2.5 border-2 border-indigo-600 
                                        text-indigo-600 text-sm font-semibold rounded-xl 
                                        hover:bg-indigo-600 hover:text-white 
                                        active:scale-95 transition-all duration-200">
                            Join with Id
                        </button>
                    </div>

                    {/* Card 2: Create Workspace */}
                    <div 
                    id="card2" 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group p-6 bg-white border border-gray-200 rounded-2xl 
                                hover:border-indigo-300 hover:shadow-lg 
                                transition-all duration-300 cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-xl bg-violet-50 flex items-center 
                                        justify-center mb-4 group-hover:bg-violet-100 
                                        transition-colors">
                            <Plus className="w-9 h-9 text-violet-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">
                            Create a New Workspace
                        </p>
                        <p className="text-sm text-gray-500">
                            Start fresh and invite your team members.
                        </p>
                        <button className="mt-4 mx-auto block px-6 py-2.5 border-2 border-indigo-600 
                            text-white bg-indigo-600 text-sm font-semibold rounded-xl 
                            hover:bg-indigo-700 hover:border-indigo-700
                            active:scale-95 transition-all duration-200">
                            Create New Workspace
                        </button>
                    </div>

                </div>
                {/* here */}
                {
                    workspaces.length>0 &&(
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w">
                            {workspaces.map((ws) => (
                                <div key={ws.id} onClick={() => handleSelectWorkspace(ws.id)} className="m-3 flex">
                                    {/* Card content */}
                                    <div id="card" className="border rounded-xl p-3 border-indigo-500 flex-1">
                                        <p className="text-s text-gray-500 " >Workspace Name</p>
                                        <p className="font-semibold text-2xl">{ws.name}</p>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Member Count</p>
                                                <p className="text-sm">{ws.memberCount}</p>
                                            </div>

                                            <div className="h-8 w-px bg-gray-300" />

                                            <div>
                                                <p className="text-xs text-gray-500">Roles</p>
                                                <p className="text-sm">{ws.currentUserRole}</p>
                                            </div>
                                        </div>
                                        <p>{ws.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    
                )}
            </main>

            {/* Modals */}
            {isCreateModalOpen && (
                <CreateWorkspaceModal onClose={() => setIsCreateModalOpen(false)} />
            )}
            {
                isJoinModalOpen &&(
                    <JoinWorkspaceModal onClose={() => setIsJoinModalOpen(false)} />
                
            )}
        </div>
    );
}