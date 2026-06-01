import { Link } from 'react-router-dom';
import { Alert, IconInput, PasswordField } from '../../../components/ui';

export default function LoginForm({
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  showPassword,
  onShowPasswordChange,
  notice,
  error,
  loading,
  onSubmit,
}) {
  return (
    <>
      {notice && <Alert variant="info">{notice}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}
      <form onSubmit={onSubmit} className="space-y-4">
        <IconInput
          icon="user"
          label="Username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          required
        />
        <PasswordField
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          showPassword={showPassword}
          onShowPasswordChange={onShowPasswordChange}
          forgotLink={(
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className="text-sm text-primary">Forgot password?</Link>
            </div>
          )}
        />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account? <Link to="/register" className="text-primary font-medium">Register</Link>
      </p>
    </>
  );
}
