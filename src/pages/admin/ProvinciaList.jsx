import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Map } from 'lucide-react';
import { catalogApi } from '../../services/api';

const ProvinciaList = () => {
  const [items, setItems] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({ nombre: '', paisId: '', estado: true });

  useEffect(() => {
    fetchItemsAndCountries();
  }, []);

  const fetchItemsAndCountries = async () => {
    try {
      const response = await catalogApi.get('/location');
      const list = response.data || [];

      // Solo mostrar como provincias los nodos que tienen sub-hijos (3 niveles).
      // Los hijos hoja son ciudades directas y no deben aparecer aquí.
      const countryList = list
        .filter(n => n.type?.toLowerCase() === 'country')
        .map(n => ({
          paisId: n.id,
          nombre: n.name
        }));
      setCountries(countryList);

      // Solo incluir como provincias los nodos intermedios (hijos con sub-hijos)
      const provinces = [];
      list.forEach(c => {
        if (c.type?.toLowerCase() !== 'country') return;
        (c.children || []).forEach(child => {
          if ((child.children || []).length > 0) {
            // Tiene sub-hijos → es una provincia real
            provinces.push({
              provinciaId: child.id,
              nombre: child.name,
              paisId: c.id,
              estado: true
            });
          }
          // Si es hoja → es una ciudad directa, no se muestra aquí
        });
      });
      setItems(provinces);
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: currentItem.nombre,
        type: 'state',
        parentId: currentItem.paisId
      };

      if (currentItem.provinciaId) {
        await catalogApi.put(`/location/${currentItem.provinciaId}`, payload);
      } else {
        await catalogApi.post('/location', payload);
      }
      setIsModalOpen(false);
      fetchItemsAndCountries();
    } catch (error) {
      console.error('Error saving province:', error);
      alert('Error al guardar la provincia.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar esta provincia?')) {
      try {
        await catalogApi.delete(`/location/${id}`);
        setItems(items.filter(i => i.provinciaId !== id));
      } catch (error) {
        const msg = error.response?.data?.message || 'Error al eliminar la provincia.';
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
            Gestión de <em className="italic">Provincias / Estados</em>
          </h2>
          <p className="text-sand-500 text-sm mt-2">Administra las subdivisiones regionales.</p>
        </div>
        <button 
          onClick={() => { setCurrentItem({ nombre: '', paisId: '', estado: true }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-sand-950 text-sand-50 text-xs font-medium tracking-widest uppercase hover:bg-sand-800 transition-all"
        >
          <Plus className="w-4 h-4" /> Nueva Provincia
        </button>
      </div>

      <div className="bg-white border border-sand-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
          <input 
            type="text" placeholder="Buscar provincia..."
            className="w-full pl-10 pr-4 py-2 bg-sand-50 border-none text-sm focus:ring-1 focus:ring-sand-300 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-sand-200 overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-sand-400 italic">Cargando provincias...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-sand-50 border-b border-sand-200">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Nombre</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">País</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {filtered.map((item) => (
                <tr key={item.provinciaId} className="hover:bg-sand-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-sand-950 flex items-center gap-2">
                    <Map className="w-3 h-3 text-ocean-600" /> {item.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-sand-600">
                    {countries.find(c => c.paisId === item.paisId)?.nombre || 'Desconocido'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} className="p-2 text-ocean-600 hover:bg-ocean-50 rounded-full">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.provinciaId)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
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
              {currentItem.provinciaId ? 'Editar' : 'Nueva'} <em className="italic">Provincia</em>
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
                <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">País</label>
                <select 
                  required
                  className="w-full p-3 bg-sand-50 border border-sand-100 focus:ring-1 focus:ring-sand-300 outline-none"
                  value={currentItem.paisId}
                  onChange={(e) => setCurrentItem({ ...currentItem, paisId: e.target.value })}
                >
                  <option value="">Selecciona un país</option>
                  {countries.map(c => <option key={c.paisId} value={c.paisId}>{c.nombre}</option>)}
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

export default ProvinciaList;
