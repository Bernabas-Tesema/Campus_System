import { Link } from 'react-router-dom';
import { Alert, IconInput, PasswordField } from '../../../components/ui';

export default function RegisterForm({
  form,
  onChange,
  showPassword,
  onShowPasswordChange,
  error,
  loading,
  onSubmit,
}) {
  return (
    <>
      {error && <Alert variant="error">{error}</Alert>}
      <form onSubmit={onSubmit} className="space-y-4">
        <IconInput
          icon="user"
          label="Username"
          name="username"
          value={form.username}
          onChange={onChange}
          required
        />
        <IconInput
          icon="email"
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
        />
        <PasswordField
          name="password"
          value={form.password}
          onChange={onChange}
          showPassword={showPassword}
          onShowPasswordChange={onShowPasswordChange}
        />
        <div>
          <label className="block text-sm font-medium mb-1">Account Type</label>
          <select className="input" name="role" value={form.role} onChange={onChange}>
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
                onChange={onChange}
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
                onChange={onChange}
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
    </>
  );
}
