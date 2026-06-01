import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clearAuthStorage } from '../../utils/userStorage';
import { AuthLayout, AuthHeader, RegisterForm } from '../../modules/auth';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    lounge_name: '',
    lounge_location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      if (form.role === 'lounge') {
        payload.lounge_name = form.lounge_name;
        payload.lounge_location = form.lounge_location;
      }
      const user = await register(payload);
      if (user.role === 'lounge') {
        clearAuthStorage();
        setUser(null);
        navigate('/login', {
          state: { notice: 'Your lounge account was created. Please wait until an admin verifies/activates your lounge, then login.' },
        });
        return;
      }
      if (user.role === 'admin') navigate('/admin');
      else navigate('/menu');
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.username?.[0]
        || data?.email?.[0]
        || data?.role?.[0]
        || data?.lounge_location?.[0]
        || data?.lounge_name?.[0]
        || data?.detail
        || 'Registration failed.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout className="py-8">
      <AuthHeader title="Campus Eat" subtitle="Create your account" />
      <RegisterForm
        form={form}
        onChange={handleChange}
        showPassword={showPassword}
        onShowPasswordChange={setShowPassword}
        error={error}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
