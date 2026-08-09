import { Search, Bell, Plus } from "lucide-react";
import type { ViewId } from "./Sidebar";
import { useAuth } from "../context/AuthContext";

function capitalizeFirstLetter(str:string) {
  if (!str) return ""; // Handle empty strings safely
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function MeAvatar({ initial }: { initial: string }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-semibold bg-linear-to-br from-indigo-500 to-violet-600">
      {initial}
    </div>
  );
}

export function Navbar({view:ViewId}:{view:ViewId}) {

    const {user}= useAuth();
        const initial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U';
  return (
    <header className="h-16 shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="font-semibold text-2xl">{capitalizeFirstLetter(ViewId)}</h1>
      {/* ─── LEFT SIDE: Search Bar ─── */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all"
            placeholder="Search tasks, projects, or messages..."
          />
          {/* A cool keyboard shortcut hint for power users */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-medium text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white shadow-sm">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Actions & Notifications ─── */}
      <div className="flex items-center gap-4 ml-4">
        
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
          <Bell className="h-5 w-5" />
          {/* Red Notification Dot */}
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        {/* Primary CTA Button */}
        <button className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-95">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New Task
        </button>
        <MeAvatar initial={initial}/>
      </div>
      
    </header>
  );
}