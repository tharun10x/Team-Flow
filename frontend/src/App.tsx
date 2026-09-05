import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import Register from "./pages/Register";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Tasks } from "./pages/Tasks";
import { Message } from "./pages/Message";
import { Team } from "./pages/Team";
import { Settings } from "./pages/Settings";
import { WorkspaceSettings } from "./pages/WorkspaceSettings";
import { NotFound } from "./pages/NotFound";
import { WorkspacesPage } from "./pages/WorkspacesPage";
import { useWorkspace } from "./context/WorkspaceContext";

// This is the "traffic cop" — it checks the workspace context
// and redirects users to the right place.
function WorkspaceRedirect() {
  const { workspaces, currentWorkspace, isLoading } = useWorkspace();

  // Wait for the context to finish fetching from the backend
  if (isLoading) return <div>Loading...</div>;

  // No workspaces OR none selected → send to Hub
  if (workspaces.length === 0 || !currentWorkspace) {
    return <Navigate to="/workspaces" replace />;
  }

  // Has a workspace selected → send to Dashboard
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute/>}>
            {/* "/" is just a redirect — not a page itself */}
            <Route path="/" element={<WorkspaceRedirect />} />

            {/* Hub — Full screen, NO sidebar */}
            <Route path="/workspaces" element={<WorkspacesPage />} />

            {/* Dashboard — WITH sidebar */}
            <Route element={<DashboardLayout/>}>
                
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks/>}/>
                <Route path="/messages" element={<Message/>}/>
                <Route path="/team" element={<Team/>}/>
                <Route path="/settings" element={<Settings/>}/>
                <Route path="/workspace-settings" element={<WorkspaceSettings/>}/>
            </Route>
        </Route>

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}