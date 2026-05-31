import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        localStorage.clear();
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
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.role?.[0] ||
        data?.lounge_location?.[0] ||
        data?.lounge_name?.[0] ||
        data?.detail ||
        'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-8">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🍽️</span>
          <h1 className="text-2xl font-bold mt-2">Campus Eat</h1>
          <p className="text-gray-500">Create your account</p>
        </div>
        {error && <div className="bg-red-50 text-error p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <input className="input pl-10" name="username" value={form.username} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </span>
              <input className="input pl-10" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M6 10h12v10H6V10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                className="input pl-10"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <label className="inline-flex items-center gap-2 mt-2 text-sm text-gray-600 select-none">
              <input
                type="checkbox"
                className="accent-primary"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show password
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Account Type</label>
            <select className="input" name="role" value={form.role} onChange={handleChange}>
              <option value="student">User (Customer)</option>
              <option value="lounge">Lounge</option>
            </select>
            {form.role === 'lounge' && (
              <p className="text-xs text-gray-500 mt-1">
                Lounge accounts will be assigned/activated by an admin.
              </p>
            )}
          </div>

          {form.role === 'lounge' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Lounge Name</label>
                <input
                  className="input"
                  name="lounge_name"
                  value={form.lounge_name}
                  onChange={handleChange}
                  placeholder="Your lounge name"
                />
                <p className="text-xs text-gray-500 mt-1">If left empty, your username will be used.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  className="input"
                  name="lounge_location"
                  value={form.lounge_location}
                  onChange={handleChange}
                  placeholder="e.g. Building A, Floor 1"
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-primary font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}
