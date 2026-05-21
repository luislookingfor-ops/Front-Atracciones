import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, ShoppingBag, Users, Calendar, Clock,
  ChevronRight, Zap, Plus, Minus, CheckCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import attractionService from '../../services/attractionService';
import bookingService from '../../services/bookingService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const POSTerminal = () => {
  const [search, setSearch] = useState('');
  const [attractions, setAttractions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [passengers, setPassengers] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [lastPNR, setLastPNR] = useState(null);

  useEffect(() => {
    attractionService.getAll().then(setAttractions).catch(() => {});
  }, []);

  const filtered = attractions.filter(
    (a) =>
      a.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      a.ciudadNombre?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAttraction = async (attraction) => {
    setSelected(attraction);
    setSelectedSlot(null);
    setLoadingForecast(true);
    try {
      const data = await bookingService.getNextAvailableDates(attraction.atraccionId || attraction.id, 5);
      setForecast(data);
    } finally {
      setLoadingForecast(false);
    }
  };

  const total = (selected?.precio || 0) * passengers;

  const handleCheckout = async () => {
    if (!selectedSlot) {
      Swal.fire({ icon: 'warning', title: 'Selecciona un horario', text: 'Elige una fecha y hora del pronóstico de disponibilidad.', confirmButtonColor: '#1c1611' });
      return;
    }
    setProcessing(true);
    try {
      const booking = await bookingService.createBooking({
        attraction: selected.nombre,
        image: selected.imagenUrl || '',
        slot_date: selectedSlot.date,
        start_time: selectedSlot.time,
        total_amount: total,
        currency_code: 'USD',
        modalidad: 'pos',
        passengers: Array.from({ length: passengers }, (_, i) => ({
          first_name: `Pasajero`,
          last_name: `${i + 1}`,
          ticket_category_name: 'Adulto',
          unit_price: selected.precio || 0,
        })),
      });
      setLastPNR(booking.pnr_code);
      setSelected(null);
      setSelectedSlot(null);
      setPassengers(1);
      setSearch('');
      Swal.fire({
        icon: 'success',
        title: '¡Venta registrada!',
        html: `PNR: <strong style="font-size:1.6em;letter-spacing:0.15em;font-family:monospace">${booking.pnr_code}</strong>`,
        confirmButtonText: 'Nueva venta',
        confirmButtonColor: '#1c1611',
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#1c1611' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-ocean-600">Punto de Venta</span>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-4xl font-light text-sand-950">
              POS <em className="italic">Terminal</em>
            </h1>
          </div>
          {lastPNR && (
            <div className="bg-ocean-50 border border-ocean-200 px-4 py-3 text-sm">
              <span className="text-[10px] uppercase tracking-widest text-ocean-600 block">Última venta</span>
              <span className="font-mono font-bold text-ocean-800 text-lg tracking-widest">{lastPNR}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search bar */}
            <div className="bg-white border border-sand-200 p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar atracción por nombre o ciudad..."
                  className="w-full pl-12 pr-4 py-3 bg-sand-50 border border-sand-200 text-sm focus:outline-none focus:ring-1 focus:ring-sand-400 transition"
                />
              </div>
            </div>

            {/* Attractions list */}
            {!selected && (
              <div className="bg-white border border-sand-200 overflow-hidden">
                {filtered.slice(0, 8).map((a, i) => (
                  <motion.button
                    key={a.atraccionId || a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSelectAttraction(a)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-sand-50 border-b border-sand-100 last:border-0 transition-colors text-left group"
                  >
                    {a.imagenUrl && (
                      <img
                        src={a.imagenUrl.startsWith('http') ? a.imagenUrl : a.imagenUrl}
                        alt={a.nombre}
                        className="w-14 h-10 object-cover flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sand-900 truncate">{a.nombre}</div>
                      <div className="text-xs text-sand-400 mt-0.5">{a.ciudadNombre || 'Ecuador'} · ${a.precio || a.precioBase}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-sand-300 group-hover:text-sand-600 transition-colors flex-shrink-0" />
                  </motion.button>
                ))}
                {filtered.length === 0 && (
                  <div className="py-12 text-center text-sand-400 font-light">Sin resultados</div>
                )}
              </div>
            )}

            {/* Selected attraction + forecast */}
            {selected && (
              <div className="space-y-4">
                {/* Selected card */}
                <div className="bg-white border border-ocean-200 p-5 flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-ocean-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-sand-950">{selected.nombre}</div>
                    <div className="text-xs text-sand-400 mt-0.5">${selected.precio || selected.precioBase} / persona</div>
                  </div>
                  <button
                    onClick={() => { setSelected(null); setForecast([]); setSelectedSlot(null); }}
                    className="text-xs text-sand-400 hover:text-sand-700 transition"
                  >
                    Cambiar
                  </button>
                </div>

                {/* Availability forecast */}
                <div className="bg-white border border-sand-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-ocean-500" />
                    <h3 className="text-xs uppercase tracking-widest font-medium text-sand-700">
                      Próximas 5 fechas disponibles
                    </h3>
                  </div>

                  {loadingForecast ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-sand-200 border-t-sand-950 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {forecast.map((day) => (
                        <div key={day.date} className="border border-sand-100">
                          <div className="px-4 py-2 bg-sand-50 text-xs font-medium text-sand-700">
                            {format(new Date(day.date + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })}
                          </div>
                          <div className="grid grid-cols-2 gap-px bg-sand-100">
                            {day.slots.map((slot) => {
                              const isChosen = selectedSlot?.date === day.date && selectedSlot?.time === slot.time;
                              const available = slot.available > 0;
                              return (
                                <button
                                  key={slot.time}
                                  disabled={!available}
                                  onClick={() => setSelectedSlot({ date: day.date, time: slot.time })}
                                  className={`flex items-center justify-between p-3 bg-white transition-all duration-200 ${
                                    isChosen ? 'ring-2 ring-inset ring-sand-950 bg-sand-950 text-sand-50' :
                                    available ? 'hover:bg-ocean-50' : 'opacity-40 cursor-not-allowed'
                                  }`}
                                >
                                  <span className="flex items-center gap-2 text-sm">
                                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                    {slot.time}
                                  </span>
                                  <span className={`flex items-center gap-1 text-xs ${isChosen ? 'text-sand-300' : 'text-ocean-600'}`}>
                                    <Users className="w-3 h-3" />
                                    {slot.available > 0 ? `${slot.available} libre${slot.available !== 1 ? 's' : ''}` : 'Agotado'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right — Cart / Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-sand-200 p-6 space-y-5 sticky top-20">
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-xl font-light text-sand-950">
                Resumen de Venta
              </h2>

              {/* Selected summary */}
              {selected ? (
                <>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-sand-700">
                      <span>Atracción</span>
                      <span className="font-medium text-right max-w-[150px] truncate">{selected.nombre}</span>
                    </div>
                    {selectedSlot && (
                      <>
                        <div className="flex justify-between text-sand-700">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Fecha</span>
                          <span>{selectedSlot.date}</span>
                        </div>
                        <div className="flex justify-between text-sand-700">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Hora</span>
                          <span>{selectedSlot.time}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Passengers */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-sand-500 mb-2">Pasajeros</label>
                    <div className="flex items-center gap-3 border border-sand-200 p-3">
                      <button onClick={() => setPassengers((p) => Math.max(1, p - 1))} className="w-8 h-8 border border-sand-200 flex items-center justify-center hover:bg-sand-100 transition">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center font-semibold">{passengers}</span>
                      <button onClick={() => setPassengers((p) => Math.min(20, p + 1))} className="w-8 h-8 border border-sand-200 flex items-center justify-center hover:bg-sand-100 transition">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-sand-200 pt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sand-500 text-sm">Total</span>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-3xl font-semibold text-sand-950">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-sand-400 mt-1">
                      ${selected.precio} × {passengers} pasajero{passengers !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={processing || !selectedSlot}
                    className="w-full py-4 bg-sand-950 text-sand-50 text-xs font-medium uppercase tracking-widest hover:bg-sand-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing ? (
                      <div className="w-4 h-4 border-2 border-sand-400 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                    {selectedSlot ? 'Registrar Venta' : 'Selecciona horario'}
                  </button>
                </>
              ) : (
                <div className="py-12 text-center text-sand-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-sand-200" />
                  <p className="text-sm font-light">Selecciona una atracción para comenzar la venta.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSTerminal;
