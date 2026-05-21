import { createContext, useContext, useState, useEffect } from 'react';
import { identifyApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    let response;
    try {
      // Intentar primero como cliente regular
      response = await identifyApi.post('/auth/login', { email, password });
    } catch (error) {
      // Si falla, intentamos como administrador/partner
      try {
        response = await identifyApi.post('/auth/login-admin', { email, password });
      } catch (adminError) {
        return { 
          success: false, 
          message: adminError.response?.data?.message || error.response?.data?.message || 'Error al iniciar sesión' 
        };
      }
    }

    try {
      const { accessToken, user: apiUser } = response.data;
      const rol = apiUser.roles && apiUser.roles.length > 0 ? apiUser.roles[0] : 'Client';
      const userData = { 
        id: apiUser.userId, 
        nombre: `${apiUser.firstName} ${apiUser.lastName}`.trim(), 
        correo: apiUser.email, 
        rol 
      };
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (parseError) {
      return { 
        success: false, 
        message: 'Error al procesar los datos de sesión' 
      };
    }
  };

  const isAdmin = () => user?.rol === 'Admin';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const dto = {
        email: userData.email,
        password: userData.password,
        firstName: userData.nombre || '',
        lastName: userData.apellido || '',
      };
      await identifyApi.post('/auth/register', dto);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error en el registro' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
