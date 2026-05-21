import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Trash2, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import scheduleService from '../../services/scheduleService';
import { catalogApi } from '../../services/api';
import { format, addDays } from 'date-fns';

const WEEK_DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DEFAULT_TIMES = ['09:00', '14:00'];

const today = () => format(new Date(), 'yyyy-MM-dd');
const nextMonth = () => format(addDays(new Date(), 30), 'yyyy-MM-dd');

const CapacityBar = ({ total, sold }) => {
  const pct = total > 0 ? (sold / total) * 100 : 0;
  const cls = pct < 60 ? 'low' : pct < 85 ? 'med' : 'high';
  return (
    <div>
      <div className="capacity-bar">
        <div className={`capacity-bar-fill ${cls}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <div className="text-[10px] text-sand-400 mt-1">{sold}/{total} vendidos</div>
    </div>
  );
};

const ManageSchedule = () => {
  const { id: attractionId } = useParams();
  const [attractionName, setAttractionName] = useState('Atracción');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter range for monitor
  const [monitorFrom, setMonitorFrom] = useState(today());
  const [monitorTo, setMonitorTo] = useState(nextMonth());

  // Generate template
  const [template, setTemplate] = useState({
    dateFrom: today(),
    dateTo: nextMonth(),
    times: ['09:00', '14:00'],
    weekDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    capacityPerSlot: 20,
  });

  // Bulk delete range
  const [deleteRange, setDeleteRange] = useState({ from: today(), to: nextMonth() });

  useEffect(() => {
    if (attractionId) {
      catalogApi.get(`/attraction/${attractionId}/complete`)
        .then((r) => setAttractionName(r.data.name))
        .catch(() => {});
      loadMonitor();
    }
  }, [attractionId]);

  const loadMonitor = async () => {
    setLoadingSlots(true);
    try {
      const data = await scheduleService.getMonitor(attractionId, monitorFrom, monitorTo);
      setSlots(data);
    } finally {
      setLoadingSlots(false);
    }
  };

  const toggleWeekDay = (day) => {
    setTemplate((prev) => ({
      ...prev,
      weekDays: prev.weekDays.includes(day)
        ? prev.weekDays.filter((d) => d !== day)
        : [...prev.weekDays, day],
    }));
  };

  const toggleTime = (time) => {
    setTemplate((prev) => ({
      ...prev,
      times: prev.times.includes(time)
        ? prev.times.filter((t) => t !== time)
        : [...prev.times, time],
    }));
  };

  const [customTime, setCustomTime] = useState('');
  const addCustomTime = () => {
    if (customTime && !template.times.includes(customTime)) {
      setTemplate((prev) => ({ ...prev, times: [...prev.times, customTime].sort() }));
      setCustomTime('');
    }
  };

  const handleGenerate = async () => {
    if (!template.weekDays.length || !template.times.length) {
      Swal.fire({ icon: 'warning', title: 'Configuración incompleta', text: 'Selecciona al menos un día y un horario.', confirmButtonColor: '#1c1611' });
      return;
    }
    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Generar horarios?',
      html: `Se crearán horarios del <strong>${template.dateFrom}</strong> al <strong>${template.dateTo}</strong><br>Días: ${template.weekDays.map((d) => WEEK_DAYS_ES[d]).join(', ')}<br>Horas: ${template.times.join(', ')}<br>Capacidad: ${template.capacityPerSlot} personas/slot`,
      showCancelButton: true,
      confirmButtonText: 'Generar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1c1611',
    });
    if (!confirm.isConfirmed) return;

    setGenerating(true);
    try {
      const result = await scheduleService.generateSchedules({ attractionId, ...template });
      Swal.fire({ icon: 'success', title: `${result.count} horarios generados`, confirmButtonColor: '#1c1611', timer: 2500, showConfirmButton: false });
      loadMonitor();
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkDelete = async () => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar horarios?',
      html: `Esto eliminará todos los horarios <strong>sin reservas</strong> entre <strong>${deleteRange.from}</strong> y <strong>${deleteRange.to}</strong>.`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!confirm.isConfirmed) return;
    setDeleting(true);
    try {
      const r = await scheduleService.bulkDelete(attractionId, deleteRange.from, deleteRange.to);
      Swal.fire({ icon: 'success', title: `${r.deleted} horarios eliminados`, confirmButtonColor: '#1c1611', timer: 2000, showConfirmButton: false });
      loadMonitor();
    } finally {
      setDeleting(false);
    }
  };

  const inputCls = 'border border-sand-200 px-3 py-2.5 text-sm bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition';
  const labelCls = 'block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5';

  return (
    <div className="min-h-screen bg-sand-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-ocean-600">Gestión de Inventario</span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-4xl font-light text-sand-950 mt-1">
            Horarios: <em className="italic">{attractionName}</em>
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left — Generator */}
          <div className="xl:col-span-1 space-y-6">
            {/* Generate card */}
            <div className="bg-white border border-sand-200 p-6 space-y-5">
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-xl font-medium text-sand-950">
                Generar Horarios
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Desde</label>
                  <input type="date" value={template.dateFrom} onChange={(e) => setTemplate((p) => ({ ...p, dateFrom: e.target.value }))} className={`${inputCls} w-full`} />
                </div>
                <div>
                  <label className={labelCls}>Hasta</label>
                  <input type="date" value={template.dateTo} onChange={(e) => setTemplate((p) => ({ ...p, dateTo: e.target.value }))} className={`${inputCls} w-full`} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Días de la semana</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {WEEK_DAYS_ES.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleWeekDay(idx)}
                      className={`w-10 h-10 text-xs font-medium border transition-all duration-200 ${template.weekDays.includes(idx) ? 'bg-sand-950 text-white border-sand-950' : 'border-sand-200 text-sand-600 hover:border-sand-400'}`}
                    >
                      {day.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Horarios de salida</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {template.times.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sand-950 text-sand-50 text-xs"
                    >
                      <Clock className="w-3 h-3" /> {t}
                      <button onClick={() => toggleTime(t)} className="ml-1 text-sand-300 hover:text-white">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} className={`${inputCls} flex-1`} />
                  <button onClick={addCustomTime} className="px-3 py-2.5 border border-sand-200 text-sand-600 hover:bg-sand-50 transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Capacidad por horario</label>
                <input type="number" value={template.capacityPerSlot} onChange={(e) => setTemplate((p) => ({ ...p, capacityPerSlot: parseInt(e.target.value) || 10 }))} className={`${inputCls} w-full`} min="1" />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3 bg-sand-950 text-sand-50 text-xs font-medium uppercase tracking-widest hover:bg-sand-800 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {generating ? <div className="w-4 h-4 border-2 border-sand-400 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                Generar Horarios
              </button>
            </div>

            {/* Bulk delete card */}
            <div className="bg-white border border-red-100 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-medium text-red-700 uppercase tracking-widest">Limpiar Horarios</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Desde</label>
                  <input type="date" value={deleteRange.from} onChange={(e) => setDeleteRange((p) => ({ ...p, from: e.target.value }))} className={`${inputCls} w-full`} />
                </div>
                <div>
                  <label className={labelCls}>Hasta</label>
                  <input type="date" value={deleteRange.to} onChange={(e) => setDeleteRange((p) => ({ ...p, to: e.target.value }))} className={`${inputCls} w-full`} />
                </div>
              </div>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="w-full py-3 border border-red-200 text-red-600 text-xs font-medium uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting ? <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Eliminar rango
              </button>
            </div>
          </div>

          {/* Right — Monitor */}
          <div className="xl:col-span-2">
            <div className="bg-white border border-sand-200">
              <div className="p-6 border-b border-sand-100 flex flex-wrap items-center justify-between gap-4">
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-xl font-medium text-sand-950">
                  Monitor de Cupos
                </h2>
                <div className="flex items-center gap-3">
                  <input type="date" value={monitorFrom} onChange={(e) => setMonitorFrom(e.target.value)} className={`${inputCls}`} />
                  <span className="text-sand-400">→</span>
                  <input type="date" value={monitorTo} onChange={(e) => setMonitorTo(e.target.value)} className={`${inputCls}`} />
                  <button onClick={loadMonitor} className="p-2.5 border border-sand-200 hover:bg-sand-50 transition text-sand-600">
                    <RefreshCw className={`w-4 h-4 ${loadingSlots ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Stats summary */}
              {slots.length > 0 && (
                <div className="grid grid-cols-3 border-b border-sand-100">
                  {[
                    { label: 'Slots totales', value: slots.length },
                    { label: 'Total vendidos', value: slots.reduce((s, sl) => s + sl.capacity_sold, 0) },
                    { label: 'Disponibles', value: slots.reduce((s, sl) => s + sl.capacity_available, 0) },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 text-center border-r border-sand-100 last:border-0">
                      <div style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-3xl font-light text-sand-950">{stat.value}</div>
                      <div className="text-[10px] uppercase tracking-widest text-sand-400 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Slots table */}
              <div className="overflow-y-auto max-h-[500px]">
                {loadingSlots ? (
                  <div className="py-16 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-sand-200 border-t-sand-950 rounded-full animate-spin" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-16 text-center text-sand-400 font-light">
                    No hay horarios en el rango seleccionado. Genera nuevos horarios con el panel izquierdo.
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-sand-50 border-b border-sand-200 sticky top-0">
                      <tr>
                        <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-sand-500">Fecha</th>
                        <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-sand-500">Hora</th>
                        <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-sand-500">Cap. Total</th>
                        <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-sand-500">Vendidos</th>
                        <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-sand-500 w-40">Disponibilidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-100">
                      {slots.map((slot) => (
                        <tr key={slot.id} className="hover:bg-sand-50/50 transition-colors">
                          <td className="px-5 py-3 font-medium text-sand-900">{slot.slot_date}</td>
                          <td className="px-5 py-3 text-sand-600">{slot.start_time}</td>
                          <td className="px-5 py-3 text-sand-700">{slot.capacity_total}</td>
                          <td className="px-5 py-3">
                            <span className={slot.capacity_sold >= slot.capacity_total ? 'text-red-500 font-medium' : 'text-sand-700'}>
                              {slot.capacity_sold}
                            </span>
                          </td>
                          <td className="px-5 py-3 w-40">
                            <CapacityBar total={slot.capacity_total} sold={slot.capacity_sold} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSchedule;
