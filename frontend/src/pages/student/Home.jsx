import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <section className="py-10 md:py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-secondary mb-4">
            Order Food, <span className="text-primary">Skip the Line</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Browse campus lounge menus, place your order ahead of time, and pick up with your order key.
          </p>
          {user ? (
            <Link to="/menu" className="btn-primary text-lg px-8 py-3">Browse Menu</Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">Get Started</Link>
              <Link to="/login" className="btn-outline text-lg px-8 py-3">Login</Link>
            </div>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mt-8">
        {[
          { icon: '🍔', title: 'Browse Menus', desc: 'Explore food from campus lounges and cafeterias.' },
          { icon: '📱', title: 'Order Ahead', desc: 'Place your order before arriving at the lounge.' },
          { icon: '🔑', title: 'Quick Pickup', desc: 'Get your order key and skip the waiting line.' },
        ].map((f) => (
          <div key={f.title} className="card text-center">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
