import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Home from '../../pages/student/Home';

export default function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Home />;
  if (user.role === 'lounge') return <Navigate to="/lounge/orders" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <Home />;
}
