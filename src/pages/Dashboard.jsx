import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Clock, CalendarDays, LogOut, Users, ClipboardList, CheckSquare, ArrowRightLeft, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Avatar, StatusDot } from "../components/Avatar";
import { getLiveStatus } from "../data/mockData";

export default function Dashboard() {
  const { currentUser } = useApp();
  return currentUser.role === "admin" ? <AdminDashboard /> : <EmployeeDashboard />;
}

const ACCENT_STYLES = {
  accent: "bg-accent/15 border-accent/30 text-accent",
  warn: "bg-warn/15 border-warn/30 text-warn",
};

function Card({ icon: Icon, title, subtitle, onClick, accent = "accent" }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-base-850 border border-base-700 rounded-2xl p-5 shadow-card hover:border-accent/50 hover:bg-base-800 transition-colors focus-ring group"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${ACCENT_STYLES[accent] || ACCENT_STYLES.accent}`}>
          <Icon size={18} />
        </div>
        <ChevronRight size={16} className="text-base-600 group-hover:text-base-300 transition-colors mt-1" />
      </div>
      <p className="mt-3.5 font-medium text-base-100 text-sm">{title}</p>
      <p className="text-xs text-base-400 mt-0.5">{subtitle}</p>
    </button>
  );
}

function EmployeeDashboard() {
  const { currentUser, attendance, timeOffRequests, timeOffAllocations, signOut } = useApp();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = (attendance[currentUser.id] || []).find((r) => r.date === today);
  const liveStatus = getLiveStatus(currentUser, attendance, timeOffRequests);

  const myRequests = timeOffRequests.filter((r) => r.employeeId === currentUser.id);
  const pendingCount = myRequests.filter((r) => r.status === "pending").length;
  const alloc = timeOffAllocations[currentUser.id];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-7">
        <Avatar user={currentUser} size={52} />
        <div>
          <h1 className="text-xl font-semibold text-base-100">
            Welcome back, {currentUser.firstName}
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <StatusDot status={liveStatus} withLabel />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Card
          icon={User}
          title="My Profile"
          subtitle="View and edit your details"
          onClick={() => navigate(`/app/profile/${currentUser.id}`)}
        />
        <Card
          icon={Clock}
          title="Attendance"
          subtitle={todayRecord?.checkIn ? `Checked in at ${todayRecord.checkIn}` : "Not checked in yet today"}
          onClick={() => navigate("/app/attendance")}
        />
        <Card
          icon={CalendarDays}
          title="Leave Requests"
          subtitle={pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? "s" : ""}` : `${alloc ? alloc.paid.total - alloc.paid.used : 0} paid days left`}
          onClick={() => navigate("/app/time-off")}
        />
      </div>

      <button
        onClick={signOut}
        className="flex items-center gap-2.5 bg-base-850 border border-base-700 rounded-2xl px-5 py-4 shadow-card hover:border-bad/40 hover:bg-base-800 transition-colors focus-ring text-sm text-bad font-medium w-full sm:w-auto"
      >
        <LogOut size={16} /> Log Out
      </button>

      {myRequests.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-base-300 mb-3">Recent activity</h2>
          <div className="bg-base-850 border border-base-700 rounded-2xl divide-y divide-base-700 shadow-card overflow-hidden">
            {myRequests.slice(0, 4).map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <span className="text-base-300">
                  {r.type === "paid" ? "Paid time off" : r.type === "sick" ? "Sick leave" : "Unpaid leave"} request
                </span>
                <span
                  className={`text-xs border rounded-full px-2.5 py-1 capitalize ${
                    r.status === "approved"
                      ? "bg-good/15 text-good border-good/30"
                      : r.status === "rejected"
                      ? "bg-bad/15 text-bad border-bad/30"
                      : "bg-warn/15 text-warn border-warn/30"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { users, attendance, timeOffRequests } = useApp();
  const navigate = useNavigate();
  const [switchTo, setSwitchTo] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const presentToday = useMemo(
    () => users.filter((u) => (attendance[u.id] || []).some((r) => r.date === today && r.checkIn)).length,
    [users, attendance, today]
  );
  const pendingApprovals = timeOffRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-base-100 mb-1">HR Dashboard</h1>
      <p className="text-sm text-base-400 mb-7">{presentToday} of {users.length} people checked in today.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card
          icon={Users}
          title="Employee List"
          subtitle={`${users.length} people at your company`}
          onClick={() => navigate("/app/employees")}
        />
        <Card
          icon={ClipboardList}
          title="Attendance Records"
          subtitle="See who's in, out, or on leave"
          onClick={() => navigate("/app/attendance")}
        />
        <Card
          icon={CheckSquare}
          title="Leave Approvals"
          subtitle={pendingApprovals > 0 ? `${pendingApprovals} awaiting your review` : "All caught up"}
          onClick={() => navigate("/app/time-off")}
          accent={pendingApprovals > 0 ? "warn" : "accent"}
        />
      </div>

      <div className="bg-base-850 border border-base-700 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRightLeft size={16} className="text-base-400" />
          <h2 className="text-sm font-medium text-base-200">Switch between employees</h2>
        </div>
        <p className="text-xs text-base-500 mb-3">Jump straight into someone's profile, attendance, or leave history.</p>
        <div className="flex gap-2">
          <select
            value={switchTo}
            onChange={(e) => setSwitchTo(e.target.value)}
            className="flex-1 bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus-ring focus:border-accent"
          >
            <option value="">Select an employee…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} — {u.designation}
              </option>
            ))}
          </select>
          <button
            disabled={!switchTo}
            onClick={() => switchTo && navigate(`/app/profile/${switchTo}`)}
            className="shrink-0 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors focus-ring disabled:opacity-40 disabled:cursor-not-allowed"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
