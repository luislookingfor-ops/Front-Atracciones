import api from './api';

const reviewService = {
  getByAttraction: async (atraccionId) => {
    try {
      const response = await api.get('/Resena', { params: { atraccionId } });
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  create: async (reviewData) => {
    try {
      const response = await api.post('/Resena', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }
};

export default reviewService;
