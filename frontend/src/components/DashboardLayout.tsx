import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar, type ViewId } from "./Sidebar";
import { Navbar } from "./NavBar";
import { useWorkspace } from "../context/WorkspaceContext";
import { Navigate } from "react-router-dom";
export function DashboardLayout() {
    const { currentWorkspace, isLoading } = useWorkspace();
    const navigate = useNavigate();
    const location = useLocation();

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-paper text-sm text-muted" role="status">Loading…</div>;
    if (!currentWorkspace) return <Navigate to="/workspaces" replace />;

    const firstSegment = location.pathname.split("/").filter(Boolean)[0] || "dashboard";
    const currentView = (
        firstSegment === "messages" || firstSegment === "tasks" || firstSegment === "team" ||
        firstSegment === "settings" || firstSegment === "workspace-settings") ? firstSegment as ViewId : "dashboard";

    const handleNavigate = (view: ViewId) => {
        if (view === "dashboard") {
            navigate("/dashboard");
        } else {
            navigate(`/${view}`);
        }
    };

    return(
        <div className="flex h-screen overflow-hidden bg-paper-2 font-body text-ink">

            <Sidebar view={currentView} onNavigate={handleNavigate}/>
             <main className="flex min-w-0 flex-1 flex-col bg-paper">
                <Navbar view={currentView} />
                <div className="min-w-0 flex-1 overflow-y-auto overflow-x-clip">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
