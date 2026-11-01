import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute(){
    const {isAuthenticated, isLoading} = useAuth();
    if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-muted" role="status">Verifying session…</p>
      </div>
    );
  }

  if(!isAuthenticated){
    return <Navigate to="/login" replace />;
  }
   return <Outlet />;
   
}