import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { TopNav } from "./components/TopNav";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import EmployeesGrid from "./pages/EmployeesGrid";
import Profile from "./pages/Profile";
import Attendance from "./pages/Attendance";
import TimeOff from "./pages/TimeOff";

// Simple fade+slide transition on route change — keyed by pathname so React
// remounts (and therefore re-animates) the page content on every navigation.
function PageTransition({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-base-950">
      <TopNav />
      <PageTransition>{children}</PageTransition>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, booting } = useApp();
  if (booting) {
    return <div className="min-h-screen bg-base-950 flex items-center justify-center text-base-400 text-sm">Loading Dayflow…</div>;
  }
  if (!isAuthenticated) return <Navigate to="/sign-in" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, booting } = useApp();
  if (booting) {
    return <div className="min-h-screen bg-base-950 flex items-center justify-center text-base-400 text-sm">Loading Dayflow…</div>;
  }
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;
  return <PageTransition>{children}</PageTransition>;
}

function RootRedirect() {
  const { isAuthenticated, booting } = useApp();
  if (booting) {
    return <div className="min-h-screen bg-base-950 flex items-center justify-center text-base-400 text-sm">Loading Dayflow…</div>;
  }
  return <Navigate to={isAuthenticated ? "/app/dashboard" : "/sign-in"} replace />;
}

function Routed() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/sign-in" element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
      <Route path="/sign-up" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
      <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/app/employees" element={<ProtectedRoute><EmployeesGrid /></ProtectedRoute>} />
      <Route path="/app/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/app/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/app/time-off" element={<ProtectedRoute><TimeOff /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Routed />
    </AppProvider>
  );
}
