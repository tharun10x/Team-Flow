import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner";

export default function Register(){
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');
const navigate = useNavigate();
const handleRegister = async (e: SyntheticEvent)=>{
   e.preventDefault();
       try {
      await api.post('auth/register', { 
        name: name, 
        email: email, 
        password: password 
      });
      toast.success("Registration successful! Please login.")
      navigate('/login');
      
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Unknown error";
      toast.error("Registration failed: " + msg);
      console.error("Register error:", error);
    }

}
   
return(
   <div className="grid min-h-screen w-full grid-cols-1 bg-paper font-body text-ink md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Left side Image  */}
      <div className="relative hidden h-full w-full flex-col justify-between bg-graphite p-10 text-graphite-ink md:flex">
        <span className="font-display text-xl font-semibold tracking-display">TeamFlow</span>
        <span aria-hidden="true" className="font-display text-[clamp(3rem,6.5vw,6.5rem)] font-semibold leading-[0.9] tracking-display text-graphite-muted">TeamFlow</span>
      </div>

      {/* Right side form  */}
      <div className="flex h-full items-center justify-center p-8">
        {/* We restrict the width of the form so it doesn't stretch out too far */}
        <div className="w-full max-w-sm">
          
          {/* Logo & Header */}
          <div className="mb-8">
            <h1 className="page-title">Create your account</h1>
            <p className="mt-1 text-ink-2">Enter your credentials to access TeamFlow</p>
          </div>

          {/* The Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div>
               <label htmlFor="name" className="label">Name</label>
               <input 
               type="text"
               value={name}
               onChange={(e)=> setName(e.target.value)}
               placeholder="Alex"
               className="field field-lg"
               required 
               />
               
              </div>
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

            <button 
              type="submit"
              className="btn btn-lg mt-2 w-full"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
   </div>
);
}