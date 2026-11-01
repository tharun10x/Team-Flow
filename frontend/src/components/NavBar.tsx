import { Search, Bell, Plus } from "lucide-react";
import type { ViewId } from "./Sidebar";
import { useAuth } from "../context/AuthContext";

function capitalizeFirstLetter(str:string) {
  if (!str) return ""; // Handle empty strings safely
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function MeAvatar({ initial }: { initial: string }) {
  return (
    <div className="avatar avatar-lg bg-graphite text-graphite-ink">
      {initial}
    </div>
  );
}

export function Navbar({view:ViewId}:{view:ViewId}) {

    const {user}= useAuth();
        const initial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U';
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-rule bg-paper px-4 md:gap-6 md:px-6">
      <h1 className="font-display text-lg font-semibold tracking-display text-ink">{capitalizeFirstLetter(ViewId)}</h1>
      {/* ─── LEFT SIDE: Search Bar ─── */}
      <div className="hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            aria-label="Search"
            className="field pl-9! pr-12!"
            placeholder="Search tasks, projects, or messages..."
          />
          {/* A cool keyboard shortcut hint for power users */}
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-input border border-rule-2 bg-paper px-1.5 py-0.5 font-body text-xs text-muted">
            ⌘&nbsp;K
          </kbd>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Actions & Notifications ─── */}
      <div className="flex items-center gap-2">

        {/* Notification Bell */}
        <button type="button" className="btn btn-ghost btn-icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </button>

        {/* Primary CTA Button */}
        <button type="button" className="btn btn-quiet hidden sm:inline-flex">
          <Plus className="h-4 w-4" />
          New Task
        </button>
        <MeAvatar initial={initial}/>
      </div>

    </header>
  );
}
