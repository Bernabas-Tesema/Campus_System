import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout, AuthHeader, LoginForm } from '../../modules/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const msg = location.state?.notice;
    if (msg) setNotice(msg);
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'lounge') {
        const lounges = Array.isArray(user.managed_lounges) ? user.managed_lounges : [];
        const hasActive = lounges.some((l) => l?.is_active);
        if (!hasActive) {
          await logout();
          setNotice('Please wait until your lounge is verified/activated by admin, then login again.');
          return;
        }
        navigate('/lounge/orders');
        return;
      }
      if (user.role === 'admin') navigate('/admin');
      else navigate('/menu');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader title="Welcome to Campus Eat" subtitle="Sign in to your account" />
      <LoginForm
        username={username}
        onUsernameChange={setUsername}
        password={password}
        onPasswordChange={setPassword}
        showPassword={showPassword}
        onShowPasswordChange={setShowPassword}
        notice={notice}
        error={error}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
