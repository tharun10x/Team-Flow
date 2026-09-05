import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Edit2, LogOut } from "lucide-react";

export function Settings() {
  const { user, logout } = useAuth();
  
  // Profile State
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState("Product Manager"); // Mocked for now

  // Notification State
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifyAssignments, setNotifyAssignments] = useState(true);
  const [notifyComments, setNotifyComments] = useState(false);
  const [notifyDigest, setNotifyDigest] = useState(true);

  const initial = fullName ? fullName.charAt(0).toUpperCase() : "U";

  // Simple Toggle Switch Component
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-indigo-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      
      {/* Profile Section */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
        <h2 className="text-xl font-bold text-gray-900">Profile</h2>
        <p className="text-gray-500 text-sm mt-1 mb-8">Manage your personal information</p>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {initial}C {/* Mocking the 'C' for Chen from the mockup, or just {initial} */}
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors">
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{fullName}</h3>
            <p className="text-sm text-gray-500">{role} · Startup HQ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all"
          />
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        <p className="text-gray-500 text-sm mt-1 mb-8">Choose what alerts you receive</p>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Mentions & direct messages</h3>
              <p className="text-sm text-gray-500">When someone @mentions you or sends a DM</p>
            </div>
            <Toggle checked={notifyMentions} onChange={setNotifyMentions} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Task assignments</h3>
              <p className="text-sm text-gray-500">When a task is assigned to you</p>
            </div>
            <Toggle checked={notifyAssignments} onChange={setNotifyAssignments} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Task comments</h3>
              <p className="text-sm text-gray-500">When someone comments on your tasks</p>
            </div>
            <Toggle checked={notifyComments} onChange={setNotifyComments} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Weekly digest</h3>
              <p className="text-sm text-gray-500">A summary of your team's activity every Monday</p>
            </div>
            <Toggle checked={notifyDigest} onChange={setNotifyDigest} />
          </div>
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
        <h2 className="text-xl font-bold text-gray-900">Danger Zone</h2>
        <p className="text-gray-500 text-sm mt-1 mb-8">Irreversible actions for your account</p>

        <div className="space-y-4">
          {/* Delete Account */}
          <div className="bg-red-50/50 border border-red-50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Delete Account</h3>
              <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all your data</p>
            </div>
            <button className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-semibold rounded-xl transition-colors shrink-0">
              Delete
            </button>
          </div>

          {/* Sign Out */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Sign Out</h3>
              <p className="text-sm text-gray-500 mt-1">Sign out of your account on this device</p>
            </div>
            <button 
              onClick={() => logout()}
              className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
