import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleRedirect from './components/routing/RoleRedirect';
import Home from './pages/student/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Menu from './pages/student/Menu';
import Cart from './pages/student/Cart';
import Orders from './pages/student/Orders';
import Profile from './pages/student/Profile';
import FoodDetail from './pages/student/FoodDetail';
import LoungeProfile from './pages/lounge/LoungeProfile';
import LoungeOrders from './pages/lounge/LoungeOrders';
import LoungeFoods from './pages/lounge/LoungeFoods';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLounges from './pages/admin/AdminLounges';
import AdminReports from './pages/admin/AdminReports';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/menu" element={<ProtectedRoute roles={['student']}><Menu /></ProtectedRoute>} />
        <Route path="/foods/:id" element={<ProtectedRoute roles={['student']}><FoodDetail /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute roles={['student']}><Cart /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['student']}><Orders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/lounge/orders" element={<ProtectedRoute roles={['lounge']}><LoungeOrders /></ProtectedRoute>} />
        <Route path="/lounge/foods" element={<ProtectedRoute roles={['lounge']}><LoungeFoods /></ProtectedRoute>} />
        <Route path="/lounge/profile" element={<ProtectedRoute roles={['lounge']}><LoungeProfile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/lounges" element={<ProtectedRoute roles={['admin']}><AdminLounges /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
