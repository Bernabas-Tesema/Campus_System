import { useState } from 'react';
import { authAPI, AuthLayout, ForgotPasswordForm } from '../../modules/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await authAPI.passwordReset({ email });
      setMessage('If an account exists for that email, instructions to reset your password have been sent.');
    } catch {
      setError('Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <ForgotPasswordForm
        email={email}
        onEmailChange={setEmail}
        message={message}
        error={error}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
