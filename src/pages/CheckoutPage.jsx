import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, User, CreditCard, Shield, CheckCircle2, Lock } from 'lucide-react';
import Swal from 'sweetalert2';
import useCartStore from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';

const STEPS = [
  { id: 1, label: 'Datos de Pasajeros', icon: User },
  { id: 2, label: 'Simulación de Pago', icon: CreditCard },
];

const emptyPassenger = () => ({ firstName: '', lastName: '', docType: 'pasaporte', docNumber: '', category: 'Adulto' });

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [passengers, setPassengers] = useState([emptyPassenger()]);
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '', cardName: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Persist form state across refreshes
  useEffect(() => {
    const saved = sessionStorage.getItem('checkout_passengers');
    if (saved) setPassengers(JSON.parse(saved));
  }, []);

  useEffect(() => {
    sessionStorage.setItem('checkout_passengers', JSON.stringify(passengers));
  }, [passengers]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!items.length) { navigate('/atracciones'); }
  }, [user, items]);

  const totalAmount = total();
  const firstItem = items[0] || {};
  const totalPassengers = items.reduce((s, i) => s + i.quantity, 0);

  // Sync passenger count with cart
  useEffect(() => {
    setPassengers((prev) => {
      const diff = totalPassengers - prev.length;
      if (diff > 0) return [...prev, ...Array.from({ length: diff }, emptyPassenger)];
      if (diff < 0) return prev.slice(0, totalPassengers);
      return prev;
    });
  }, [totalPassengers]);

  // ── Validation ──────────────────────────────────────────────
  const validateStep1 = () => {
    const errs = {};
    passengers.forEach((p, i) => {
      if (!p.firstName.trim()) errs[`fn-${i}`] = 'Nombre requerido';
      if (!p.lastName.trim()) errs[`ln-${i}`] = 'Apellido requerido';
      if (!p.docNumber.trim()) errs[`dn-${i}`] = 'Número de documento requerido';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    const cn = payment.cardNumber.replace(/\s/g, '');
    if (cn.length !== 16 || !/^\d+$/.test(cn)) errs.cardNumber = 'Número de tarjeta inválido (16 dígitos)';
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) errs.expiry = 'Formato MM/AA requerido';
    if (payment.cvv.length < 3) errs.cvv = 'CVV inválido';
    if (!payment.cardName.trim()) errs.cardName = 'Nombre del titular requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Handlers ────────────────────────────────────────────────
  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const formatCardNumber = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const slot = JSON.parse(sessionStorage.getItem('checkout_slot') || '{}');
      const booking = await bookingService.createBooking({
        attraction: firstItem.name,
        image: firstItem.image,
        slot_date: slot.slot_date || firstItem.date,
        start_time: slot.start_time || firstItem.time,
        total_amount: totalAmount,
        currency_code: 'USD',
        modalidad: firstItem.modalidad,
        passengers: passengers.map((p, i) => ({
          first_name: p.firstName,
          last_name: p.lastName,
          ticket_category_name: p.category,
          unit_price: totalAmount / totalPassengers,
        })),
      });

      clearCart();
      sessionStorage.removeItem('checkout_passengers');
      sessionStorage.removeItem('checkout_slot');

      await Swal.fire({
        icon: 'success',
        title: '¡Reserva confirmada!',
        html: `Tu código de reserva es <strong style="font-size:1.4em;letter-spacing:0.1em">${booking.pnr_code}</strong><br><small style="color:#6b7280">Guárdalo para consultar tu reserva en cualquier momento</small>`,
        confirmButtonText: 'Ver mis reservas',
        confirmButtonColor: '#1c1611',
        allowOutsideClick: false,
      });
      navigate('/mi-cuenta');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'No se pudo procesar el pago.', confirmButtonColor: '#1c1611' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-4xl font-light text-sand-950 mb-2">
            Finaliza tu <em className="italic">reserva</em>
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-10 gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2.5 px-5 py-2.5 border-b-2 transition-all duration-300 ${
                  isActive ? 'border-sand-950 text-sand-950' : isDone ? 'border-ocean-500 text-ocean-600' : 'border-sand-200 text-sand-400'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="text-xs font-medium uppercase tracking-widest">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="w-8 h-px bg-sand-300 mx-2" />}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white border border-sand-200 p-8 space-y-8"
                >
                  <div>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-2xl font-light text-sand-950 mb-1">
                      Datos de Pasajeros
                    </h2>
                    <p className="text-sand-500 text-sm">Completa la información para cada pasajero.</p>
                  </div>

                  {passengers.map((p, i) => (
                    <div key={i} className="border border-sand-100 p-6 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-7 h-7 rounded-full bg-sand-950 text-white flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium text-sand-700">Pasajero {i + 1}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5">Nombre *</label>
                          <input
                            value={p.firstName}
                            onChange={(e) => setPassengers((prev) => prev.map((pp, ii) => ii === i ? { ...pp, firstName: e.target.value } : pp))}
                            className={`w-full border px-4 py-3 text-sm bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition ${errors[`fn-${i}`] ? 'border-red-300' : 'border-sand-200'}`}
                            placeholder="Jorge"
                          />
                          {errors[`fn-${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`fn-${i}`]}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5">Apellido *</label>
                          <input
                            value={p.lastName}
                            onChange={(e) => setPassengers((prev) => prev.map((pp, ii) => ii === i ? { ...pp, lastName: e.target.value } : pp))}
                            className={`w-full border px-4 py-3 text-sm bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition ${errors[`ln-${i}`] ? 'border-red-300' : 'border-sand-200'}`}
                            placeholder="Rodríguez"
                          />
                          {errors[`ln-${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`ln-${i}`]}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5">Tipo de doc.</label>
                          <select
                            value={p.docType}
                            onChange={(e) => setPassengers((prev) => prev.map((pp, ii) => ii === i ? { ...pp, docType: e.target.value } : pp))}
                            className="w-full border border-sand-200 px-4 py-3 text-sm bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition"
                          >
                            <option value="pasaporte">Pasaporte</option>
                            <option value="cedula">Cédula</option>
                            <option value="dni">DNI</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5">N° Documento *</label>
                          <input
                            value={p.docNumber}
                            onChange={(e) => setPassengers((prev) => prev.map((pp, ii) => ii === i ? { ...pp, docNumber: e.target.value } : pp))}
                            className={`w-full border px-4 py-3 text-sm bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition ${errors[`dn-${i}`] ? 'border-red-300' : 'border-sand-200'}`}
                            placeholder="AB123456"
                          />
                          {errors[`dn-${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`dn-${i}`]}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5">Categoría</label>
                          <select
                            value={p.category}
                            onChange={(e) => setPassengers((prev) => prev.map((pp, ii) => ii === i ? { ...pp, category: e.target.value } : pp))}
                            className="w-full border border-sand-200 px-4 py-3 text-sm bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition"
                          >
                            <option>Adulto</option>
                            <option>Niño (3-12 años)</option>
                            <option>Tercera edad</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-sand-950 text-sand-50 text-xs font-medium uppercase tracking-widest hover:bg-sand-800 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Continuar al pago <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white border border-sand-200 p-8 space-y-8"
                >
                  <div>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-2xl font-light text-sand-950 mb-1">
                      Datos de Pago
                    </h2>
                    <p className="text-sand-500 text-sm flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Transacción simulada — entorno seguro
                    </p>
                  </div>

                  {/* Card preview */}
                  <div
                    className="relative rounded-none h-44 p-6 flex flex-col justify-between overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #1c1611 0%, #3d2f18 50%, #1c1611 100%)' }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sand-300 text-xs uppercase tracking-widest">Tarjeta de Crédito</div>
                      <div className="text-sand-300 font-mono text-sm">VISA</div>
                    </div>
                    <div>
                      <div className="text-white font-mono text-lg tracking-[0.2em] mb-1">
                        {payment.cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between text-sand-400 text-xs">
                        <span>{payment.cardName || 'Nombre Titular'}</span>
                        <span>{payment.expiry || 'MM/AA'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5">Número de tarjeta *</label>
                      <input
                        value={payment.cardNumber}
                        onChange={(e) => setPayment((p) => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))}
                        className={`w-full border px-4 py-3 text-sm font-mono bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition ${errors.cardNumber ? 'border-red-300' : 'border-sand-200'}`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5">Nombre en la tarjeta *</label>
                      <input
                        value={payment.cardName}
                        onChange={(e) => setPayment((p) => ({ ...p, cardName: e.target.value.toUpperCase() }))}
                        className={`w-full border px-4 py-3 text-sm bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition ${errors.cardName ? 'border-red-300' : 'border-sand-200'}`}
                        placeholder="JORGE RODRIGUEZ"
                      />
                      {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5">Vencimiento *</label>
                        <input
                          value={payment.expiry}
                          onChange={(e) => setPayment((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                          className={`w-full border px-4 py-3 text-sm bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition ${errors.expiry ? 'border-red-300' : 'border-sand-200'}`}
                          placeholder="MM/AA"
                          maxLength={5}
                        />
                        {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5">CVV *</label>
                        <input
                          value={payment.cvv}
                          onChange={(e) => setPayment((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                          className={`w-full border px-4 py-3 text-sm font-mono bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition ${errors.cvv ? 'border-red-300' : 'border-sand-200'}`}
                          placeholder="•••"
                          maxLength={4}
                          type="password"
                        />
                        {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleBack}
                      className="px-6 py-4 border border-sand-200 text-sand-600 text-xs font-medium uppercase tracking-widest hover:bg-sand-50 transition-all duration-200 flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" /> Volver
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 py-4 bg-sand-950 text-sand-50 text-xs font-medium uppercase tracking-widest hover:bg-sand-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-sand-400 border-t-white rounded-full animate-spin" /> Procesando...</>
                      ) : (
                        <><Shield className="w-4 h-4" /> Confirmar Pago ${totalAmount.toFixed(2)}</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-sand-200 p-6 space-y-4 sticky top-20">
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-xl font-light text-sand-950">
                Resumen del pedido
              </h3>
              {items.map((item, i) => (
                <div key={i} className="flex gap-3 py-3 border-b border-sand-100 last:border-0">
                  {item.image && (
                    <img src={item.image.startsWith('http') ? item.image : `${IMAGE_BASE_URL}${item.image}`}
                      alt={item.name} className="w-14 h-14 object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-sand-900 truncate">{item.name}</div>
                    <div className="text-[10px] text-sand-400 uppercase tracking-wider mt-1">
                      {item.date} · {item.time} · {item.modalidad}
                    </div>
                    <div className="text-sm text-sand-600 mt-1">${item.price} × {item.quantity}</div>
                  </div>
                </div>
              ))}
              <div className="pt-2 space-y-1">
                <div className="flex justify-between text-sm text-sand-600">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-sand-600">
                  <span>Impuestos (incl.)</span>
                  <span>—</span>
                </div>
                <div className="flex justify-between font-semibold text-sand-950 text-base pt-2 border-t border-sand-200">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

// Need IMAGE_BASE_URL for img src
import { IMAGE_BASE_URL } from '../services/api';
export default CheckoutPage;
