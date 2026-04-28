import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api, { IMAGE_BASE_URL } from '../services/api';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    numeroTarjeta: '',
    nombre: '',
    exp: '',
    cvv: ''
  });

  const TAX_RATE = 0.08;
  const taxes = cartTotal * TAX_RATE;
  const grandTotal = cartTotal + taxes;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Por favor inicia sesión para continuar con el pago.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        usuarioId: user.id || 1, // Fallback a 1 si no hay ID (debería haber)
        items: cartItems.map(item => ({
          atraccionId: item.atraccionId || item.id,
          cantidad: item.quantity,
          precioUnitario: parseFloat(item.precio || item.precioBase || 0)
        })),
        metodoPago: 'Tarjeta',
        numeroTarjeta: paymentInfo.numeroTarjeta
      };

      const response = await api.post('/Pago/checkout', payload);
      
      if (response.status === 200) {
        const { localizador } = response.data;
        clearCart();
        navigate('/checkout-success', { state: { localizador, total: grandTotal } });
      }
    } catch (error) {
      console.error('Error in checkout:', error);
      alert('Error al procesar el pago. Por favor intente de nuevo.');
    } finally {
      setLoading(false);
    }
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

      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-0">
            {!showCheckout ? (
              <>
                <AnimatePresence>
                  {cartItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex gap-6 py-7 ${idx < cartItems.length - 1 ? 'border-b border-sand-200' : ''}`}
                    >
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                        <img
                          src={item.imagenUrl ? (item.imagenUrl.startsWith('http') ? item.imagenUrl : `${IMAGE_BASE_URL}${item.imagenUrl}`) : 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=200&q=80'}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <h3
                            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                            className="text-lg font-medium text-sand-950"
                          >
                            {item.nombre}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-sand-300 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-sand-500 mb-4">
                          <MapPin className="w-3 h-3" />
                          {item.ciudadNombre}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-sand-300">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-10 text-center text-sm text-sand-950 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div
                            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                            className="text-xl font-semibold text-sand-950"
                          >
                            ${(item.precio * item.quantity).toFixed(2)}
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
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-sand-200 p-10"
              >
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-3xl font-light mb-8">
                  Detalles de <em className="italic">Pago</em>
                </h3>
                <form onSubmit={handleCheckout} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-bold mb-2">Nombre en la tarjeta</label>
                      <input 
                        type="text" required placeholder="JORGE LUIS"
                        className="w-full p-4 bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-sand-200"
                        value={paymentInfo.nombre}
                        onChange={(e) => setPaymentInfo({...paymentInfo, nombre: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-bold mb-2">Número de tarjeta</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
                        <input 
                          type="text" required placeholder="0000 0000 0000 0000"
                          className="w-full pl-12 pr-4 py-4 bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-sand-200"
                          value={paymentInfo.numeroTarjeta}
                          onChange={(e) => setPaymentInfo({...paymentInfo, numeroTarjeta: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-bold mb-2">Expira (MM/YY)</label>
                      <input 
                        type="text" required placeholder="12/26"
                        className="w-full p-4 bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-sand-200"
                        value={paymentInfo.exp}
                        onChange={(e) => setPaymentInfo({...paymentInfo, exp: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-bold mb-2">CVV</label>
                      <input 
                        type="text" required placeholder="000"
                        className="w-full p-4 bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-sand-200"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="bg-sand-50 p-4 flex items-center gap-3 text-xs text-sand-500">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    Pago seguro encriptado. No guardamos los datos de tu tarjeta.
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="flex-1 py-4 border border-sand-200 text-xs uppercase tracking-widest text-sand-600 hover:bg-sand-50 transition-colors"
                    >
                      Volver al carrito
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 bg-sand-950 text-sand-50 text-xs font-medium tracking-widest uppercase hover:bg-sand-800 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Procesando...' : `Pagar $${grandTotal.toFixed(2)}`}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

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
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <div className="border-t border-sand-200 pt-4 flex justify-between font-medium text-sand-950">
                  <span>Total</span>
                  <span
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    className="text-2xl font-semibold"
                  >
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {!showCheckout ? (
                <button
                  onClick={() => user ? setShowCheckout(true) : alert('Inicia sesión para continuar')}
                  className="w-full py-4 bg-sand-950 text-sand-50 text-xs font-medium tracking-[0.15em] uppercase hover:bg-sand-800 transition-all flex items-center justify-center gap-2 mb-4 shadow-xl shadow-sand-900/10"
                >
                  Proceder al Pago <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="p-4 bg-ocean-50 text-ocean-700 text-xs text-center font-medium uppercase tracking-widest">
                  Fase de Pago Final
                </div>
              )}
              
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
