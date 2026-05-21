import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, XCircle, RefreshCw, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import bookingService from '../../services/bookingService';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const StatusBadge = ({ status }) => {
  const map = {
    confirmed: { label: 'Confirmada', cls: 'badge-confirmed' },
    cancelled:  { label: 'Cancelada',  cls: 'badge-cancelled' },
    pending:    { label: 'Pendiente',  cls: 'badge-pending' },
  };
  const cfg = map[status] || map.pending;
  return (
    <span className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-widest font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pnrSearch, setPnrSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const load = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await bookingService.getAllBookings(filters);
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => {
    load({ pnr: pnrSearch, status: statusFilter !== 'all' ? statusFilter : undefined });
  };

  const handleCancel = async (booking) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: `Cancelar reserva ${booking.pnr_code}`,
      html: `<p style="color:#6b7280;margin-bottom:8px">Atracción: <strong>${booking.attraction}</strong></p>`,
      input: 'textarea',
      inputPlaceholder: 'Motivo de cancelación (obligatorio)...',
      inputAttributes: { rows: 3 },
      showCancelButton: true,
      confirmButtonText: 'Confirmar cancelación',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#1c1611',
      inputValidator: (v) => !v.trim() ? 'Debes ingresar un motivo' : undefined,
    });
    if (!isConfirmed || !reason) return;
    await bookingService.cancelBooking(booking.id, reason);
    setBookings((prev) =>
      prev.map((b) => b.id === booking.id ? { ...b, status: 'cancelled', cancel_reason: reason } : b)
    );
    Swal.fire({ icon: 'success', title: 'Reserva cancelada', text: 'Los cupos han sido liberados automáticamente.', confirmButtonColor: '#1c1611', timer: 2500, showConfirmButton: false });
  };

  const displayed = bookings.filter((b) => {
    const matchPnr = !pnrSearch || b.pnr_code.toUpperCase().includes(pnrSearch.toUpperCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchPnr && matchStatus;
  });

  return (
    <div className="min-h-screen bg-sand-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-ocean-600">Panel Admin</span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-4xl font-light text-sand-950">
            Gestión de <em className="italic">Reservas</em>
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white border border-sand-200 p-5 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5">Buscar por PNR</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
              <input
                value={pnrSearch}
                onChange={(e) => setPnrSearch(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="AT4X7K..."
                className="w-full pl-10 pr-4 py-2.5 border border-sand-200 bg-sand-50 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-sand-400 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-sand-200 px-4 py-2.5 text-sm bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition"
            >
              <option value="all">Todos</option>
              <option value="confirmed">Confirmadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-sand-950 text-sand-50 text-xs font-medium uppercase tracking-widest hover:bg-sand-800 transition-all flex items-center gap-2"
          >
            <Filter className="w-3.5 h-3.5" /> Filtrar
          </button>
          <button
            onClick={() => { setPnrSearch(''); setStatusFilter('all'); load(); }}
            className="p-2.5 border border-sand-200 text-sand-500 hover:bg-sand-50 transition"
            title="Limpiar filtros"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: bookings.length, color: 'text-sand-950' },
            { label: 'Confirmadas', value: bookings.filter((b) => b.status === 'confirmed').length, color: 'text-ocean-600' },
            { label: 'Canceladas', value: bookings.filter((b) => b.status === 'cancelled').length, color: 'text-red-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-sand-200 p-4 text-center">
              <div style={{ fontFamily: 'Cormorant Garamond, serif' }} className={`text-4xl font-light ${s.color}`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-sand-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-sand-200 overflow-hidden">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-sand-200 border-t-sand-950 rounded-full animate-spin" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="py-20 text-center text-sand-400 font-light">
              {pnrSearch ? `Sin resultados para "${pnrSearch}"` : 'No hay reservas registradas.'}
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="grid grid-cols-[1fr_1fr_1fr_120px_120px_80px] gap-4 px-6 py-3 bg-sand-50 border-b border-sand-200 text-[10px] uppercase tracking-widest text-sand-500 font-bold">
                <span>PNR / Atracción</span>
                <span>Fecha</span>
                <span>Monto</span>
                <span>Estado</span>
                <span>Pasajeros</span>
                <span className="text-right">Acciones</span>
              </div>

              {displayed.map((booking, i) => {
                const isExpanded = expandedId === booking.id;
                return (
                  <div key={booking.id} className="border-b border-sand-100 last:border-0">
                    <div
                      className="grid grid-cols-[1fr_1fr_1fr_120px_120px_80px] gap-4 px-6 py-4 items-center hover:bg-sand-50/50 transition-colors cursor-pointer group"
                      onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    >
                      <div>
                        <div className="font-mono font-bold text-sand-950">{booking.pnr_code}</div>
                        <div className="text-xs text-sand-500 mt-0.5 truncate">{booking.attraction}</div>
                      </div>
                      <div className="text-sm text-sand-700">
                        {booking.slot_date}
                        <div className="text-xs text-sand-400">{booking.start_time}</div>
                      </div>
                      <div className="font-semibold text-sand-950">${booking.total_amount.toFixed(2)}</div>
                      <div><StatusBadge status={booking.status} /></div>
                      <div className="text-sm text-sand-600">{booking.passengers?.length || 1} pax</div>
                      <div className="flex justify-end gap-2">
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancel(booking); }}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Cancelar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-sand-400" /> : <ChevronDown className="w-4 h-4 text-sand-400" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-sand-50 border-t border-sand-100 px-6 py-4 overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-sand-400 mb-2">Pasajeros</p>
                              {(booking.passengers || []).map((p, pi) => (
                                <div key={pi} className="flex justify-between text-sm py-1.5 border-b border-sand-100 last:border-0">
                                  <span className="text-sand-700">{p.first_name} {p.last_name} · <em className="text-sand-400">{p.ticket_category_name}</em></span>
                                  <span className="text-sand-600">${p.unit_price?.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="text-sm text-sand-600 space-y-1">
                              <div><span className="text-sand-400">Creada:</span> {format(parseISO(booking.created_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}</div>
                              {booking.cancel_reason && (
                                <div className="text-red-500"><span className="text-sand-400">Motivo cancelación:</span> {booking.cancel_reason}</div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
