import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login({ email, password });
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Credenciales incorrectas. Intente de nuevo.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#fdfaf5' }}>
      {/* Left panel — image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=85"
          alt="Travel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-sand-950/40" />
        <div className="absolute bottom-12 left-12 right-12">
          <blockquote
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-3xl font-light italic text-white leading-snug"
          >
            "El viaje es la única cosa que compras que te hace más rico."
          </blockquote>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-12">
            <Link
              to="/"
              className="text-xs tracking-[0.2em] uppercase text-sand-500 hover:text-ocean-600 transition-colors"
            >
              ← Volver al inicio
            </Link>
            <h1
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-4xl md:text-5xl font-light text-sand-950 mt-6 mb-2"
            >
              Bienvenido de <em className="italic">regreso</em>
            </h1>
            <p className="text-sand-500 text-sm font-light">
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-sand-600 block mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full border-b border-sand-300 bg-transparent py-3 text-sand-950 placeholder-sand-400 focus:outline-none focus:border-sand-950 transition-colors text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-sand-600 block mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border-b border-sand-300 bg-transparent py-3 pr-10 text-sand-950 placeholder-sand-400 focus:outline-none focus:border-sand-950 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-sand-400 hover:text-sand-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                id="btn-login-submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-4 bg-sand-950 text-sand-50 text-xs font-medium tracking-[0.15em] uppercase hover:bg-sand-800 transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-sand-400 border-t-sand-50 rounded-full animate-spin" />
                ) : (
                  <>Iniciar Sesión <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          {/* Footer link */}
          <p className="mt-8 text-center text-sm text-sand-500 font-light">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-ocean-600 hover:text-ocean-700 underline underline-offset-2">
              Regístrate aquí
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
