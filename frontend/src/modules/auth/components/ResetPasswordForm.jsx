import { Alert } from '../../../components/ui';

export default function ResetPasswordForm({
  uid,
  onUidChange,
  token,
  onTokenChange,
  password,
  onPasswordChange,
  confirm,
  onConfirmChange,
  message,
  error,
  loading,
  onSubmit,
}) {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Reset password</h1>
      <p className="text-sm text-gray-500 mb-4">Enter a new password for your account.</p>
      {message && <Alert variant="success" className="rounded">{message}</Alert>}
      {error && <Alert variant="error" className="rounded">{error}</Alert>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">UID (from link)</label>
          <input className="input w-full" value={uid} onChange={(e) => onUidChange(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-500">Token (from link)</label>
          <input className="input w-full" value={token} onChange={(e) => onTokenChange(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-500">New password</label>
          <input
            type="password"
            className="input w-full"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Confirm password</label>
          <input
            type="password"
            className="input w-full"
            value={confirm}
            onChange={(e) => onConfirmChange(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Reset password'}
        </button>
      </form>
    </>
  );
}
