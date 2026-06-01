const VARIANTS = {
  info: 'bg-blue-50 text-blue-700',
  error: 'bg-red-50 text-error',
  success: 'bg-green-50 text-green-800',
};

export default function Alert({ variant = 'info', children, className = '' }) {
  if (!children) return null;
  return (
    <div className={`${VARIANTS[variant]} p-3 rounded-lg mb-4 text-sm ${className}`.trim()}>
      {children}
    </div>
  );
}
