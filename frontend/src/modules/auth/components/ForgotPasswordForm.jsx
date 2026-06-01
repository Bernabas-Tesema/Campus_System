import { Alert } from '../../../components/ui';

export default function ForgotPasswordForm({
  email,
  onEmailChange,
  message,
  error,
  loading,
  onSubmit,
}) {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Forgot password</h1>
      <p className="text-sm text-gray-500 mb-4">
        Enter your email and we&apos;ll send instructions to reset your password.
      </p>
      {message && <Alert variant="success" className="rounded">{message}</Alert>}
      {error && <Alert variant="error" className="rounded">{error}</Alert>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <input
            type="email"
            className="input w-full"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </>
  );
}
