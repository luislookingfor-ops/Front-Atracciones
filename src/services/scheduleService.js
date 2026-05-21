/**
 * scheduleService.js
 * ------------------
 * Admin-side schedule management (bulk generation, monitor, cleanup).
 * Uses mock data — ready to wire to Supabase DB_BOOKING.
 */

import { format, addDays, parseISO, eachDayOfInterval } from 'date-fns';

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Shared mock schedule store (simulates DB)
let scheduleStore = {};

const scheduleService = {
  /**
   * Get schedule monitor for an attraction (capacity vs sold vs available).
   * @param {string} attractionId
   * @param {string} dateFrom  yyyy-MM-dd
   * @param {string} dateTo    yyyy-MM-dd
   */
  getMonitor: async (attractionId, dateFrom, dateTo) => {
    await new Promise((r) => setTimeout(r, 400));
    const existing = scheduleStore[attractionId] || [];
    if (existing.length > 0) {
      return existing.filter(
        (s) => s.slot_date >= dateFrom && s.slot_date <= dateTo
      );
    }
    // Generate sample monitor data
    const days = eachDayOfInterval({ start: parseISO(dateFrom), end: parseISO(dateTo) });
    return days.flatMap((day) => {
      if (day.getDay() === 0) return [];
      const cap = 20;
      return ['09:00', '14:00'].map((time) => {
        const sold = Math.floor(Math.random() * (cap + 2));
        const avail = Math.max(0, cap - sold);
        return {
          id: `${attractionId}-${format(day, 'yyyyMMdd')}-${time}`,
          attractionId,
          slot_date: format(day, 'yyyy-MM-dd'),
          start_time: time,
          capacity_total: cap,
          capacity_sold: Math.min(sold, cap),
          capacity_available: avail,
        };
      });
    });
  },

  /**
   * Bulk generate schedules from a template.
   * @param {object} template
   *   attractionId, dateFrom, dateTo, times[], weekDays[], capacityPerSlot
   */
  generateSchedules: async (template) => {
    await new Promise((r) => setTimeout(r, 700));
    const { attractionId, dateFrom, dateTo, times, weekDays, capacityPerSlot } = template;
    const days = eachDayOfInterval({ start: parseISO(dateFrom), end: parseISO(dateTo) });
    const generated = [];

    days.forEach((day) => {
      if (!weekDays.includes(day.getDay())) return;
      times.forEach((time) => {
        const slot = {
          id: `${attractionId}-${format(day, 'yyyyMMdd')}-${time}`,
          attractionId,
          slot_date: format(day, 'yyyy-MM-dd'),
          start_time: time,
          capacity_total: capacityPerSlot,
          capacity_sold: 0,
          capacity_available: capacityPerSlot,
        };
        generated.push(slot);
      });
    });

    scheduleStore[attractionId] = [
      ...(scheduleStore[attractionId] || []).filter(
        (s) => s.slot_date < dateFrom || s.slot_date > dateTo
      ),
      ...generated,
    ];

    return { count: generated.length, slots: generated };
  },

  /**
   * Bulk delete schedules by date range.
   */
  bulkDelete: async (attractionId, dateFrom, dateTo) => {
    await new Promise((r) => setTimeout(r, 500));
    const before = (scheduleStore[attractionId] || []).length;
    scheduleStore[attractionId] = (scheduleStore[attractionId] || []).filter(
      (s) => s.slot_date < dateFrom || s.slot_date > dateTo
    );
    const deleted = before - (scheduleStore[attractionId] || []).length;
    return { deleted };
  },

  getWeekDays: () => WEEK_DAYS,
};

export default scheduleService;
