import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, getDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import bookingService from '../../services/bookingService';

const WEEK_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

/**
 * AvailabilityCalendar
 * Props:
 *   attractionId: string
 *   onSelectSlot: (slot) => void
 *   selectedSlot?: object
 */
const AvailabilityCalendar = ({ attractionId, onSelectSlot, selectedSlot }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const today = startOfDay(new Date());

  useEffect(() => {
    if (!attractionId) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    setLoading(true);
    bookingService.getAvailabilitySlots(attractionId, year, month).then((data) => {
      setSlots(data);
      setLoading(false);
    });
  }, [attractionId, currentMonth]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Map slot_date → slots[]
  const slotsByDate = {};
  slots.forEach((s) => {
    if (!slotsByDate[s.slot_date]) slotsByDate[s.slot_date] = [];
    slotsByDate[s.slot_date].push(s);
  });

  const getStatus = (day) => {
    if (isBefore(day, today)) return 'past';
    const key = format(day, 'yyyy-MM-dd');
    const daySlots = slotsByDate[key];
    if (!daySlots || daySlots.length === 0) return 'no-schedule';
    const hasAvailable = daySlots.some((s) => s.capacity_available > 0);
    return hasAvailable ? 'available' : 'sold-out';
  };

  // Offset for Mon-start grid
  const startOffset = (getDay(startOfMonth(currentMonth)) + 6) % 7;

  const slotsForSelected = selectedDate
    ? slotsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="p-2 hover:bg-sand-100 rounded transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4 text-sand-600" />
        </button>
        <h3 className="text-sm font-medium text-sand-950 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-2 hover:bg-sand-100 rounded transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4 text-sand-600" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-center">
        {WEEK_LABELS.map((l) => (
          <div key={l} className="text-[10px] uppercase tracking-widest text-sand-400 py-1">
            {l}
          </div>
        ))}
      </div>

      {/* Days grid */}
      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sand-200 border-t-sand-950 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Offset cells */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`off-${i}`} />
          ))}
          {daysInMonth.map((day) => {
            const status = getStatus(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);
            const clickable = status === 'available';
            const dateKey = format(day, 'yyyy-MM-dd');
            const totalAvail = (slotsByDate[dateKey] || []).reduce((s, sl) => s + sl.capacity_available, 0);

            return (
              <div
                key={dateKey}
                className={`avail-day ${status} ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'today' : ''}`}
                onClick={() => {
                  if (!clickable) return;
                  setSelectedDate(day);
                  onSelectSlot(null); // reset slot selection
                }}
                title={clickable ? `${totalAvail} cupos disponibles` : undefined}
              >
                {format(day, 'd')}
                {status === 'available' && !isSelected && <span className="avail-dot" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-sand-400 border-t border-sand-100 pt-3">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-ocean-400 inline-block" /> Con cupos</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sand-200 inline-block" /> Agotado</span>
      </div>

      {/* Time slot picker */}
      {selectedDate && slotsForSelected.length > 0 && (
        <div className="border-t border-sand-200 pt-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-sand-500 mb-3">
            Horarios para {format(selectedDate, "d 'de' MMMM", { locale: es })}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {slotsForSelected.map((slot) => {
              const isChosen = selectedSlot?.id === slot.id;
              const available = slot.capacity_available > 0;
              return (
                <button
                  key={slot.id}
                  disabled={!available}
                  onClick={() => onSelectSlot(slot)}
                  className={`p-3 text-left border transition-all duration-200 ${
                    isChosen
                      ? 'border-sand-950 bg-sand-950 text-sand-50'
                      : available
                      ? 'border-sand-200 hover:border-sand-400 bg-white'
                      : 'border-sand-100 bg-sand-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="font-medium text-sm">{slot.start_time}</div>
                  <div className="flex items-center gap-1 text-[10px] mt-1 text-sand-400">
                    <Users className="w-3 h-3" />
                    {available ? `${slot.capacity_available} cupos` : 'Agotado'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
