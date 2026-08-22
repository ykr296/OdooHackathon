import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Dayflow HRMS</h1>
        <p className="subtitle">Every workday, perfectly aligned.</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn-primary" style={{ width: '100%' }} type="submit">Sign In</button>
        </form>
        <p className="switch-link">No account? <Link to="/signup">Sign Up</Link></p>
        <div className="demo-accounts">
          <strong>Demo accounts for hackathon:</strong>
          Admin: admin@dayflow.com / admin123<br />
          Employee: emp1@dayflow.com / emp123
        </div>
      </div>
    </div>
  );
}
