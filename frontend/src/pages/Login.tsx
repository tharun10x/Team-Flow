import { useState, type SyntheticEvent } from 'react';
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
    <div className="grid min-h-screen w-full grid-cols-1 bg-paper font-body text-ink md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      
      {/* ─── LEFT SIDE (The beautiful image) ─── */}
      {/* Hidden on small screens, takes up full height on desktop */}
      <div className="relative hidden h-full w-full flex-col justify-between bg-graphite p-10 text-graphite-ink md:flex">
        <span className="font-display text-xl font-semibold tracking-display">TeamFlow</span>
        <span aria-hidden="true" className="font-display text-[clamp(3rem,6.5vw,6.5rem)] font-semibold leading-[0.9] tracking-display text-graphite-muted">TeamFlow</span>
      </div>

      {/* ─── RIGHT SIDE (The Login Form) ─── */}
      <div className="flex h-full items-center justify-center p-8">
        {/* We restrict the width of the form so it doesn't stretch out too far */}
        <div className="w-full max-w-sm">
          
          {/* Logo & Header */}
          <div className="mb-8">
            <h1 className="page-title">Welcome back</h1>
            <p className="mt-1 text-ink-2">Enter your credentials to access TeamFlow</p>
          </div>

          {/* The Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@teamflow.io"
                className="field field-lg"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field field-lg"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe} 
                onChange={(e)=>setRememberMe(e.target.checked)} 
                className="h-4 w-4 cursor-pointer accent-graphite"
              /> 
              <label htmlFor="rememberMe" className="text-sm font-medium text-ink-2 cursor-pointer select-none">
                Remember my email
              </label>
            </div>
            <button 
              type="submit"
              className="btn btn-lg mt-2 w-full"
            >
              Sign In
            </button>
          </form>
          <p className="mt-8 text-sm text-ink-2">
            Don’t have an account? <Link
                        to="/register"
                        className="link"
                    >
                    Sign up
                    </Link>
          </p>
        </div>
      </div>
      
    </div>
  );
}