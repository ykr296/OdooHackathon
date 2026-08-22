import { useMemo, useState } from "react";
import { Check, X, Plus, Paperclip, MessageSquare } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Avatar } from "../components/Avatar";
import { Modal } from "../components/Modal";

const TYPE_LABEL = { paid: "Paid Time Off", sick: "Sick Leave", unpaid: "Unpaid Leave" };
const STATUS_BADGE = {
  pending: "bg-warn/15 text-warn border-warn/30",
  approved: "bg-good/15 text-good border-good/30",
  rejected: "bg-bad/15 text-bad border-bad/30",
};

function fmt(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TimeOff() {
  const { currentUser } = useApp();
  return currentUser.role === "admin" ? <AdminTimeOff /> : <SelfTimeOff />;
}

function AdminTimeOff() {
  const { users, timeOffRequests, timeOffAllocations, decideTimeOff } = useApp();
  const [tab, setTab] = useState("requests");
  const [query, setQuery] = useState("");
  const [decisionTarget, setDecisionTarget] = useState(null); // { id, decision }

  const userById = Object.fromEntries(users.map((u) => [u.id, u]));
  const rows = timeOffRequests
    .filter((r) => {
      const name = userById[r.employeeId] ? `${userById[r.employeeId].firstName} ${userById[r.employeeId].lastName}` : "";
      return name.toLowerCase().includes(query.toLowerCase());
    })
    .sort((a, b) => (a.status === "pending" ? -1 : 1));

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-base-100">Time Off</h1>
          <p className="text-sm text-base-400 mt-0.5">Review and manage everyone's time off.</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people…"
          className="bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm w-56 placeholder:text-base-500 focus-ring focus:border-accent"
        />
      </div>

      <div className="flex gap-1 bg-base-850 border border-base-700 rounded-lg p-1 w-fit mb-4">
        {["requests", "allocation"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-accent/15 text-accent" : "text-base-400 hover:text-base-100"
            }`}
          >
            {t === "requests" ? "Time Off" : "Allocation"}
          </button>
        ))}
      </div>

      {tab === "requests" ? (
        <div className="bg-base-850 border border-base-700 rounded-2xl overflow-hidden shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-base-500 border-b border-base-700">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Start</th>
                <th className="px-5 py-3 font-medium">End</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const u = userById[r.employeeId];
                if (!u) return null;
                return (
                  <tr key={r.id} className="border-b border-base-700 last:border-0 hover:bg-base-800/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar user={u} size={28} />
                        <span className="text-base-100">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-base-300">{fmt(r.startDate)}</td>
                    <td className="px-5 py-3 text-base-300">{fmt(r.endDate)}</td>
                    <td className="px-5 py-3 text-base-300">{TYPE_LABEL[r.type]}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs border rounded-full px-2.5 py-1 capitalize ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      {r.status === "pending" ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setDecisionTarget({ id: r.id, decision: "approved" })}
                            className="p-1.5 rounded-lg bg-good/15 text-good border border-good/30 hover:bg-good/25 focus-ring"
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setDecisionTarget({ id: r.id, decision: "rejected" })}
                            className="p-1.5 rounded-lg bg-bad/15 text-bad border border-bad/30 hover:bg-bad/25 focus-ring"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : r.adminComment ? (
                        <p className="text-right text-xs text-base-500 flex items-center justify-end gap-1">
                          <MessageSquare size={11} /> {r.adminComment}
                        </p>
                      ) : (
                        <p className="text-right text-xs text-base-500">No action needed</p>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-base-500">No requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-base-850 border border-base-700 rounded-2xl overflow-hidden shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-base-500 border-b border-base-700">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Paid Time Off</th>
                <th className="px-5 py-3 font-medium">Sick Leave</th>
                <th className="px-5 py-3 font-medium">Unpaid taken</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(query.toLowerCase()))
                .map((u) => {
                  const alloc = timeOffAllocations[u.id];
                  if (!alloc) return null;
                  return (
                    <tr key={u.id} className="border-b border-base-700 last:border-0 hover:bg-base-800/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={u} size={28} />
                          <span className="text-base-100">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-base-300">{alloc.paid.total - alloc.paid.used} / {alloc.paid.total} days left</td>
                      <td className="px-5 py-3 text-base-300">{alloc.sick.total - alloc.sick.used} / {alloc.sick.total} days left</td>
                      <td className="px-5 py-3 text-base-300">{alloc.unpaid.used} days</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {decisionTarget && (
        <DecisionModal
          decision={decisionTarget.decision}
          onClose={() => setDecisionTarget(null)}
          onConfirm={(comment) => {
            decideTimeOff(decisionTarget.id, decisionTarget.decision, comment);
            setDecisionTarget(null);
          }}
        />
      )}
    </div>
  );
}

function DecisionModal({ decision, onClose, onConfirm }) {
  const [comment, setComment] = useState("");
  const approving = decision === "approved";
  return (
    <Modal title={approving ? "Approve request" : "Reject request"} onClose={onClose} width={420}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-base-300 mb-1.5">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder={approving ? "Add a note for the employee…" : "Let them know why…"}
            className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus-ring focus:border-accent resize-none"
          />
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 text-sm text-base-300 border border-base-700 rounded-lg py-2.5 hover:border-base-600 focus-ring"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(comment)}
            className={`flex-1 text-sm font-semibold rounded-lg py-2.5 focus-ring text-white ${
              approving ? "bg-good hover:bg-good/90" : "bg-bad hover:bg-bad/90"
            }`}
          >
            {approving ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function SelfTimeOff() {
  const { currentUser, timeOffAllocations, timeOffRequests, applyTimeOff } = useApp();
  const [showRequest, setShowRequest] = useState(false);
  const alloc = timeOffAllocations[currentUser.id] || { paid: { total: 0, used: 0 }, sick: { total: 0, used: 0 }, unpaid: { used: 0 } };
  const myRequests = timeOffRequests
    .filter((r) => r.employeeId === currentUser.id)
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-base-100">Time Off</h1>
          <p className="text-sm text-base-400 mt-0.5">Your balances and requests.</p>
        </div>
        <button
          onClick={() => setShowRequest(true)}
          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg px-3.5 py-2 transition-colors focus-ring"
        >
          <Plus size={16} /> New request
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <BalanceCard label="Paid Time Off" total={alloc.paid.total} used={alloc.paid.used} color="#3ECF8E" />
        <BalanceCard label="Sick Leave" total={alloc.sick.total} used={alloc.sick.used} color="#3EA6CF" />
        <div className="bg-base-850 border border-base-700 rounded-2xl p-4 shadow-card">
          <p className="text-xs text-base-500">Unpaid leave taken</p>
          <p className="text-2xl font-semibold text-base-100 mt-1">{alloc.unpaid.used} days</p>
        </div>
      </div>

      <div className="bg-base-850 border border-base-700 rounded-2xl overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-base-500 border-b border-base-700">
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Start</th>
              <th className="px-5 py-3 font-medium">End</th>
              <th className="px-5 py-3 font-medium">Days</th>
              <th className="px-5 py-3 font-medium">Remarks</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">HR comment</th>
            </tr>
          </thead>
          <tbody>
            {myRequests.map((r) => (
              <tr key={r.id} className="border-b border-base-700 last:border-0 hover:bg-base-800/60">
                <td className="px-5 py-3 text-base-100">{TYPE_LABEL[r.type]}</td>
                <td className="px-5 py-3 text-base-300">{fmt(r.startDate)}</td>
                <td className="px-5 py-3 text-base-300">{fmt(r.endDate)}</td>
                <td className="px-5 py-3 text-base-300">{r.days}</td>
                <td className="px-5 py-3 text-base-400 max-w-xs truncate">{r.remarks || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs border rounded-full px-2.5 py-1 capitalize ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-5 py-3 text-base-400 max-w-xs truncate">{r.adminComment || "—"}</td>
              </tr>
            ))}
            {myRequests.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-base-500">No requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showRequest && <RequestModal onClose={() => setShowRequest(false)} onSubmit={applyTimeOff} employeeId={currentUser.id} />}
    </div>
  );
}

function BalanceCard({ label, total, used, color }) {
  const remaining = total - used;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  return (
    <div className="bg-base-850 border border-base-700 rounded-2xl p-4 shadow-card">
      <p className="text-xs text-base-500">{label}</p>
      <p className="text-2xl font-semibold text-base-100 mt-1">{remaining} <span className="text-sm text-base-400 font-normal">days available</span></p>
      <div className="h-1.5 rounded-full bg-base-700 mt-3 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-xs text-base-500 mt-1.5">{used} of {total} used</p>
    </div>
  );
}

function diffDays(a, b) {
  const ms = new Date(b) - new Date(a);
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

function RequestModal({ onClose, onSubmit, employeeId }) {
  const [type, setType] = useState("paid");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState(null);

  const days = diffDays(startDate, endDate);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ employeeId, type, startDate, endDate, days, remarks, attachment: attachment?.name || null });
    onClose();
  }

  return (
    <Modal title="Request time off" onClose={onClose} width={460}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-base-300 mb-1.5">Time off type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus-ring focus:border-accent"
          >
            <option value="paid">Paid Time Off</option>
            <option value="sick">Sick Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-base-300 mb-1.5">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus-ring focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-base-300 mb-1.5">To</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus-ring focus:border-accent"
            />
          </div>
        </div>
        <p className="text-xs text-base-500 -mt-2">{days} day{days > 1 ? "s" : ""} requested</p>
        <div>
          <label className="block text-xs font-medium text-base-300 mb-1.5">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            placeholder="What's this for?"
            className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus-ring focus:border-accent resize-none"
          />
        </div>
        {type === "sick" && (
          <div>
            <label className="block text-xs font-medium text-base-300 mb-1.5">Sick note (optional)</label>
            <label className="flex items-center gap-2 text-sm text-base-300 border border-dashed border-base-600 rounded-lg px-3 py-2.5 cursor-pointer hover:border-accent/50">
              <Paperclip size={14} />
              {attachment ? attachment.name : "Attach a file"}
              <input type="file" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
            </label>
          </div>
        )}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 text-sm text-base-300 border border-base-700 rounded-lg py-2.5 hover:border-base-600 focus-ring"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg py-2.5 focus-ring"
          >
            Submit request
          </button>
        </div>
      </form>
    </Modal>
  );
}
