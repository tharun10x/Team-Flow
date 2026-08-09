import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import Register from "./pages/Register";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Tasks } from "./pages/Tasks";
import { Message } from "./pages/Message";
import { Team } from "./pages/Team";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute/>}>
            <Route element={<DashboardLayout/>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks/>}/>
                <Route path="/messages" element={<Message/>}/>
                <Route path="/team" element={<Team/>}/>
                <Route path="/settings" element={<Settings/>}/>
            </Route>
        </Route>

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}