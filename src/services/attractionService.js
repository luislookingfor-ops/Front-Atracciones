import api from './api';

const attractionService = {
  /**
   * Get all attractions with optional filtering
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/Atraccion', { params });
      return response.data.map(item => ({
        ...item,
        id: item.atraccionId,
        precio: item.precioBase,
        ciudadNombre: item.ciudadNombre || item.CiudadNombre || '',
        provinciaNombre: item.provinciaNombre || item.ProvinciaNombre || '',
        paisNombre: item.paisNombre || item.PaisNombre || ''
      }));
    } catch (error) {
      console.error('Error fetching attractions:', error);
      throw error;
    }
  },

  /**
   * Get a single attraction by ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/Atraccion/${id}`);
      return {
        ...response.data,
        id: response.data.atraccionId,
        precio: response.data.precioBase,
        ciudadNombre: response.data.ciudadNombre || response.data.CiudadNombre || '',
        provinciaNombre: response.data.provinciaNombre || response.data.ProvinciaNombre || '',
        paisNombre: response.data.paisNombre || response.data.PaisNombre || ''
      };
    } catch (error) {
      console.error(`Error fetching attraction ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all categories
   */
  getCategories: async () => {
    try {
      const response = await api.get('/Categoria');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get all countries
   */
  getCountries: async () => {
    try {
      const response = await api.get('/Pais');
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }
};

export default attractionService;
