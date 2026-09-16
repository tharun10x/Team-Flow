import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Login } from "./pages/Login";
import Register from "./pages/Register";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Tasks } from "./pages/Tasks";
import { Team } from "./pages/Team";
import { Settings } from "./pages/Settings";
import { WorkspaceSettings } from "./pages/WorkspaceSettings";
import { NotFound } from "./pages/NotFound";
import { WorkspacesPage } from "./pages/WorkspacesPage";
import { useWorkspace } from "./context/WorkspaceContext";
import { ChatArea } from "./pages/ChatArea";
import { MessageLayout } from "./components/MessagesLayout";


function WorkspaceRedirect() {
  const { workspaces, currentWorkspace, isLoading } = useWorkspace();

  if (isLoading) return <div className="flex h-screen justify-center items-center">Loading...</div>;

  if (workspaces.length === 0 || !currentWorkspace) {
    return <Navigate to="/workspaces" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
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
                <Route path="/messages" element={<MessageLayout/>}>
                  <Route path=":channelId" element={<ChatArea/>}/>
                </Route>
                <Route path="/team" element={<Team/>}/>
                <Route path="/settings" element={<Settings/>}/>
                <Route path="/workspace-settings" element={<WorkspaceSettings/>}/>
            </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}