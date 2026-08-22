import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employee_id: '',
    name: '',
    email: '',
    password: '',
    role: 'employee',
  });
  const [error, setError] = useState('');
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await signup(form);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Create Account</h1>
        <p className="subtitle">Join Dayflow HRMS</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Employee ID</label>
          <input value={form.employee_id} onChange={(e) => update('employee_id', e.target.value)} required />
          <label>Full Name</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
          <label>Role</label>
          <select value={form.role} onChange={(e) => update('role', e.target.value)}>
            <option value="employee">Employee</option>
            <option value="admin">Admin / HR</option>
          </select>
          <button className="btn-primary" style={{ width: '100%' }} type="submit">Sign Up</button>
        </form>
        <p className="switch-link">Already have account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
