import { catalogApi } from './api';

const attractionService = {
  /**
   * Get all attractions with optional filtering
   */
  getAll: async (params = {}) => {
    try {
      const response = await catalogApi.get('/attraction', { params });
      const items = response.data.items || response.data || [];
      return items.map(item => ({
        ...item,
        id: item.id,
        nombre: item.name,
        precio: item.startingPrice || 0,
        imagenUrl: item.mainImageUrl || '',
        ciudadNombre: item.locationName || '',
        provinciaNombre: item.locationName || '',
        paisNombre: item.locationCountryCode || '',
        categoriaNombre: item.categoryName || ''
      }));
    } catch (error) {
      console.error('Error fetching attractions:', error);
      throw error;
    }
  },

  /**
   * Get a single attraction by ID or Slug
   */
  getById: async (id) => {
    try {
      const response = await catalogApi.get(`/attraction/${id}`);
      const data = response.data;

      // Obtener el precio más bajo de los price tiers de los productos
      let precio = 0;
      if (data.products && data.products.length > 0) {
        const prices = data.products.flatMap(p => p.priceTiers || []).map(t => t.price);
        if (prices.length > 0) {
          precio = Math.min(...prices);
        }
      }

      // Mapear imagen principal de la galería si existe
      const mainMedia = data.gallery?.find(m => m.isMain) || data.gallery?.[0];
      const imagenUrl = mainMedia ? mainMedia.url : '';

      return {
        ...data,
        id: data.id,
        nombre: data.name,
        descripcion: data.descriptionFull || data.descriptionShort || '',
        precio: precio,
        imagenUrl: imagenUrl,
        ciudadNombre: data.locationName || '',
        provinciaNombre: data.locationName || '',
        paisNombre: data.locationCountryCode || '',
        categoriaNombre: data.categoryName || '',
        capacidadMaxima: data.products?.[0]?.maxGroupSize || 20,
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
      const response = await catalogApi.get('/category');
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
      const response = await catalogApi.get('/location');
      // Filtramos las ubicaciones de nivel superior (países)
      const locations = response.data || [];
      const countries = locations.filter(l => !l.parentId || l.type?.toLowerCase() === 'country');
      return countries;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }
};

export default attractionService;
