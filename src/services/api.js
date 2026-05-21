import axios from 'axios';

// ── Helper: crea un cliente Axios con interceptores de JWT y manejo de 401 ──
function createApiClient(baseURL) {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request interceptor — adjunta el token JWT si existe
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — limpia sesión en 401 y desempaqueta ApiResponse
  client.interceptors.response.use(
    (response) => {
      if (response.data) {
        const hasSuccess = response.data.hasOwnProperty('success') || response.data.hasOwnProperty('Success');
        const hasData = response.data.hasOwnProperty('data') || response.data.hasOwnProperty('Data');
        if (hasSuccess && hasData) {
          const unwrappedData = response.data.data !== undefined ? response.data.data : response.data.Data;
          return {
            ...response,
            data: unwrappedData
          };
        }
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('unauthorized'));
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

// ══════════════════════════════════════════════════════════════
// 4 clientes independientes — uno por microservicio
// ══════════════════════════════════════════════════════════════

/** Microservicio de Identidad (auth, users, clients) */
export const identifyApi = createApiClient(
  import.meta.env.VITE_IDENTIFY_API_URL
);

/** Microservicio de Catálogo (attractions, categories, locations, tags, media, etc.) */
export const catalogApi = createApiClient(
  import.meta.env.VITE_CATALOG_API_URL
);

/** Microservicio de Reservas (bookings, reviews, availability) */
export const bookingApi = createApiClient(
  import.meta.env.VITE_BOOKING_API_URL
);

/** Microservicio de Facturación (billing, payments) */
export const billingApi = createApiClient(
  import.meta.env.VITE_BILLING_API_URL
);

// ── Backward-compatible default export (apunta a Catalog) ──
// Esto evita romper imports existentes que hacen `import api from './api'`
// mientras se migran gradualmente los archivos.
const api = catalogApi;
export default api;

// ── Utilidad para construir URLs de imagen ──
// Las imágenes se almacenan con rutas relativas en el catálogo
export const IMAGE_BASE_URL = (import.meta.env.VITE_CATALOG_API_URL || '').split('/api')[0];
