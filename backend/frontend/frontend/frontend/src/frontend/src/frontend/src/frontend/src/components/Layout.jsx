import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Layout({ children, links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  function handleLogout() {
    logout();
    navigate('/login');
  }
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Dayflow</h2>
        <p>{user?.name} ({user?.role})</p>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn-secondary" style={{ marginTop: 24, width: '100%' }} onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
