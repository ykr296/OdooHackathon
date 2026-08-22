import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Avatar } from "../components/Avatar";

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function startOfWeek(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Sun ... 6 = Sat
  const diff = (day === 0 ? -6 : 1) - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function weekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

function formatDay(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatShort(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function formatWeekday(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" });
}

function formatWeekRange(weekStart) {
  const end = addDays(weekStart, 6);
  const s = new Date(weekStart);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth();
  const startLabel = s.toLocaleDateString("en-IN", { day: "2-digit", month: sameMonth ? undefined : "short" });
  const endLabel = e.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

function workHours(rec) {
  if (!rec?.checkIn || !rec?.checkOut) return "—";
  const [h1, m1] = rec.checkIn.split(":").map(Number);
  const [h2, m2] = rec.checkOut.split(":").map(Number);
  const mins = h2 * 60 + m2 - (h1 * 60 + m1);
  if (mins <= 0) return "—";
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const STATUS_BADGE = {
  present: "bg-good/15 text-good border-good/30",
  leave: "bg-warn/15 text-warn border-warn/30",
  absent: "bg-bad/15 text-bad border-bad/30",
  "half-day": "bg-[#3EA6CF]/15 text-[#3EA6CF] border-[#3EA6CF]/30",
};

const STATUS_DOT_COLOR = {
  present: "#3ECF8E",
  leave: "#EFB93E",
  absent: "#F0576B",
  "half-day": "#3EA6CF",
};

function ViewToggle({ view, setView }) {
  return (
    <div className="flex gap-1 bg-base-850 border border-base-700 rounded-lg p-1 w-fit">
      {["day", "week"].map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`px-3.5 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
            view === v ? "bg-accent/15 text-accent" : "text-base-400 hover:text-base-100"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

export default function Attendance() {
  const { currentUser, users, attendance } = useApp();
  const isAdmin = currentUser.role === "admin";
  return isAdmin ? <AdminAttendance users={users} attendance={attendance} /> : <SelfAttendance user={currentUser} attendance={attendance} />;
}

function AdminAttendance({ users, attendance }) {
  const [view, setView] = useState("day");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date().toISOString().slice(0, 10)));
  const [query, setQuery] = useState("");

  const filteredUsers = users.filter((u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(query.toLowerCase()));

  const dayRows = filteredUsers.map((u) => {
    const rec = (attendance[u.id] || []).find((r) => r.date === date);
    return { user: u, rec };
  });
  const presentCount = dayRows.filter((r) => r.rec?.status === "present" || r.rec?.checkIn).length;
  const days = weekDates(weekStart);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-base-100">Attendance</h1>
          <p className="text-sm text-base-400 mt-0.5">
            {view === "day" ? `${presentCount} of ${dayRows.length} present today` : `Week of ${formatWeekRange(weekStart)}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} setView={setView} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people…"
            className="bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm w-56 placeholder:text-base-500 focus-ring focus:border-accent"
          />
        </div>
      </div>

      {view === "day" ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setDate((d) => addDays(d, -1))} className="p-2 rounded-lg border border-base-700 hover:border-accent/50 focus-ring">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setDate((d) => addDays(d, 1))} className="p-2 rounded-lg border border-base-700 hover:border-accent/50 focus-ring">
              <ChevronRight size={16} />
            </button>
            <span className="text-sm text-base-200 font-medium ml-2">{formatDay(date)}</span>
            <button
              onClick={() => setDate(new Date().toISOString().slice(0, 10))}
              className="ml-auto text-xs text-accent hover:text-accent-hover"
            >
              Jump to today
            </button>
          </div>

          <div className="bg-base-850 border border-base-700 rounded-2xl overflow-hidden shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-base-500 border-b border-base-700">
                  <th className="px-5 py-3 font-medium">Employee</th>
                  <th className="px-5 py-3 font-medium">Check In</th>
                  <th className="px-5 py-3 font-medium">Check Out</th>
                  <th className="px-5 py-3 font-medium">Work Hours</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {dayRows.map(({ user, rec }) => (
                  <tr key={user.id} className="border-b border-base-700 last:border-0 hover:bg-base-800/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar user={user} size={30} />
                        <span className="text-base-100">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-base-300">{rec?.checkIn || "—"}</td>
                    <td className="px-5 py-3 text-base-300">{rec?.checkOut || "—"}</td>
                    <td className="px-5 py-3 text-base-300">{workHours(rec)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs border rounded-full px-2.5 py-1 ${STATUS_BADGE[rec?.status || "absent"]}`}>
                        {rec?.status ? rec.status.replace("-", " ") : "absent"}
                      </span>
                    </td>
                  </tr>
                ))}
                {dayRows.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-base-500">No matches.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setWeekStart((d) => addDays(d, -7))} className="p-2 rounded-lg border border-base-700 hover:border-accent/50 focus-ring">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setWeekStart((d) => addDays(d, 7))} className="p-2 rounded-lg border border-base-700 hover:border-accent/50 focus-ring">
              <ChevronRight size={16} />
            </button>
            <span className="text-sm text-base-200 font-medium ml-2">{formatWeekRange(weekStart)}</span>
            <button
              onClick={() => setWeekStart(startOfWeek(new Date().toISOString().slice(0, 10)))}
              className="ml-auto text-xs text-accent hover:text-accent-hover"
            >
              Jump to this week
            </button>
          </div>

          <div className="bg-base-850 border border-base-700 rounded-2xl overflow-x-auto shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-base-500 border-b border-base-700">
                  <th className="px-5 py-3 font-medium sticky left-0 bg-base-850">Employee</th>
                  {days.map((d) => (
                    <th key={d} className="px-3 py-3 font-medium text-center whitespace-nowrap">
                      {formatWeekday(d)} <span className="text-base-600">{formatShort(d)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-base-700 last:border-0 hover:bg-base-800/60">
                    <td className="px-5 py-3 sticky left-0 bg-base-850">
                      <div className="flex items-center gap-2.5">
                        <Avatar user={u} size={26} />
                        <span className="text-base-100 whitespace-nowrap">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    {days.map((d) => {
                      const rec = (attendance[u.id] || []).find((r) => r.date === d);
                      const status = rec?.status;
                      return (
                        <td key={d} className="px-3 py-3 text-center">
                          {status ? (
                            <span
                              title={`${status.replace("-", " ")}${rec.checkIn ? ` · In ${rec.checkIn}` : ""}${rec.checkOut ? ` · Out ${rec.checkOut}` : ""}`}
                              className="inline-block w-2.5 h-2.5 rounded-full"
                              style={{ background: STATUS_DOT_COLOR[status] || "#4B5160" }}
                            />
                          ) : (
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-base-700" title="No record" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-base-500">No matches.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-base-500">
            {Object.entries(STATUS_DOT_COLOR).map(([k, c]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: c }} /> {k.replace("-", " ")}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SelfAttendance({ user, attendance }) {
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date().toISOString().slice(0, 10)));

  const allRecords = attendance[user.id] || [];

  const summary = useMemo(() => {
    const present = allRecords.filter((r) => r.status === "present").length;
    const leave = allRecords.filter((r) => r.status === "leave" || r.status === "absent").length;
    const totalHours = allRecords.reduce((acc, r) => {
      if (!r.checkIn || !r.checkOut) return acc;
      const [h1, m1] = r.checkIn.split(":").map(Number);
      const [h2, m2] = r.checkOut.split(":").map(Number);
      return acc + Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
    }, 0);
    return { present, leave, totalHours: totalHours.toFixed(1) };
  }, [allRecords]);

  const dayRecord = allRecords.find((r) => r.date === date);
  const weekRecords = weekDates(weekStart).map((d) => allRecords.find((r) => r.date === d) || { date: d, checkIn: "", checkOut: "", status: null });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-base-100 mb-1">Attendance</h1>
          <p className="text-sm text-base-400">Your check-in history.</p>
        </div>
        <ViewToggle view={view} setView={setView} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="Days present" value={summary.present} />
        <Stat label="Leave / absent" value={summary.leave} />
        <Stat label="Hours logged" value={summary.totalHours} />
      </div>

      {view === "day" ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setDate((d) => addDays(d, -1))} className="p-2 rounded-lg border border-base-700 hover:border-accent/50 focus-ring">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setDate((d) => addDays(d, 1))} className="p-2 rounded-lg border border-base-700 hover:border-accent/50 focus-ring">
              <ChevronRight size={16} />
            </button>
            <span className="text-sm text-base-200 font-medium ml-2">{formatDay(date)}</span>
            <button
              onClick={() => setDate(new Date().toISOString().slice(0, 10))}
              className="ml-auto text-xs text-accent hover:text-accent-hover"
            >
              Jump to today
            </button>
          </div>
          <div className="bg-base-850 border border-base-700 rounded-2xl overflow-hidden shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-base-500 border-b border-base-700">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Check In</th>
                  <th className="px-5 py-3 font-medium">Check Out</th>
                  <th className="px-5 py-3 font-medium">Work Hours</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-base-800/60">
                  <td className="px-5 py-3 text-base-100">{formatShort(date)}</td>
                  <td className="px-5 py-3 text-base-300">{dayRecord?.checkIn || "—"}</td>
                  <td className="px-5 py-3 text-base-300">{dayRecord?.checkOut || "—"}</td>
                  <td className="px-5 py-3 text-base-300">{workHours(dayRecord)}</td>
                  <td className="px-5 py-3">
                    {dayRecord?.status ? (
                      <span className={`text-xs border rounded-full px-2.5 py-1 ${STATUS_BADGE[dayRecord.status]}`}>
                        {dayRecord.status.replace("-", " ")}
                      </span>
                    ) : (
                      <span className="text-xs text-base-500">No record</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setWeekStart((d) => addDays(d, -7))} className="p-2 rounded-lg border border-base-700 hover:border-accent/50 focus-ring">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setWeekStart((d) => addDays(d, 7))} className="p-2 rounded-lg border border-base-700 hover:border-accent/50 focus-ring">
              <ChevronRight size={16} />
            </button>
            <span className="text-sm text-base-200 font-medium ml-2">{formatWeekRange(weekStart)}</span>
            <button
              onClick={() => setWeekStart(startOfWeek(new Date().toISOString().slice(0, 10)))}
              className="ml-auto text-xs text-accent hover:text-accent-hover"
            >
              Jump to this week
            </button>
          </div>
          <div className="bg-base-850 border border-base-700 rounded-2xl overflow-hidden shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-base-500 border-b border-base-700">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Check In</th>
                  <th className="px-5 py-3 font-medium">Check Out</th>
                  <th className="px-5 py-3 font-medium">Work Hours</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {weekRecords.map((rec) => (
                  <tr key={rec.date} className="border-b border-base-700 last:border-0 hover:bg-base-800/60">
                    <td className="px-5 py-3 text-base-100">{formatWeekday(rec.date)} {formatShort(rec.date)}</td>
                    <td className="px-5 py-3 text-base-300">{rec.checkIn || "—"}</td>
                    <td className="px-5 py-3 text-base-300">{rec.checkOut || "—"}</td>
                    <td className="px-5 py-3 text-base-300">{workHours(rec)}</td>
                    <td className="px-5 py-3">
                      {rec.status ? (
                        <span className={`text-xs border rounded-full px-2.5 py-1 ${STATUS_BADGE[rec.status]}`}>
                          {rec.status.replace("-", " ")}
                        </span>
                      ) : (
                        <span className="text-xs text-base-500">No record</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-base-850 border border-base-700 rounded-2xl p-4 shadow-card">
      <p className="text-xs text-base-500">{label}</p>
      <p className="text-2xl font-semibold text-base-100 mt-1">{value}</p>
    </div>
  );
}
