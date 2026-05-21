import { useState, useEffect } from 'react';
import { Trash2, Search, UserPlus, Shield } from 'lucide-react';
import { identifyApi } from '../../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await identifyApi.get('/user');
      // El backend devuelve un PagedResult con .items o una lista directa
      const list = response.data.items || response.data || [];
      setUsers(list.map(u => ({
        usuarioId: u.id,
        nombreUsuario: u.name,
        correo: u.email,
        estado: u.isActive,
        rol: u.role
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await identifyApi.delete(`/user/${id}`);
        setUsers(users.filter(u => u.usuarioId !== id));
      } catch (error) {
        alert('Error al eliminar el usuario.');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-4xl font-light text-sand-950">
            Gestión de <em className="italic">Usuarios</em>
          </h2>
          <p className="text-sand-500 text-sm mt-2">Administra los accesos y roles del sistema.</p>
        </div>
      </div>

      <div className="bg-white border border-sand-200 p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
          <input 
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-10 pr-4 py-2 bg-sand-50 border-none text-sm focus:ring-1 focus:ring-sand-300 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-sand-200 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sand-500 italic font-light">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-sand-50 border-b border-sand-200">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Nombre</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Correo</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Estado</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {filteredUsers.map((u) => (
                  <tr key={u.usuarioId} className="hover:bg-sand-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sand-200 rounded-full flex items-center justify-center text-sand-600 text-xs font-bold">
                          {u.nombreUsuario.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="font-medium text-sand-950">{u.nombreUsuario}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-sand-600">{u.correo}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[9px] uppercase tracking-tighter font-bold rounded ${u.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(u.usuarioId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
