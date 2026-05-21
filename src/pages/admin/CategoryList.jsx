import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Tag } from 'lucide-react';
import { catalogApi } from '../../services/api';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ nombre: '', estado: true });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await catalogApi.get('/category');
      const list = response.data.items || response.data || [];
      setCategories(list.map(c => ({ id: c.id, nombre: c.name, estado: c.isPublished ?? true })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: currentCategory.nombre };
      if (currentCategory.id) {
        await catalogApi.put(`/category/${currentCategory.id}`, payload);
      } else {
        await catalogApi.post('/category', payload);
      }
      setIsModalOpen(false);
      fetchCategories();
      setCurrentCategory({ nombre: '', estado: true });
    } catch (error) {
      alert('Error al guardar la categoría.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        await catalogApi.delete(`/category/${id}`);
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        alert('Error al eliminar la categoría. Verifique si tiene atracciones asociadas.');
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-4xl font-light text-sand-950">
            Gestión de <em className="italic">Categorías</em>
          </h2>
          <p className="text-sand-500 text-sm mt-2">Organiza las atracciones por tipo.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentCategory({ nombre: '', estado: true });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-sand-950 text-sand-50 text-xs font-medium tracking-widest uppercase hover:bg-sand-800 transition-all duration-300"
        >
          <Plus className="w-4 h-4" /> Nueva Categoría
        </button>
      </div>

      <div className="bg-white border border-sand-200 p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
          <input 
            type="text"
            placeholder="Buscar por nombre..."
            className="w-full pl-10 pr-4 py-2 bg-sand-50 border-none text-sm focus:ring-1 focus:ring-sand-300 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-sand-200 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sand-500 italic font-light">Cargando categorías...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-sand-50 border-b border-sand-200">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Nombre</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Estado</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-sand-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-sand-950">{c.nombre}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[9px] uppercase tracking-tighter font-bold rounded ${c.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setCurrentCategory(c);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-ocean-600 hover:bg-ocean-50 rounded-full transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 shadow-2xl border border-sand-200">
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-3xl font-light text-sand-950 mb-6">
              {currentCategory.id ? 'Editar' : 'Nueva'} <em className="italic">Categoría</em>
            </h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Nombre</label>
                <input 
                  type="text"
                  required
                  className="w-full p-3 bg-sand-50 border border-sand-100 focus:ring-1 focus:ring-sand-300 outline-none transition-all"
                  value={currentCategory.nombre}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, nombre: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  id="cat-estado"
                  className="w-4 h-4 accent-sand-950"
                  checked={currentCategory.estado}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, estado: e.target.checked })}
                />
                <label htmlFor="cat-estado" className="text-[10px] uppercase tracking-widest text-sand-500 font-medium cursor-pointer">Activa</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-sand-200 text-xs uppercase tracking-widest text-sand-600 hover:bg-sand-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-sand-950 text-sand-50 text-xs font-medium tracking-widest uppercase hover:bg-sand-800 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
