import IconInput from './IconInput';

export default function PasswordField({
  label = 'Password',
  value,
  onChange,
  showPassword,
  onShowPasswordChange,
  showToggle = true,
  forgotLink,
  name,
  required = true,
}) {
  return (
    <div>
      <IconInput
        icon="lock"
        label={label}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        name={name}
        required={required}
      />
      {showToggle && (
        <label className="inline-flex items-center gap-2 mt-2 text-sm text-gray-600 select-none">
          <input
            type="checkbox"
            className="accent-primary"
            checked={showPassword}
            onChange={(e) => onShowPasswordChange(e.target.checked)}
          />
          Show password
        </label>
      )}
      {forgotLink}
    </div>
  );
}
