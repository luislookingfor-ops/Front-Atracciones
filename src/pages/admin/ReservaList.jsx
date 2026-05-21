import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Search, Filter, XCircle, CheckCircle } from 'lucide-react';
import { bookingApi } from '../../services/api';

const ReservaList = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      const response = await bookingApi.get('/admin-booking/management', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      const list = response.data.items || [];
      setReservas(list.map(r => ({
        reservaId: r.id,
        codigoLocalizador: r.pnrCode,
        usuarioNombre: r.clientName || r.clientEmail || 'Cliente',
        atraccionNombre: r.attractionName,
        cantidadPersonas: r.totalPassengers || 1,
        totalPagado: r.totalAmount,
        estadoReserva: r.statusName === 'Confirmed' ? 'Confirmada' : r.statusName === 'Cancelled' ? 'Cancelada' : 'Pendiente'
      })));
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('¿Deseas cancelar esta reserva?')) {
      try {
        await bookingApi.post(`/booking/${id}/cancel`);
        fetchReservas();
      } catch (error) {
        alert('Error al cancelar la reserva.');
      }
    }
  };

  const filteredReservas = reservas.filter(r => 
    r.codigoLocalizador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.usuarioNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.atraccionNombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-4xl font-light text-sand-950">
          Control de <em className="italic">Reservas</em>
        </h2>
        <p className="text-sand-500 text-sm mt-2">Seguimiento de compras y estado de localizadores.</p>
      </div>

      <div className="bg-white border border-sand-200 p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
          <input 
            type="text"
            placeholder="Buscar por localizador, usuario o atracción..."
            className="w-full pl-10 pr-4 py-2 bg-sand-50 border-none text-sm focus:ring-1 focus:ring-sand-300 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-sand-200 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sand-500 italic font-light">Cargando reservas...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sand-50 border-b border-sand-200">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Localizador</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Cliente</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Atracción</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium text-center">Pers.</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Total</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium">Estado</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sand-500 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {filteredReservas.map((r) => (
                  <tr key={r.reservaId} className="hover:bg-sand-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-ocean-700">{r.codigoLocalizador}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-sand-950">{r.usuarioNombre}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-sand-600">{r.atraccionNombre}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 text-xs text-sand-600 bg-sand-100 px-2 py-0.5 rounded-full">
                        <Users className="w-3 h-3" /> {r.cantidadPersonas}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-sand-950">${r.totalPagado.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-tighter font-bold rounded ${
                        r.estadoReserva === 'Confirmada' ? 'bg-green-100 text-green-700' : 
                        r.estadoReserva === 'Cancelada' ? 'bg-red-100 text-red-700' : 'bg-sand-100 text-sand-700'
                      }`}>
                        {r.estadoReserva === 'Confirmada' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {r.estadoReserva}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.estadoReserva !== 'Cancelada' && (
                        <button 
                          onClick={() => handleCancel(r.reservaId)}
                          className="text-xs text-red-600 hover:underline font-medium"
                        >
                          Cancelar
                        </button>
                      )}
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

export default ReservaList;
