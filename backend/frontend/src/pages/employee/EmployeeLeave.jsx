mport { useEffect, useState } from 'react';
import { api } from '../../api/client';
import Layout from '../../components/Layout';
const links = [
  { to: '/employee/dashboard', label: 'Dashboard' },
  { to: '/employee/profile', label: 'Profile' },
  { to: '/employee/attendance', label: 'Attendance' },
  { to: '/employee/leave', label: 'Leave Requests' },
];
function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}
export default function EmployeeLeave() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    remarks: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function load() {
    const data = await api('/leave/me');
    setLeaves(data);
  }
  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api('/leave', { method: 'POST', body: JSON.stringify(form) });
      setMessage('Leave request submitted!');
      setForm({ leave_type: 'sick', start_date: '', end_date: '', remarks: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <Layout links={links}>
      <h1 style={{ marginBottom: 24 }}>Leave Requests</h1>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Apply for Leave</h3>
        <form onSubmit={handleSubmit}>
          <label>Leave Type</label>
          <select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })}>
            <option value="paid">Paid Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
          <label>Start Date</label>
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
          <label>End Date</label>
          <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
          <label>Remarks</label>
          <textarea rows={3} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <button className="btn-primary" type="submit">Submit Request</button>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>My Requests</h3>
        {leaves.length === 0 ? (
          <p style={{ color: '#64748b' }}>No leave requests yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Admin Comment</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td>{l.leave_type}</td>
                  <td>{l.start_date}</td>
                  <td>{l.end_date}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td>{l.admin_comment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
