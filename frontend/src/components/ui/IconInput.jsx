import { UserIcon, LockIcon, EmailIcon } from './icons';

const ICONS = {
  user: UserIcon,
  lock: LockIcon,
  email: EmailIcon,
};

export default function IconInput({
  icon,
  label,
  className = 'input pl-10',
  wrapperClassName = '',
  ...inputProps
}) {
  const Icon = ICONS[icon];
  return (
    <div className={wrapperClassName}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
            <Icon />
          </span>
        )}
        <input className={className} {...inputProps} />
      </div>
    </div>
  );
}
