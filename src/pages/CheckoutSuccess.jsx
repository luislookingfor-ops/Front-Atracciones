import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Calendar, Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutSuccess = () => {
  const location = useLocation();
  const { localizador, total } = location.state || {};

  if (!localizador) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ backgroundColor: '#fdfaf5' }} className="min-h-screen py-24 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white border border-sand-200 p-12 text-center shadow-2xl relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ocean-500 via-sand-900 to-ocean-500"></div>
        
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 animate-bounce">
            <CheckCircle className="w-10 h-10" />
          </div>
        </div>

        <h1 
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
          className="text-5xl font-light text-sand-950 mb-4"
        >
          ¡Reserva <em className="italic">Confirmada!</em>
        </h1>
        
        <p className="text-sand-500 font-light mb-10">
          Gracias por elegir Tidescape. Tu aventura de lujo está lista para comenzar.
        </p>

        <div className="bg-sand-50 border border-sand-100 p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-widest text-sand-400 font-bold block mb-1">Localizador de Orden</span>
            <span className="text-2xl font-mono font-bold text-ocean-700 tracking-tighter">{localizador}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-sand-400 font-bold block mb-1">Monto Pagado</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-3xl font-semibold text-sand-950">${total?.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <button className="flex items-center justify-center gap-3 px-6 py-4 border border-sand-200 text-xs font-bold uppercase tracking-widest text-sand-600 hover:bg-sand-50 transition-all">
            <Download className="w-4 h-4" /> Descargar Voucher
          </button>
          <button className="flex items-center justify-center gap-3 px-6 py-4 border border-sand-200 text-xs font-bold uppercase tracking-widest text-sand-600 hover:bg-sand-50 transition-all">
            <Share2 className="w-4 h-4" /> Compartir
          </button>
        </div>

        <div className="space-y-4">
          <Link 
            to="/"
            className="block w-full py-5 bg-sand-950 text-sand-50 text-xs font-bold uppercase tracking-[0.2em] hover:bg-sand-800 transition-all shadow-lg shadow-sand-900/20"
          >
            Volver al Inicio
          </Link>
          <Link 
            to="/perfil"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sand-400 hover:text-ocean-600 transition-colors"
          >
            Ver mis Reservas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-sand-100 text-[10px] text-sand-400 uppercase tracking-widest font-medium">
          Se ha enviado una confirmación detallada a su correo electrónico.
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;
