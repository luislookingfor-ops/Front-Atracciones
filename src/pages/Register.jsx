import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const inputClass = "w-full border-b border-sand-300 bg-transparent py-3 text-sand-950 placeholder-sand-400 focus:outline-none focus:border-sand-950 transition-colors text-sm";
const labelClass = "text-[10px] tracking-[0.2em] uppercase text-sand-600 block mb-2";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setIsSubmitting(true);
    const result = await register(formData);
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.message || 'Error al registrarse. Intente de nuevo.');
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#fdfaf5' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center py-20"
        >
          <CheckCircle className="w-12 h-12 text-ocean-600 mx-auto mb-6" />
          <h2
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl font-light text-sand-950 mb-4"
          >
            ¡Registro exitoso!
          </h2>
          <p className="text-sand-500 text-sm font-light mb-8">
            Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...
          </p>
          <div className="w-full h-[2px] bg-sand-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
              className="h-full bg-ocean-600"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#fdfaf5' }}>

      {/* Left panel — image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=85"
          alt="Adventure"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-sand-950/35" />
        <div className="absolute bottom-12 left-12 right-12">
          <span
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-3xl font-light italic text-white leading-snug"
          >
            "Únete a miles de viajeros que ya están descubriendo el mundo."
          </span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-10">
            <Link to="/" className="text-xs tracking-[0.2em] uppercase text-sand-500 hover:text-ocean-600 transition-colors">
              ← Volver al inicio
            </Link>
            <h1
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-4xl md:text-5xl font-light text-sand-950 mt-6 mb-2"
            >
              Únete a la <em className="italic">Aventura</em>
            </h1>
            <p className="text-sand-500 text-sm font-light">
              Crea tu cuenta para empezar a planear tus próximos viajes.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nombre</label>
                <input name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Juan" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Apellido</label>
                <input name="apellido" value={formData.apellido} onChange={handleChange} required placeholder="Pérez" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Correo electrónico</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="tu@email.com" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Contraseña</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Mínimo 8 caracteres" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Confirmar contraseña</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Repite tu contraseña" className={inputClass} />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="btn-register-submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-4 bg-sand-950 text-sand-50 text-xs font-medium tracking-[0.15em] uppercase hover:bg-sand-800 transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-sand-400 border-t-sand-50 rounded-full animate-spin" />
                ) : (
                  <>Crear Cuenta <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-sand-500 font-light">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-ocean-600 hover:text-ocean-700 underline underline-offset-2">
              Inicia sesión aquí
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
