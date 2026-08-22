import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Copy, Check } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Avatar, StatusDot } from "../components/Avatar";
import { Modal } from "../components/Modal";
import { getLiveStatus } from "../data/mockData";

const emptyForm = {
  firstName: "", lastName: "", email: "", phone: "", department: "", designation: "",
  manager: "", dateOfJoining: new Date().toISOString().slice(0, 10), role: "employee", monthWage: "",
};

export default function EmployeesGrid() {
  const { users, currentUser, addEmployee, attendance, timeOffRequests } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newCreds, setNewCreds] = useState(null);
  const [copied, setCopied] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      u.designation?.toLowerCase().includes(q)
    );
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    const creds = await addEmployee(form);
    setForm(emptyForm);
    setNewCreds(creds);
  }

  function closeAddFlow() {
    setShowAdd(false);
    setNewCreds(null);
    setCopied(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-base-100">Employees</h1>
          <p className="text-sm text-base-400 mt-0.5">{users.length} people at your company</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people…"
              className="bg-base-850 border border-base-700 rounded-lg pl-8 pr-3 py-2 text-sm w-56 placeholder:text-base-500 focus-ring focus:border-accent"
            />
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg px-3.5 py-2 transition-colors focus-ring"
            >
              <Plus size={16} /> New
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((u) => {
          const canOpen = isAdmin || String(u.id) === String(currentUser?.id);
          return (
            <button
              key={u.id}
              onClick={() => canOpen && navigate(`/app/profile/${u.id}`)}
              aria-disabled={!canOpen}
              title={canOpen ? undefined : "Only admins can view other employees' profiles"}
              className={`text-left bg-base-850 border border-base-700 rounded-2xl p-4 shadow-card transition-colors ${
                canOpen
                  ? "hover:border-accent/50 hover:bg-base-800 focus-ring cursor-pointer"
                  : "opacity-60 cursor-default"
              }`}
            >
              <div className="flex items-start justify-between">
                <Avatar user={u} size={44} />
                <StatusDot status={getLiveStatus(u, attendance, timeOffRequests)} />
              </div>
              <p className="mt-3 font-medium text-base-100 text-sm truncate">
                {u.firstName} {u.lastName}
              </p>
              <p className="text-xs text-base-400 truncate mt-0.5">{u.designation}</p>
              <p className="text-xs text-base-500 truncate">{u.department}</p>
              {!canOpen && <p className="text-[11px] text-base-500 mt-2">Admin-only profile</p>}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-base-500 py-10 text-center">No one matches “{query}”.</p>
        )}
      </div>

      {showAdd && (
        <Modal title={newCreds ? "Employee added" : "Add employee"} onClose={closeAddFlow} width={520}>
          {newCreds ? (
            <div className="space-y-4">
              <p className="text-sm text-base-300">
                <span className="text-base-100 font-medium">{newCreds.name}</span> has been added. Share these
                sign-in details with them — they'll be asked to set a new password on first login.
              </p>
              <div className="bg-base-900 border border-base-700 rounded-xl p-4 space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-base-500">Login ID</span>
                  <span className="text-base-100">{newCreds.loginId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-500">Temp. password</span>
                  <span className="text-base-100">{newCreds.password}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`Login ID: ${newCreds.loginId}\nPassword: ${newCreds.password}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="w-full flex items-center justify-center gap-2 border border-base-700 hover:border-accent/50 text-sm text-base-200 rounded-lg py-2.5 transition-colors focus-ring"
              >
                {copied ? <Check size={15} className="text-good" /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy credentials"}
              </button>
              <button
                onClick={closeAddFlow}
                className="w-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg py-2.5 transition-colors focus-ring"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdd} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" value={form.firstName} onChange={(v) => set("firstName", v)} required />
                <Field label="Last name" value={form.lastName} onChange={(v) => set("lastName", v)} required />
              </div>
              <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} />
                <div>
                  <label className="block text-xs font-medium text-base-300 mb-1.5">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => set("role", e.target.value)}
                    className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus-ring focus:border-accent"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin / HR</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Department" value={form.department} onChange={(v) => set("department", v)} />
                <Field label="Designation" value={form.designation} onChange={(v) => set("designation", v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Manager" value={form.manager} onChange={(v) => set("manager", v)} />
                <Field
                  label="Date of joining"
                  type="date"
                  value={form.dateOfJoining}
                  onChange={(v) => set("dateOfJoining", v)}
                />
              </div>
              <Field
                label="Monthly wage (₹)"
                type="number"
                value={form.monthWage}
                onChange={(v) => set("monthWage", v)}
              />
              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg py-2.5 transition-colors focus-ring mt-1"
              >
                Add employee
              </button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block text-xs font-medium text-base-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus-ring focus:border-accent"
      />
    </div>
  );
}
