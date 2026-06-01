export default function AuthHeader({ emoji = '🍽️', title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <span className="text-4xl">{emoji}</span>
      <h1 className="text-2xl font-bold mt-2">{title}</h1>
      {subtitle && <p className="text-gray-500">{subtitle}</p>}
    </div>
  );
}
