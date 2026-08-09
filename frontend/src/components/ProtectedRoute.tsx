import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute(){
    const {isAuthenticated, isLoading} = useAuth();
    if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium">Verifying session...</p>
      </div>
    );
  }

  if(!isAuthenticated){
    return <Navigate to="/login" replace />;
  }
   return <Outlet />;
   
}