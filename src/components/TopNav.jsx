import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, User, ChevronDown, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Avatar, StatusDot } from "./Avatar";
import { getLiveStatus } from "../data/mockData";

const TABS = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/employees", label: "Employees" },
  { to: "/app/attendance", label: "Attendance" },
  { to: "/app/time-off", label: "Time Off" },
];

export function TopNav() {
  const { currentUser, company, signOut, attendance, timeOffRequests, checkIn, checkOut } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = (attendance[currentUser.id] || []).find((r) => r.date === today);
  const isCheckedIn = todayRecord?.checkIn && !todayRecord?.checkOut;
  const isDoneForDay = todayRecord?.checkIn && todayRecord?.checkOut;
  const liveStatus = getLiveStatus(currentUser, attendance, timeOffRequests);

  return (
    <header className="sticky top-0 z-40 border-b border-base-700 bg-base-900/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold text-sm">
            {company.name.slice(0, 1)}
          </div>
          <span className="font-semibold text-base-100 tracking-tight hidden sm:block">{company.name}</span>
        </div>

        <nav className="flex items-center gap-1">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-accent/15 text-accent" : "text-base-300 hover:text-base-100 hover:bg-base-800"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-base-400 bg-base-800 border border-base-700 rounded-lg px-3 py-1.5">
            <Clock size={13} />
            {todayRecord?.checkIn ? (
              <span>
                In {todayRecord.checkIn}
                {todayRecord.checkOut ? ` · Out ${todayRecord.checkOut}` : ""}
              </span>
            ) : (
              <span>Not checked in yet</span>
            )}
          </div>

          {isDoneForDay ? (
            <button
              disabled
              className="text-sm font-medium px-3.5 py-2 rounded-lg bg-base-800 text-base-500 border border-base-700 cursor-not-allowed"
            >
              Checked out
            </button>
          ) : isCheckedIn ? (
            <button
              onClick={() => checkOut(currentUser.id)}
              className="text-sm font-medium px-3.5 py-2 rounded-lg bg-bad/15 text-bad border border-bad/30 hover:bg-bad/25 transition-colors focus-ring"
            >
              Check Out
            </button>
          ) : (
            <button
              onClick={() => checkIn(currentUser.id)}
              className="text-sm font-medium px-3.5 py-2 rounded-lg bg-good/15 text-good border border-good/30 hover:bg-good/25 transition-colors focus-ring"
            >
              Check In
            </button>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-base-800 focus-ring"
            >
              <div className="relative">
                <Avatar user={currentUser} size={34} />
                <span className="absolute -bottom-0.5 -right-0.5">
                  <StatusDot status={liveStatus} />
                </span>
              </div>
              <ChevronDown size={15} className="text-base-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-base-850 border border-base-700 rounded-xl shadow-card py-1.5 overflow-hidden">
                <button
                  onClick={() => { setMenuOpen(false); navigate(`/app/profile/${currentUser.id}`); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-base-200 hover:bg-base-800 text-left"
                >
                  <User size={15} /> My Profile
                </button>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-bad hover:bg-base-800 text-left"
                >
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
