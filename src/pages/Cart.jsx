import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, MapPin, Calendar, Clock, Layers } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import { IMAGE_BASE_URL } from '../services/api';
import Swal from 'sweetalert2';

const Cart = () => {
  const { items: cartItems, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const cartTotal = total();

  const handleProceedToCheckout = () => {
    if (!user) {
      Swal.fire({
        icon: 'info',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para completar tu reserva.',
        confirmButtonText: 'Ir al login',
        confirmButtonColor: '#1c1611',
      }).then((r) => {
        if (r.isConfirmed) navigate('/login');
      });
      return;
    }

    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      const slot = {
        id: firstItem.scheduleId,
        slot_date: firstItem.date,
        start_time: firstItem.time,
      };
      sessionStorage.setItem('checkout_slot', JSON.stringify(slot));
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div
        className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-24"
        style={{ backgroundColor: '#fdfaf5' }}
      >
        <ShoppingBag className="w-12 h-12 text-sand-300 mx-auto mb-6" strokeWidth={1} />
        <h1
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          className="text-4xl font-light text-sand-950 mb-3"
        >
          Tu carrito está <em className="italic">vacío</em>
        </h1>
        <p className="text-sand-400 text-sm font-light mb-10 max-w-sm">
          Aún no has añadido ninguna atracción. Explora nuestro catálogo para comenzar.
        </p>
        <Link
          to="/atracciones"
          className="inline-flex items-center gap-2 px-8 py-4 bg-sand-950 text-sand-50 text-xs font-medium tracking-[0.15em] uppercase hover:bg-sand-800 transition-all"
        >
          Explorar Catálogo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fdfaf5' }} className="min-h-screen">
      {/* Title section */}
      <div className="border-b border-sand-200 py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-ocean-600 mb-3 block">
            Reservaciones
          </span>
          <h1
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl md:text-5xl font-light text-sand-950"
          >
            Mi <em className="italic">Carrito</em>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-0">
            <AnimatePresence>
              {cartItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`flex gap-6 py-7 ${idx < cartItems.length - 1 ? 'border-b border-sand-200' : ''}`}
                >
                  {/* Item Image */}
                  <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 overflow-hidden bg-sand-100">
                    <img
                      src={
                        item.image
                          ? item.image.startsWith('http')
                            ? item.image
                            : `${IMAGE_BASE_URL}${item.image}`
                          : 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3
                        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                        className="text-lg md:text-xl font-medium text-sand-950"
                      >
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.attractionId, item.scheduleId)}
                        className="text-sand-300 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Eliminar de la reserva"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Location */}
                    {item.ciudadNombre && (
                      <div className="flex items-center gap-1 text-xs text-sand-500 mb-2">
                        <MapPin className="w-3 h-3" />
                        {item.ciudadNombre}
                      </div>
                    )}

                    {/* Slot reservation details */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-sand-600 mb-4 bg-sand-50/50 p-2 border border-sand-200/50">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sand-400" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sand-400" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-sand-400" />
                        <span className="capitalize">
                          {item.modalidad === 'private' ? 'Privado' : 'Compartido'}
                        </span>
                      </div>
                    </div>

                    {/* Actions and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-sand-300">
                        <button
                          onClick={() => updateQuantity(item.attractionId, item.scheduleId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm text-sand-950 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.attractionId, item.scheduleId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div
                        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                        className="text-xl font-semibold text-sand-950"
                      >
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <button
              onClick={clearCart}
              className="mt-6 text-xs text-sand-400 hover:text-red-500 tracking-wider uppercase transition-colors"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-1">
            <div className="border border-sand-200 p-8 sticky top-32 bg-white">
              <h2
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                className="text-2xl font-medium text-sand-950 mb-8"
              >
                Resumen del pedido
              </h2>

              <div className="space-y-4 mb-8 text-sm">
                <div className="flex justify-between text-sand-600 font-light">
                  <span>Subtotal ({cartItems.length} ítems)</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sand-600 font-light">
                  <span>Impuestos (8%)</span>
                  <span>Incluido</span>
                </div>
                <div className="border-t border-sand-200 pt-4 flex justify-between font-medium text-sand-950">
                  <span>Total</span>
                  <span
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    className="text-2xl font-semibold"
                  >
                    ${cartTotal.toFixed(2)} USD
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={loading}
                className="w-full py-4 bg-sand-950 text-sand-50 text-xs font-medium tracking-[0.15em] uppercase hover:bg-sand-800 transition-all flex items-center justify-center gap-2 mb-4 shadow-xl shadow-sand-900/10"
              >
                {loading ? 'Procesando...' : 'Proceder al Pago'} <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/atracciones"
                className="w-full block text-center text-xs font-medium tracking-[0.12em] uppercase text-sand-400 hover:text-sand-800 transition-colors py-2"
              >
                ← Continuar Explorando
              </Link>

              {!user && (
                <p className="mt-6 text-xs text-sand-400 text-center font-light border-t border-sand-200 pt-4">
                  Debes{' '}
                  <Link to="/login" className="underline text-ocean-600 hover:text-ocean-700">
                    iniciar sesión
                  </Link>{' '}
                  para completar tu pedido.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
