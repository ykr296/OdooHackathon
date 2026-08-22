import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeeLeave from './pages/employee/EmployeeLeave';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminAttendance from './pages/admin/AdminAttendance';
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/employee/dashboard" element={
            <ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>
          } />
          <Route path="/employee/profile" element={
            <ProtectedRoute role="employee"><EmployeeProfile /></ProtectedRoute>
          } />
          <Route path="/employee/attendance" element={
            <ProtectedRoute role="employee"><EmployeeAttendance /></ProtectedRoute>
          } />
          <Route path="/employee/leave" element={
            <ProtectedRoute role="employee"><EmployeeLeave /></ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/employees" element={
            <ProtectedRoute role="admin"><AdminEmployees /></ProtectedRoute>
          } />
          <Route path="/admin/leaves" element={
            <ProtectedRoute role="admin"><AdminLeaves /></ProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <ProtectedRoute role="admin"><AdminAttendance /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
