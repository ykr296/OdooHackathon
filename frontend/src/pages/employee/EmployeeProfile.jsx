import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import Layout from '../../components/Layout';
const links = [
  { to: '/employee/dashboard', label: 'Dashboard' },
  { to: '/employee/profile', label: 'Profile' },
  { to: '/employee/attendance', label: 'Attendance' },
  { to: '/employee/leave', label: 'Leave Requests' },
];
export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    api('/profile/me').then((data) => {
      setProfile(data);
      setPhone(data.phone);
      setAddress(data.address);
    }).catch((err) => setError(err.message));
  }, []);
  async function handleSave(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const updated = await api('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({ phone, address }),
      });
      setProfile(updated);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  }
  if (!profile) return <Layout links={links}><p>Loading...</p></Layout>;
  return (
    <Layout links={links}>
      <h1 style={{ marginBottom: 24 }}>My Profile</h1>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Personal Details</h3>
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Employee ID:</strong> {profile.employee_id}</p>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Job Details</h3>
        <p><strong>Job Title:</strong> {profile.job_title}</p>
        <p><strong>Department:</strong> {profile.department}</p>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Salary (Read-only)</h3>
        <p style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>
          ₹ {profile.salary.toLocaleString()} / year
        </p>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Edit Contact Info</h3>
        <form onSubmit={handleSave}>
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label>Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
          <button className="btn-primary" type="submit">Save Changes</button>
        </form>
      </div>
    </Layout>
  );
}
