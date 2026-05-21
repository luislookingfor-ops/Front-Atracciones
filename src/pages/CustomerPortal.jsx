import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, MapPin, Clock, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const StatusBadge = ({ status }) => {
  const map = {
    confirmed: { label: 'Confirmada', cls: 'badge-confirmed', icon: CheckCircle },
    cancelled: { label: 'Cancelada', cls: 'badge-cancelled', icon: XCircle },
    pending:   { label: 'Pendiente', cls: 'badge-pending', icon: AlertCircle },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-widest font-medium ${cfg.cls}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
};

const CustomerPortal = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    bookingService.getUserBookings(user.id).then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, [user]);

  const handleCancel = async (booking) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Cancelar reserva',
      html: `<p style="color:#6b7280;margin-bottom:12px">¿Estás seguro de cancelar <strong>${booking.attraction}</strong>?</p>`,
      input: 'textarea',
      inputPlaceholder: 'Motivo de cancelación (requerido)...',
      inputAttributes: { rows: 3 },
      showCancelButton: true,
      confirmButtonText: 'Cancelar reserva',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#1c1611',
      inputValidator: (v) => !v.trim() ? 'El motivo es requerido' : undefined,
    });

    if (!isConfirmed || !reason) return;
    await bookingService.cancelBooking(booking.id, reason);
    setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
    Swal.fire({ icon: 'success', title: 'Reserva cancelada', text: 'Los cupos han sido liberados.', confirmButtonColor: '#1c1611' });
  };

  const filtered = bookings.filter((b) => filter === 'all' || b.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sand-200 border-t-sand-950 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em] text-ocean-600 mb-2 block">Portal del Cliente</span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-4xl font-light text-sand-950">
            Mis <em className="italic">Reservas</em>
          </h1>
          <p className="text-sand-500 font-light mt-2">Bienvenido/a, {user?.nombre}. Aquí puedes ver y gestionar tus experiencias reservadas.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0 border-b border-sand-200 mb-8">
          {[['all', 'Todas'], ['confirmed', 'Confirmadas'], ['cancelled', 'Canceladas']].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-6 py-3 text-xs font-medium uppercase tracking-widest transition-all duration-200 ${filter === val ? 'tab-active' : 'tab-inactive'}`}
            >
              {lbl} {val === 'all' && `(${bookings.length})`}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <CalendarCheck className="w-12 h-12 text-sand-300 mx-auto mb-4" />
            <p className="text-sand-500 font-light">No tienes reservas {filter !== 'all' ? 'en esta categoría' : 'aún'}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking, i) => {
              const isExpanded = expandedId === booking.id;
              const canCancel = booking.status === 'confirmed';
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white border border-sand-200 overflow-hidden"
                >
                  {/* Card header */}
                  <div className="flex flex-col sm:flex-row gap-4 p-5">
                    {booking.image && (
                      <img src={booking.image} alt={booking.attraction} className="w-full sm:w-24 h-32 sm:h-20 object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sand-950">{booking.attraction}</h3>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-sand-500">
                            <span className="flex items-center gap-1"><CalendarCheck className="w-3 h-3" />{booking.slot_date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.start_time}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={booking.status} />
                          <div className="font-mono text-xs text-sand-400 mt-1.5"># {booking.pnr_code}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-semibold text-sand-950">${booking.total_amount.toFixed(2)} {booking.currency_code}</span>
                        <div className="flex gap-2">
                          {canCancel && (
                            <button
                              onClick={() => handleCancel(booking)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                            className="flex items-center gap-1 text-xs text-sand-500 hover:text-sand-800 transition-colors"
                          >
                            {isExpanded ? <><ChevronUp className="w-3 h-3" /> Menos</> : <><ChevronDown className="w-3 h-3" /> Detalles</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-sand-100 bg-sand-50 p-5"
                    >
                      <p className="text-[10px] uppercase tracking-widest text-sand-400 mb-3">Pasajeros</p>
                      <div className="space-y-2">
                        {(booking.passengers || []).map((p, pi) => (
                          <div key={pi} className="flex justify-between text-sm text-sand-700">
                            <span>{p.first_name} {p.last_name} · <span className="text-sand-400">{p.ticket_category_name}</span></span>
                            <span>${p.unit_price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-[10px] text-sand-400">
                        Reservado el {format(parseISO(booking.created_at), "d 'de' MMMM yyyy", { locale: es })}
                        {booking.cancel_reason && (
                          <div className="mt-1 text-red-400">Motivo de cancelación: {booking.cancel_reason}</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPortal;
