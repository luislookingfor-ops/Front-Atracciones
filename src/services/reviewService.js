import { bookingApi } from './api';

const reviewService = {
  getByAttraction: async (atraccionId) => {
    try {
      const response = await bookingApi.get(`/review/attraction/${atraccionId}`);
      // Devuelve PagedResult<ReviewResponse> con una propiedad .items o directamente la lista
      const items = response.data.items || response.data || [];
      return items.map(r => ({
        id: r.id,
        usuarioNombre: r.clientName || 'Usuario',
        calificacion: r.overallRating || r.score || 5,
        titulo: r.title || '',
        comentario: r.comment || '',
        fecha: r.createdAt
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  create: async (reviewData) => {
    try {
      const payload = {
        pnrCode: reviewData.pnrCode || reviewData.pnr_code || '',
        overallRating: reviewData.calificacion || reviewData.rating || 5,
        title: reviewData.titulo || '',
        comment: reviewData.comentario || reviewData.comment || '',
        languageId: 1,
        ratings: []
      };
      const response = await bookingApi.post('/review', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }
};

export default reviewService;
