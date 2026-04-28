import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Atracciones', path: '/atracciones' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-sand-50/95 backdrop-blur-md shadow-sm border-b border-sand-200'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">

          {/* Logo — Tidescape style: uppercase serif wordmark */}
          <Link to="/" id="nav-logo" className="flex items-center">
            <span
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-2xl font-semibold tracking-[0.15em] uppercase text-sand-950"
            >
              Atracciones
            </span>
          </Link>

          {/* Desktop Nav — minimal, spaced, uppercase tiny */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                id={`nav-link-${link.name.toLowerCase()}`}
                className="text-xs font-medium tracking-[0.12em] uppercase text-sand-700 hover:text-ocean-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {user?.rol === 'Admin' && (
              <Link
                to="/admin"
                id="nav-link-admin"
                className="text-xs font-medium tracking-[0.12em] uppercase text-ocean-600 hover:text-ocean-700 transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center space-x-6">
            {/* Cart */}
            <Link to="/carrito" id="nav-cart" className="relative text-sand-700 hover:text-ocean-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-ocean-600 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth — desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sand-200 border border-sand-300">
                    <User className="w-4 h-4 text-sand-700" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium text-sand-800 leading-none">{user.nombre}</span>
                    <button
                      onClick={handleLogout}
                      id="btn-logout-desktop"
                      className="text-[10px] text-sand-500 hover:text-red-500 transition-colors flex items-center mt-0.5"
                    >
                      <LogOut className="w-3 h-3 mr-1" /> Salir
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  id="btn-login-desktop"
                  className="text-xs font-medium tracking-[0.1em] uppercase px-5 py-2.5 border border-sand-950 text-sand-950 hover:bg-sand-950 hover:text-sand-50 transition-all duration-200"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              id="btn-mobile-menu"
              className="md:hidden text-sand-700"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-sand-50 border-b border-sand-200 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-xs font-medium tracking-[0.12em] uppercase text-sand-700 hover:text-ocean-600 py-2"
                >
                  {link.name}
                </Link>
              ))}
              {user?.rol === 'Admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-xs font-medium tracking-[0.12em] uppercase text-ocean-600 hover:text-ocean-700 py-2"
                >
                  Admin
                </Link>
              )}
              <div className="pt-4 border-t border-sand-200">
                {user ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-sand-800">{user.nombre}</p>
                    <button
                      onClick={handleLogout}
                      className="flex items-center text-xs text-red-500 font-medium uppercase tracking-wider"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center text-xs font-medium tracking-[0.1em] uppercase px-5 py-3 border border-sand-950 text-sand-950"
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
