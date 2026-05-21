import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';

const ReviewModal = ({ attraction, isOpen, onClose, onReviewAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await reviewService.create({
        calificacion: rating,
        comentario: comment,
        usuarioId: user.id,
        atraccionId: attraction.id,
        estado: true
      });
      setComment('');
      setRating(5);
      onReviewAdded();
      onClose();
    } catch (error) {
      // Mostrar el mensaje exacto del API si está disponible
      const apiMessage = error.response?.data?.message || error.response?.data?.errors?.[0] || error.message;
      const userMessage = apiMessage?.includes('reserva') || apiMessage?.includes('booking') || apiMessage?.includes('PNR')
        ? apiMessage
        : 'Para dejar una reseña necesitas haber completado una reserva de esta atracción. Verifica que tu reserva esté confirmada en "Mis Reservas".';
      alert(userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white max-w-md w-full p-8 border border-sand-200 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-sand-400 hover:text-sand-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-3xl font-light text-sand-950 mb-2">
          Dejar una <em className="italic">Reseña</em>
        </h3>
        <p className="text-sand-500 text-xs uppercase tracking-widest mb-6">Para: {attraction.nombre}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-3">Calificación</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    className={`w-6 h-6 ${(hover || rating) >= star ? 'fill-ocean-600 text-ocean-600' : 'text-sand-300'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Tu Comentario</label>
            <textarea
              required
              rows="4"
              className="w-full p-3 bg-sand-50 border border-sand-100 focus:ring-1 focus:ring-sand-300 outline-none text-sm"
              placeholder="Cuéntanos tu experiencia..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 bg-sand-950 text-sand-50 text-xs font-medium tracking-widest uppercase hover:bg-sand-800 transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Enviando...' : 'Publicar Reseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
