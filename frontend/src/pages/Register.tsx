import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import loginBg from '../assets/login-bg.jpg';
import { Layers } from 'lucide-react';

export default function Register(){
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');
const navigate = useNavigate();
const handleRegister = async (e: SyntheticEvent)=>{
   e.preventDefault();
       try {
      // 1. Send the POST request to your Spring Boot backend
      // Remember we configured axios so '/auth/register' maps to 'http://localhost:8080/api/auth/register'
      await api.post('/auth/register', { 
        name: name, 
        email: email, 
        password: password 
      });
      alert("Registration successful! Please login.");
      navigate('/login');
      
    } catch (error) {
      alert("Registration failed! Email might already be taken.");
      console.error(error);
    }

}
   
return(
   <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 font-sans bg-white">
      {/* Left side Image  */}
      <div className="hidden md:block relative w-full h-full bg-gray-900">
         <img 
         src={loginBg} 
         alt="Abstract background" 
         className="absolute inset-0 h-full w-full object-cover opacity-90"/>
         <div className="absolute inset-0 bg-linear-to-t from-indigo-900/40 to-transparent" />
      </div>

      {/* Right side form  */}
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
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
               <input 
               type="text"
               value={name}
               onChange={(e)=> setName(e.target.value)}
               placeholder="Alex"
               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
               required 
               />
               
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

            <button 
              type="submit"
              className="w-full mt-2 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-colors"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
   </div>
);
}