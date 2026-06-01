export default function AuthLayout({ children, className = '' }) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-background ${className}`.trim()}>
      <div className="card w-full max-w-md">{children}</div>
    </div>
  );
}
