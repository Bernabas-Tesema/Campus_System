import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/orders', label: 'Orders' },
    { to: '/profile', label: 'Profile' },
  ];

  const loungeLinks = [
    { to: '/lounge/orders', label: 'Orders' },
    { to: '/lounge/foods', label: 'Food Management' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/lounges', label: 'Lounges' },
    { to: '/admin/reports', label: 'Reports' },
  ];

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'lounge' ? loungeLinks
    : user ? studentLinks : [{ to: '/', label: 'Home' }];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-secondary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <span className="text-xl font-bold text-primary">Campus Eat</span>
            </Link>
            <div className="flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.to ? 'text-primary' : 'text-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === 'student' && (
                <button
                  type="button"
                  className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => {
                    navigate('/cart');
                    setTimeout(() => {
                      if (window.location.pathname !== '/cart') {
                        window.location.assign('/cart');
                      }
                    }, 0);
                  }}
                  aria-label="Cart"
                  title="Cart"
                >
                  <span className="text-xl">🛒</span>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              )}
              {user ? (
                <button onClick={handleLogout} className="text-sm text-gray-300 hover:text-white">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-1.5 px-3">Login</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-secondary text-gray-400 text-center py-4 text-sm">
        Campus Eat &copy; {new Date().getFullYear()} — Order food before you arrive
      </footer>
    </div>
  );
}
