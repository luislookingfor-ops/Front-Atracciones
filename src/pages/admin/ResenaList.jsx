import { useState, useEffect } from 'react';
import { Trash2, Search, Star, User, MapPin } from 'lucide-react';
import { bookingApi } from '../../services/api';

const ResenaList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await bookingApi.get('/review/management', { params: { pageNumber: 1, pageSize: 100 } });
      const list = response.data.items || response.data || [];
      setItems(list.map(r => ({
        resenaId: r.id,
        calificacion: r.overallRating,
        comentario: r.comment || r.title || '',
        usuarioNombre: r.clientName || 'Usuario',
        atraccionNombre: '—'
      })));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar esta reseña?')) {
      try {
        await bookingApi.delete(`/review/${id}`);
        setItems(items.filter(i => i.resenaId !== id));
      } catch (error) {
        const msg = error.response?.data?.message || 'Error al eliminar la reseña.';
        alert(msg);
      }
    }
  };

  const filtered = items.filter(i => 
    i.comentario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.usuarioNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.atraccionNombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-4xl font-light text-sand-950">
          Moderación de <em className="italic">Reseñas</em>
        </h2>
        <p className="text-sand-500 text-sm mt-2">Gestiona los comentarios de los viajeros.</p>
      </div>

      <div className="bg-white border border-sand-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
          <input 
            type="text" placeholder="Buscar por comentario, usuario o atracción..."
            className="w-full pl-10 pr-4 py-2 bg-sand-50 border-none text-sm focus:ring-1 focus:ring-sand-300 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-sand-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-sand-50 border-b border-sand-200">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Calificación</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Comentario</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Usuario</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {filtered.map((item) => (
              <tr key={item.resenaId} className="hover:bg-sand-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3 h-3 ${s <= item.calificacion ? 'fill-sand-500 text-sand-500' : 'text-sand-200'}`} />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-sand-700 max-w-xs truncate">{item.comentario}</td>
                <td className="px-6 py-4">
                  <div className="text-xs font-medium text-sand-950 flex items-center gap-2">
                    <User className="w-3 h-3 text-sand-400" /> {item.usuarioNombre}
                  </div>
                  <div className="text-[10px] text-sand-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {item.atraccionNombre}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(item.resenaId)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResenaList;
