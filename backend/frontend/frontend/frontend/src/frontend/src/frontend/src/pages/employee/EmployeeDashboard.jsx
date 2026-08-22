mport { useEffect, useState } from 'react';
import { api } from '../../api/client';
import Layout from '../../components/Layout';
const links = [
  { to: '/employee/dashboard', label: 'Dashboard' },
  { to: '/employee/profile', label: 'Profile' },
  { to: '/employee/attendance', label: 'Attendance' },
  { to: '/employee/leave', label: 'Leave Requests' },
];
export default function EmployeeAttendance() {
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function load() {
    const data = await api('/attendance/me');
    setRecords(data);
  }
  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);
  async function checkIn() {
    setMessage('');
    setError('');
    try {
      await api('/attendance/check-in', { method: 'POST' });
      setMessage('Checked in successfully!');
      load();
    } catch (err) {
      setError(err.message);
    }
  }
  async function checkOut() {
    setMessage('');
    setError('');
    try {
      await api('/attendance/check-out', { method: 'POST' });
      setMessage('Checked out successfully!');
      load();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <Layout links={links}>
      <h1 style={{ marginBottom: 24 }}>Attendance</h1>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <div className="card" style={{ display: 'flex', gap: 12 }}>
        <button className="btn-success" onClick={checkIn}>Check In</button>
        <button className="btn-danger" onClick={checkOut}>Check Out</button>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Your Records</h3>
        {records.length === 0 ? (
          <p style={{ color: '#64748b' }}>No attendance records yet. Click Check In to start!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.check_in || '-'}</td>
                  <td>{r.check_out || '-'}</td>
                  <td><span className={`badge badge-${r.status === 'present' ? 'present' : 'pending'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
