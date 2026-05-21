import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { identifyApi } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async ({ email, password }) => {
        set({ loading: true });
        try {
          const response = await identifyApi.post('/auth/login', { email, password });
          const { accessToken, user: apiUser } = response.data;
          const rol = apiUser.roles && apiUser.roles.length > 0 ? apiUser.roles[0] : 'Client';
          const userData = {
            id: apiUser.userId,
            nombre: `${apiUser.firstName} ${apiUser.lastName}`.trim(),
            correo: apiUser.email,
            rol,
          };
          localStorage.setItem('token', accessToken);
          localStorage.setItem('user', JSON.stringify(userData));
          set({ user: userData, token: accessToken, loading: false });
          return { success: true };
        } catch (error) {
          set({ loading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Error al iniciar sesión',
          };
        }
      },

      register: async (userData) => {
        set({ loading: true });
        try {
          const dto = {
            email: userData.email,
            password: userData.password,
            firstName: userData.nombre || '',
            lastName: userData.apellido || '',
          };
          await identifyApi.post('/auth/register', dto);
          set({ loading: false });
          return { success: true };
        } catch (error) {
          set({ loading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Error en el registro',
          };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
      },

      isAdmin: () => get().user?.rol === 'Admin',
      isAuthenticated: () => !!get().user,

      // Hydrate from localStorage on app start
      hydrate: () => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
          set({ user: JSON.parse(storedUser), token });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
