import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar, type ViewId } from "./Sidebar";
import { Navbar } from "./NavBar";
import { useWorkspace } from "../context/WorkspaceContext";
import { Navigate } from "react-router-dom";
export function DashboardLayout() {
    const { currentWorkspace, isLoading } = useWorkspace();
    const navigate = useNavigate();
    const location = useLocation();

    if (isLoading) return <div className="justify-center items-center text-gray-400">Loading...</div>;
    if (!currentWorkspace) return <Navigate to="/workspaces" replace />;

    // 1. Read the current URL to figure out which Sidebar tab should be highlighted
    const currentView = location.pathname === "/" ? "dashboard" : location.pathname.replace("/", "") as ViewId;

    // 2. When a sidebar item is clicked, change the URL instead of using useState
    const handleNavigate = (view: ViewId) => {
        if (view === "dashboard") {
            navigate("/dashboard");
        } else {
            navigate(`/${view}`);
        }
    };

    return(
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            
                <Sidebar view={currentView} onNavigate={handleNavigate}/>
             <main className="flex-1 flex flex-col min-w-0 bg-white">
                <Navbar view={currentView} />
                <div className="flex-1 overflow-y-auto bg-gray-50/50">
                    <Outlet />
                </div>
            </main> 
        </div>
    );
}