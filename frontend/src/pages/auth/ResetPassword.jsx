import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI, AuthLayout, ResetPasswordForm } from '../../modules/auth';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const query = useQuery();
  const navigate = useNavigate();
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const qUid = query.get('uid') || query.get('u');
    const qToken = query.get('token') || query.get('t');
    if (qUid) setUid(qUid);
    if (qToken) setToken(qToken);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await authAPI.passwordResetConfirm({ uid, token, new_password: password });
      setMessage('Password successfully reset. You can now log in.');
      setTimeout(() => navigate('/login', { state: { notice: 'Password reset successful. Please login.' } }), 1500);
    } catch {
      setError('Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <ResetPasswordForm
        uid={uid}
        onUidChange={setUid}
        token={token}
        onTokenChange={setToken}
        password={password}
        onPasswordChange={setPassword}
        confirm={confirm}
        onConfirmChange={setConfirm}
        message={message}
        error={error}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
