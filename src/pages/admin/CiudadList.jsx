import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, MapPin } from 'lucide-react';
import { catalogApi } from '../../services/api';

const CiudadList = () => {
  const [items, setItems] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({ nombre: '', provinciaId: '', estado: true });

  useEffect(() => {
    fetchItemsAndProvinces();
  }, []);

  const fetchItemsAndProvinces = async () => {
    try {
      const response = await catalogApi.get('/location');
      const list = response.data || [];

      // Extract provinces
      const provinceList = [];
      list.forEach(c => {
        if (c.type === 'country') {
          (c.children || []).forEach(s => {
            provinceList.push({
              provinciaId: s.id,
              nombre: s.name
            });
          });
        }
      });
      setProvinces(provinceList);

      // Extract cities
      const cities = [];
      list.forEach(c => {
        if (c.type === 'country') {
          (c.children || []).forEach(s => {
            (s.children || []).forEach(city => {
              cities.push({
                ciudadId: city.id,
                nombre: city.name,
                provinciaId: s.id,
                estado: true
              });
            });
          });
        }
      });
      setItems(cities);
    } catch (error) {
      console.error('Error fetching cities and provinces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: currentItem.nombre,
        type: 'city',
        parentId: currentItem.provinciaId
      };

      if (currentItem.ciudadId) {
        await catalogApi.put(`/location/${currentItem.ciudadId}`, payload);
      } else {
        await catalogApi.post('/location', payload);
      }
      setIsModalOpen(false);
      fetchItemsAndProvinces();
    } catch (error) {
      console.error('Error saving city:', error);
      alert('Error al guardar la ciudad.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar esta ciudad?')) {
      try {
        await catalogApi.delete(`/location/${id}`);
        setItems(items.filter(i => i.ciudadId !== id));
      } catch (error) {
        const msg = error.response?.data?.message || 'Error al eliminar la ciudad.';
        alert(msg);
      }
    }
  };

  const filtered = items.filter(i => i.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-4xl font-light text-sand-950">
            Gestión de <em className="italic">Ciudades</em>
          </h2>
          <p className="text-sand-500 text-sm mt-2">Administra los destinos específicos.</p>
        </div>
        <button 
          onClick={() => { setCurrentItem({ nombre: '', provinciaId: '', estado: true }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-sand-950 text-sand-50 text-xs font-medium tracking-widest uppercase hover:bg-sand-800 transition-all"
        >
          <Plus className="w-4 h-4" /> Nueva Ciudad
        </button>
      </div>

      <div className="bg-white border border-sand-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
          <input 
            type="text" placeholder="Buscar ciudad..."
            className="w-full pl-10 pr-4 py-2 bg-sand-50 border-none text-sm focus:ring-1 focus:ring-sand-300 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-sand-200 overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-sand-400 italic">Cargando ciudades...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-sand-50 border-b border-sand-200">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Nombre</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Provincia</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {filtered.map((item) => (
                <tr key={item.ciudadId} className="hover:bg-sand-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-sand-950 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-ocean-600" /> {item.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-sand-600">
                    {provinces.find(p => p.provinciaId === item.provinciaId)?.nombre || 'Desconocido'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} className="p-2 text-ocean-600 hover:bg-ocean-50 rounded-full">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.ciudadId)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 border border-sand-200">
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-3xl font-light text-sand-950 mb-6">
              {currentItem.ciudadId ? 'Editar' : 'Nueva'} <em className="italic">Ciudad</em>
            </h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Nombre</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-sand-50 border border-sand-100 focus:ring-1 focus:ring-sand-300 outline-none"
                  value={currentItem.nombre}
                  onChange={(e) => setCurrentItem({ ...currentItem, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Provincia</label>
                <select 
                  required
                  className="w-full p-3 bg-sand-50 border border-sand-100 focus:ring-1 focus:ring-sand-300 outline-none"
                  value={currentItem.provinciaId}
                  onChange={(e) => setCurrentItem({ ...currentItem, provinciaId: e.target.value })}
                >
                  <option value="">Selecciona una provincia</option>
                  {provinces.map(p => <option key={p.provinciaId} value={p.provinciaId}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-sand-200 text-xs uppercase tracking-widest text-sand-600 hover:bg-sand-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-sand-950 text-sand-50 text-xs font-medium tracking-widest uppercase hover:bg-sand-800">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CiudadList;
