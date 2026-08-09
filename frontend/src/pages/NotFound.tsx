import { Link } from 'react-router-dom';
import notFoundBg from '../assets/404-bg.jpg';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white font-sans relative overflow-hidden">
      {/* Background Image with a subtle fade/blur */}
      <div className="absolute inset-0 z-0">
        <img 
          src={notFoundBg} 
          alt="404 Abstract Background" 
          className="w-full h-full object-cover opacity-[0.85]"
        />
        {/* Gradient overlay to ensure text is perfectly readable at the bottom */}
        <div className="absolute inset-0 bg-linear-to-t from-white via-white/80 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto flex flex-col items-center pt-[30vh]">
        
        {/* Massive 404 Text */}
        <h1 className="text-[140px] md:text-[180px] font-extrabold text-transparent bg-clip-text bg-linear-to-br from-indigo-700 to-violet-500 leading-none tracking-tighter drop-shadow-sm mb-2">
          404
        </h1>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight drop-shadow-sm">
          Oops! You seem to be lost.
        </h2>
        
        <p className="text-gray-600 text-lg mb-10 max-w-md mx-auto drop-shadow-sm font-medium">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3.5 bg-white/90 backdrop-blur-sm text-gray-700 font-bold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          
          <Link 
            to="/"
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
        
      </div>
    </div>
  );
}