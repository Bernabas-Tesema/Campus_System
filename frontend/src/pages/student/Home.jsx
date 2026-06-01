import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import homeImg from '../../image/home.jpg';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 md:space-y-20">
      <section className="relative overflow-hidden bg-background">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl md:h-80 md:w-80"
          aria-hidden
        />

        <div className="relative flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-6">
          <div className="w-full shrink-0 bg-background lg:w-[38%] xl:w-[34%] flex justify-center lg:justify-start lg:ml-2 xl:ml-6">
            <img
              src={homeImg}
              alt="Chef presenting a freshly prepared campus meal"
              className="w-full max-w-xs sm:max-w-sm lg:max-w-none max-h-[min(48vh,380px)] lg:max-h-[min(55vh,440px)] object-contain object-left-bottom select-none mix-blend-multiply lg:translate-x-4 xl:translate-x-6"
              draggable={false}
            />
          </div>

          <div className="w-full flex-1 text-center flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold leading-tight text-secondary sm:text-5xl lg:text-[3.25rem] max-w-2xl">
              Order Food,{' '}
              <span className="text-primary">Skip the Line</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-gray-600 mx-auto">
              Browse campus lounge menus, place your order ahead of time, and pick up with your order key.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/menu" className="btn-primary text-lg px-8 py-3 text-center">
                  Browse Menu
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-3 text-center">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn-outline text-lg px-8 py-3 text-center">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
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
