import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MapPin, 
  Image as ImageIcon,
  Users,
  LayoutDashboard,
  Tag,
  CalendarCheck,
  LogOut,
  ChevronRight,
  Settings,
  Zap,
  Globe,
  Star
} from 'lucide-react';
import api, { IMAGE_BASE_URL } from '../../services/api';
import UserList from './UserList';
import CategoryList from './CategoryList';
import ReservaList from './ReservaList';
import ActividadList from './ActividadList';
import PaisList from './PaisList';
import ProvinciaList from './ProvinciaList';
import ResenaList from './ResenaList';
import CiudadList from './CiudadList';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('atracciones');
  const [atracciones, setAtracciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'atracciones') {
      fetchAtracciones();
    }
  }, [activeTab]);

  const fetchAtracciones = async () => {
    setLoading(true);
    try {
      const response = await api.get('/Atraccion');
      setAtracciones(response.data);
    } catch (error) {
      console.error('Error fetching attractions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta atracción?')) {
      try {
        await api.delete(`/Atraccion/${id}`);
        setAtracciones(atracciones.filter(a => a.atraccionId !== id));
      } catch (error) {
        alert('Error al eliminar la atracción.');
      }
    }
  };

  const filteredAtracciones = atracciones.filter(a => 
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.ciudadNombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    { id: 'atracciones', label: 'Atracciones', icon: LayoutDashboard },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'categorias', label: 'Categorías', icon: Tag },
    { id: 'actividades', label: 'Actividades', icon: Zap },
    { id: 'paises', label: 'Países', icon: Globe },
    { id: 'provincias', label: 'Provincias', icon: MapPin },
    { id: 'ciudades', label: 'Ciudades', icon: MapPin },
    { id: 'reservas', label: 'Reservas', icon: CalendarCheck },
    { id: 'resenas', label: 'Reseñas', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-sand-200 flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-8 border-b border-sand-100">
          <Link to="/" className="block">
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-2xl font-semibold tracking-tight text-sand-950 uppercase">
              Tidescape <em className="italic font-light">Admin</em>
            </h1>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sand-400 font-bold mb-4 px-2">Gestión</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all duration-300 group ${
                activeTab === item.id 
                ? 'bg-sand-950 text-sand-50 shadow-lg shadow-sand-900/10' 
                : 'text-sand-600 hover:bg-sand-50 hover:text-sand-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-sand-50' : 'text-sand-400 group-hover:text-sand-600'}`} />
                <span className="font-medium tracking-wide">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight className="w-3 h-3 text-sand-300" />}
            </button>
          ))}
          
          <div className="pt-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-sand-400 font-bold mb-4 px-2">Sistema</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-sand-600 hover:bg-sand-50 transition-colors">
              <Settings className="w-4 h-4 text-sand-400" />
              <span className="font-medium tracking-wide">Configuración</span>
            </button>
            <button 
              onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="font-medium tracking-wide">Cerrar Sesión</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-12">
        {activeTab === 'atracciones' && (
          <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-2">
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-5xl font-light text-sand-950">
                  Catálogo de <em className="italic">Atracciones</em>
                </h2>
                <p className="text-sand-500 font-light max-w-xl">
                  Gestiona las experiencias de lujo disponibles para nuestros huéspedes en todo el mundo.
                </p>
              </div>
              <Link 
                to="/admin/atracciones/new"
                className="flex items-center gap-3 px-8 py-4 bg-sand-950 text-sand-50 text-xs font-medium tracking-widest uppercase hover:bg-sand-800 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Crear Atracción
              </Link>
            </div>

            <div className="bg-white border border-sand-200 p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
                <input 
                  type="text"
                  placeholder="Buscar por nombre o ciudad..."
                  className="w-full pl-12 pr-6 py-3 bg-sand-50 border-none text-sm placeholder:text-sand-400 focus:ring-1 focus:ring-sand-200 outline-none transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 text-sand-400 text-xs font-medium px-4 border-l border-sand-100 h-10 uppercase tracking-widest">
                <span>Total: {atracciones.length}</span>
              </div>
            </div>

            <div className="bg-white border border-sand-200 overflow-hidden shadow-sm">
              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-sand-100 border-t-sand-950 rounded-full animate-spin"></div>
                  <span className="text-sand-500 italic font-light tracking-widest uppercase text-[10px]">Cargando inventario...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-sand-50 border-b border-sand-200">
                        <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-sand-500 font-bold">Imagen</th>
                        <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-sand-500 font-bold">Atracción</th>
                        <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-sand-500 font-bold">Ubicación</th>
                        <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-sand-500 font-bold text-center">Precio</th>
                        <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-sand-500 font-bold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-100">
                      {filteredAtracciones.map((a) => (
                        <tr key={a.atraccionId} className="group hover:bg-sand-50/50 transition-all duration-300">
                          <td className="px-8 py-5">
                            {a.imagenUrl ? (
                              <img 
                                src={a.imagenUrl.startsWith('http') ? a.imagenUrl : `${IMAGE_BASE_URL}${a.imagenUrl}`} 
                                alt={a.nombre}
                                className="w-16 h-12 object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-sand-100 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-sand-300" />
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-5">
                            <div className="font-semibold text-sand-950 tracking-tight">{a.nombre}</div>
                            <div className="text-[10px] text-sand-400 uppercase tracking-widest mt-1">Capacidad: {a.capacidadMaxima}</div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-sand-600 text-sm italic">
                              <MapPin className="w-3 h-3 text-sand-400" />
                              {a.ciudadNombre || 'Quito, EC'}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="font-medium text-sand-950">${a.precioBase}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Link 
                                to={`/admin/atracciones/edit/${a.atraccionId}`}
                                className="p-2 text-ocean-600 hover:bg-ocean-50 rounded-full transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <button 
                                onClick={() => handleDelete(a.atraccionId)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'usuarios' && <UserList />}
        {activeTab === 'categorias' && <CategoryList />}
        {activeTab === 'actividades' && <ActividadList />}
        {activeTab === 'paises' && <PaisList />}
        {activeTab === 'provincias' && <ProvinciaList />}
        {activeTab === 'ciudades' && <CiudadList />}
        {activeTab === 'reservas' && <ReservaList />}
        {activeTab === 'resenas' && <ResenaList />}
      </main>
    </div>
  );
};

export default AdminDashboard;
