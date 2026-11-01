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
  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-pill border transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
        checked ? "border-primary-edge bg-primary" : "border-rule-2 bg-paper-3"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4.5 w-4.5 rounded-pill bg-key-face shadow-card transition-transform duration-200 ${
          checked ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );

  const NOTIFICATIONS = [
    { title: "Mentions & direct messages", line: "When someone @mentions you or sends a DM", checked: notifyMentions, set: setNotifyMentions },
    { title: "Task assignments", line: "When a task is assigned to you", checked: notifyAssignments, set: setNotifyAssignments },
    { title: "Task comments", line: "When someone comments on your tasks", checked: notifyComments, set: setNotifyComments },
    { title: "Weekly digest", line: "A summary of your team's activity every Monday", checked: notifyDigest, set: setNotifyDigest },
  ];

  // a settings band: what it is on the left, its controls on the right
  const Band = ({ title, line, children }: { title: string; line: string; children: React.ReactNode }) => (
    <section className="grid gap-6 border-t border-rule py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="mt-1 text-sm text-muted">{line}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );

  return (
    <div className="page max-w-5xl!">
      
      {/* Profile Section */}
      <Band title="Profile" line="Manage your personal information">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <div className="grid h-16 w-16 place-items-center rounded-pill bg-graphite font-display text-xl font-semibold text-graphite-ink">
              {initial}C {/* Mocking the 'C' for Chen from the mockup, or just {initial} */}
            </div>
            <button type="button" aria-label="Change photo" className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-pill border border-rule-2 bg-key-face text-ink-2 transition-colors hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-focus">
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h3 className="font-body text-md font-medium tracking-normal text-ink">{fullName}</h3>
            <p className="text-sm text-muted">{role} · Startup HQ</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="settings-name" className="label">Full Name</label>
            <input
              id="settings-name"
              name="name"
              autoComplete="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="settings-email" className="label">Email Address</label>
            <input
              id="settings-email"
              name="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="settings-role" className="label">Role</label>
          <input
            id="settings-role"
            name="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="field"
          />
        </div>

        <button type="button" className="btn">
          Save Changes
        </button>
      </Band>

      {/* Notifications Section */}
      <Band title="Notifications" line="Choose what alerts you receive">
        <ul className="divide-y divide-rule border-y border-rule">
          {NOTIFICATIONS.map((n) => (
            <li key={n.title} className="flex items-center justify-between gap-6 py-4">
              <div>
                <h3 className="font-body text-sm font-medium tracking-normal text-ink">{n.title}</h3>
                <p className="text-sm text-muted">{n.line}</p>
              </div>
              <Toggle checked={n.checked} onChange={n.set} label={n.title} />
            </li>
          ))}
        </ul>
      </Band>

      {/* Danger Zone Section */}
      <Band title="Danger Zone" line="Irreversible actions for your account">
        <ul className="divide-y divide-rule border-y border-rule">
          {/* Sign Out */}
          <li className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-body text-sm font-medium tracking-normal text-ink">Sign Out</h3>
              <p className="text-sm text-muted">Sign out of your account on this device</p>
            </div>
            <button 
              type="button"
              onClick={() => logout()}
              className="btn btn-quiet shrink-0"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </li>

          {/* Delete Account */}
          <li className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-body text-sm font-medium tracking-normal text-error">Delete Account</h3>
              <p className="text-sm text-muted">Permanently delete your account and all your data</p>
            </div>
            <button type="button" className="btn btn-danger shrink-0">
              Delete
            </button>
          </li>
        </ul>
      </Band>

    </div>
  );
}
