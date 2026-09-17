import { useState, type SyntheticEvent } from 'react';
import { Layers } from 'lucide-react';
import loginBg from '../assets/login-bg.jpg'; 
import { Link } from "react-router-dom";
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function Login() {
const [email, setEmail] = useState(localStorage.getItem('savedEmail') ||'');
const [password, setPassword] = useState('');
const [rememberMe, setRememberMe] = useState(false);

const navigate = useNavigate();
const { login } = useAuth();
  const handleLogin = async (e: SyntheticEvent) => {
    e.preventDefault();
    
    try {
        const response = await api.post('auth/login',{
        email:email,
        password:password
        })
        
        // Because of ApiResponse wrapper, the payload is inside response.data.data
        const token = response.data.data.token;
        const user = { 
            id: response.data.data.userId, 
            name: response.data.data.name, 
            email: response.data.data.email 
        };
        
        // Actually save the token and user state to the Global Backpack!
        login(token, user);
        if(rememberMe){
          localStorage.setItem('savedEmail', email);
        }
        else{
          localStorage.removeItem('savedEmail');  
        }
        toast.success("Login successful");
        navigate('/');

    } catch (error) {
        toast.error("Login Failed Email Or Password might be incorrect")
        console.log(error)
        
    }
  };

  return (
    // The main container fills the entire screen (h-screen) and splits it into 2 equal columns!
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 font-sans bg-white">
      
      {/* ─── LEFT SIDE (The beautiful image) ─── */}
      {/* Hidden on small screens, takes up full height on desktop */}
      <div className="hidden md:block relative h-full w-full bg-gray-900">
        <img 
          src={loginBg} 
          alt="Abstract background" 
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        {/* A subtle gradient overlay to make it look even more premium */}
        <div className="absolute inset-0 bg-linear-to-t from-indigo-900/40 to-transparent" />
      </div>

      {/* ─── RIGHT SIDE (The Login Form) ─── */}
      <div className="flex items-center justify-center p-8 h-full">
        {/* We restrict the width of the form so it doesn't stretch out too far */}
        <div className="w-full max-w-sm">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md mb-4">
              <Layers className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-2">Enter your credentials to access TeamFlow</p>
          </div>

          {/* The Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@teamflow.io"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe} 
                onChange={(e)=>setRememberMe(e.target.checked)} 
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded-sm focus:ring-indigo-500 cursor-pointer"
              /> 
              <label htmlFor="rememberMe" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                Remember my email
              </label>
            </div>
            <button 
              type="submit"
              className="w-full mt-2 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account? <Link
                        to="/register"
                        className="font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                    Sign up
                    </Link>
          </p>
        </div>
      </div>
      
    </div>
  );
}