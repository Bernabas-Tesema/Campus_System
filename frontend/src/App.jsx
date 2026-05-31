import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/student/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/student/Menu';
import Cart from './pages/student/Cart';
import Orders from './pages/student/Orders';
import Profile from './pages/student/Profile';
import LoungeOrders from './pages/lounge/LoungeOrders';
import LoungeFoods from './pages/lounge/LoungeFoods';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLounges from './pages/admin/AdminLounges';
import AdminReports from './pages/admin/AdminReports';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Home />;
  if (user.role === 'lounge') return <Navigate to="/lounge/orders" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <Home />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/menu" element={<ProtectedRoute roles={['student']}><Menu /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute roles={['student']}><Cart /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['student']}><Orders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/lounge/orders" element={<ProtectedRoute roles={['lounge']}><LoungeOrders /></ProtectedRoute>} />
        <Route path="/lounge/foods" element={<ProtectedRoute roles={['lounge']}><LoungeFoods /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/lounges" element={<ProtectedRoute roles={['admin']}><AdminLounges /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
