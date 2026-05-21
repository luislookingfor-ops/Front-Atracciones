import { bookingApi } from './api';
import { addDays, format, startOfDay, isBefore } from 'date-fns';

const bookingService = {
  /**
   * Get availability slots for an attraction in a given month.
   * @param {string} attractionId
   * @param {number} year
   * @param {number} month  1-indexed
   */
  getAvailabilitySlots: async (attractionId, year, month) => {
    try {
      const response = await bookingApi.get(`/booking/${attractionId}/availability`);
      const apiResult = response.data;
      if (!apiResult.success) {
        throw new Error(apiResult.message || 'Error al obtener disponibilidad');
      }

      const availabilityList = apiResult.data || [];
      const slots = [];

      availabilityList.forEach(day => {
        const dateObj = new Date(day.fecha + 'T00:00:00');
        if (dateObj.getFullYear() === year && (dateObj.getMonth() + 1) === month) {
          day.horarios.forEach(h => {
            slots.push({
              id: h.slotId,
              attractionId: attractionId,
              slot_date: day.fecha,
              start_time: h.horaInicio,
              capacity_total: h.cuposTotales,
              capacity_available: h.cuposDisponibles
            });
          });
        }
      });

      return slots;
    } catch (error) {
      console.warn('Fallback a slots simulados debido a error en API de disponibilidad:', error.message);
      
      // Fallback: Generar slots simulados
      const slots = [];
      const today = startOfDay(new Date());
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        if (isBefore(date, today)) continue;
        if (date.getDay() === 0) continue; // Cerrado domingos
        
        // Simulación consistente basada en el attractionId
        const cap = 20;
        const hash = attractionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const sold = (hash + d) % 18; // Algoritmo determinista simple
        const available = Math.max(2, cap - sold);
        
        ['09:00', '14:00'].forEach((time) => {
          slots.push({
            id: `${attractionId}-${format(date, 'yyyyMMdd')}-${time.replace(':', '')}`,
            attractionId,
            slot_date: format(date, 'yyyy-MM-dd'),
            start_time: time,
            capacity_total: cap,
            capacity_available: available,
          });
        });
      }
      return slots;
    }
  },

  /**
   * Get the next N dates with available slots.
   */
  getNextAvailableDates: async (attractionId, count = 5) => {
    try {
      const today = startOfDay(new Date());
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      
      const slots = await bookingService.getAvailabilitySlots(attractionId, year, month);
      
      // Agrupar slots por fecha
      const grouped = {};
      slots.forEach(s => {
        if (s.capacity_available > 0) {
          if (!grouped[s.slot_date]) grouped[s.slot_date] = [];
          grouped[s.slot_date].push({
            time: s.start_time,
            available: s.capacity_available
          });
        }
      });

      const results = Object.keys(grouped).sort().slice(0, count).map(date => ({
        date,
        slots: grouped[date]
      }));

      // Si no hay slots reales suficientes, rellenamos con fechas simuladas
      if (results.length < count) {
        let cursor = today;
        while (results.length < count) {
          cursor = addDays(cursor, 1);
          const dateStr = format(cursor, 'yyyy-MM-dd');
          if (!grouped[dateStr]) {
            results.push({
              date: dateStr,
              slots: [
                { time: '09:00', available: 15 },
                { time: '14:00', available: 15 }
              ]
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error in getNextAvailableDates:', error);
      return [];
    }
  },

  /**
   * Create a new booking (Checkout).
   */
  createBooking: async (bookingData) => {
    try {
      const storedSlot = JSON.parse(sessionStorage.getItem('checkout_slot') || '{}');
      const cartItems = JSON.parse(localStorage.getItem('cart-storage') || '{"state":{"items":[]}}').state?.items || [];
      const firstItem = cartItems[0] || {};

      // Validar que el slotId es un UUID real (36 chars con guiones).
      // Si es un ID simulado generado por el fallback, no se puede procesar un booking real.
      const rawSlotId = storedSlot.id || firstItem.scheduleId || bookingData.scheduleId || '';
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isRealSlot = UUID_REGEX.test(rawSlotId);

      if (!isRealSlot) {
        throw new Error(
          'No hay cupos reales disponibles para el horario seleccionado. ' +
          'Por favor selecciona una fecha y horario desde la página de la atracción e intenta de nuevo.'
        );
      }

      const payload = {
        slotId: rawSlotId,
        attractionId: firstItem.attractionId || bookingData.attractionId,
        attractionName: bookingData.attraction || firstItem.name,
        productTitle: bookingData.modalidad || firstItem.modalidad || 'General',
        languageId: 1,
        notes: bookingData.notas || '',
        contactName: bookingData.passengers?.[0]
          ? `${bookingData.passengers[0].first_name} ${bookingData.passengers[0].last_name}`
          : 'Contacto',
        contactEmail: JSON.parse(localStorage.getItem('user') || '{}').correo || '',
        passengers: bookingData.passengers.map(p => ({
          priceTierId: p.priceTierId || '00000000-0000-0000-0000-000000000000',
          priceTierLabel: p.ticket_category_name || 'Adulto',
          unitPrice: p.unit_price || 0,
          firstName: p.first_name,
          lastName: p.last_name,
          documentType: p.docType || p.document_type || 'pasaporte',
          documentNumber: p.docNumber || p.document_number || '12345678',
          quantity: p.quantity || 1
        }))
      };

      const response = await bookingApi.post('/admin-booking', payload);
      const data = response.data;
      return {
        id: data.id,
        pnr_code: data.pnrCode,
        total_amount: data.totalAmount,
        currency_code: data.currencyCode,
        status: data.statusName?.toLowerCase() || 'confirmed'
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al procesar la reserva.');
    }
  },

  /**
   * Get all bookings for the current user.
   */
  getUserBookings: async (userId) => {
    try {
      const response = await bookingApi.get('/admin-booking/user/history', {
        params: { page: 1, pageSize: 50 }
      });
      const items = response.data.items || [];
      return items.map(b => {
        // Generamos los pasajeros a partir de los tickets
        const passengers = [];
        (b.tickets || []).forEach(ticket => {
          for (let i = 0; i < ticket.quantity; i++) {
            passengers.push({
              first_name: 'Pasajero',
              last_name: (i + 1).toString(),
              ticket_category_name: ticket.categoryName,
              unit_price: ticket.unitPrice
            });
          }
        });

        return {
          id: b.id,
          pnr_code: b.pnrCode,
          attraction: b.attractionName,
          slot_date: b.slotDate,
          start_time: b.slotStartTime,
          total_amount: b.totalAmount,
          currency_code: b.currencyCode,
          status: b.statusName?.toLowerCase() || 'confirmed',
          passengers,
          created_at: b.createdAt
        };
      });
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  },

  /**
   * Search booking by PNR code.
   */
  getBookingByPnr: async (pnr) => {
    try {
      const response = await bookingApi.get(`/admin-booking/${pnr}`);
      const b = response.data;
      return {
        id: b.id,
        pnr_code: b.pnrCode,
        attraction: b.attractionName,
        slot_date: b.slotDate,
        start_time: b.slotStartTime,
        total_amount: b.totalAmount,
        currency_code: b.currencyCode,
        status: b.statusName?.toLowerCase() || 'confirmed',
        created_at: b.createdAt,
        passengers: (b.passengers || []).map(p => ({
          first_name: p.fullName.split(' ')[0] || 'Pasajero',
          last_name: p.fullName.split(' ').slice(1).join(' ') || '',
          ticket_category_name: p.priceTierLabel || 'Adulto',
          unit_price: p.unitPrice
        }))
      };
    } catch (error) {
      console.error('Error fetching booking by PNR:', error);
      throw new Error('Reserva no encontrada');
    }
  },

  /**
   * Get all bookings (admin).
   */
  getAllBookings: async (filters = {}) => {
    try {
      const params = {
        searchTerm: filters.pnr || undefined,
        statusId: filters.status === 'confirmed' ? 2 : filters.status === 'cancelled' ? 3 : undefined,
        pageNumber: 1,
        pageSize: 100
      };
      
      const response = await bookingApi.get('/admin-booking/management', { params });
      const items = response.data.items || [];
      return items.map(b => {
        const passengers = [];
        (b.tickets || []).forEach(ticket => {
          for (let i = 0; i < ticket.quantity; i++) {
            passengers.push({
              first_name: 'Pasajero',
              last_name: (i + 1).toString(),
              ticket_category_name: ticket.categoryName,
              unit_price: ticket.unitPrice
            });
          }
        });

        return {
          id: b.id,
          pnr_code: b.pnrCode,
          attraction: b.attractionName,
          slot_date: b.slotDate,
          start_time: b.slotStartTime,
          total_amount: b.totalAmount,
          currency_code: b.currencyCode,
          status: b.statusName?.toLowerCase() || 'confirmed',
          passengers,
          created_at: b.createdAt
        };
      });
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      return [];
    }
  },

  /**
   * Cancel a booking with a reason.
   */
  cancelBooking: async (bookingId, reason) => {
    try {
      // Usamos el endpoint del microservicio Booking que cancela por Guid
      const response = await bookingApi.post(`/booking/${bookingId}/cancel`);
      const apiResult = response.data;
      if (!apiResult.success) {
        throw new Error(apiResult.message || 'Error al cancelar la reserva');
      }
      return { success: true };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw new Error(error.response?.data?.message || 'Error al cancelar la reserva');
    }
  }
};

export default bookingService;
