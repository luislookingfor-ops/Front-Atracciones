import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, ShoppingCart, ArrowRight, MessageSquare } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ReviewModal from './ReviewModal';
import { IMAGE_BASE_URL } from '../../services/api';

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1543429258-b9a39ade6de0?auto=format&fit=crop&w=800&q=80',
];

const AttractionCard = ({ attraction, index = 0 }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  let imgSrc = attraction.imagenUrl || UNSPLASH_IMAGES[index % UNSPLASH_IMAGES.length];
  if (imgSrc && !imgSrc.startsWith('http')) {
    imgSrc = `${IMAGE_BASE_URL}${imgSrc}`;
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
        className="group flex flex-col bg-sand-50 overflow-hidden"
      >
        {/* Image — tall aspect ratio, no border radius (Tidescape style) */}
        <div className="relative overflow-hidden aspect-[3/4]">
          <img
            src={imgSrc}
            alt={attraction.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Category badge — top left, minimal */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-sand-50/90 backdrop-blur-sm">
            <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-sand-800">
              {attraction.categoriaNombre || 'Atracción'}
            </span>
          </div>
          {/* Add to cart hover overlay */}
          <div className="absolute inset-0 bg-sand-950/0 group-hover:bg-sand-950/20 transition-all duration-300 flex items-end p-4 gap-2">
            <button
              onClick={() => addToCart(attraction)}
              id={`btn-add-to-cart-${attraction.id}`}
              className="flex-1 py-3 bg-sand-50 text-sand-950 text-[10px] font-medium tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
              title="Añadir al carrito"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Carrito
            </button>
            {user && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="flex-1 py-3 bg-ocean-600 text-white text-[10px] font-medium tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reseña
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="pt-5 pb-6 flex flex-col flex-grow px-4 md:px-0">
          {/* Location */}
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3 h-3 text-sand-500 flex-shrink-0" />
            <span className="text-xs text-sand-500 tracking-wide">
              {attraction.ciudadNombre}, {attraction.provinciaNombre}, {attraction.paisNombre}
            </span>
          </div>

          {/* Name */}
          <h3
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-xl font-medium text-sand-950 leading-tight mb-3 group-hover:text-ocean-700 transition-colors"
          >
            {attraction.nombre}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className="w-3 h-3 fill-sand-400 text-sand-400" />
            ))}
            <span className="text-xs text-sand-500 ml-1">4.8</span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-sand-200">
            <div>
              <span className="text-[10px] tracking-[0.15em] uppercase text-sand-500">Desde</span>
              <div
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                className="text-2xl font-semibold text-sand-950 leading-none mt-0.5"
              >
                ${attraction.precio || '45'}
              </div>
            </div>
            <button
              id={`btn-info-${attraction.id}`}
              className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-[0.12em] uppercase text-ocean-600 hover:text-ocean-700 transition-colors"
            >
              Ver más <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.article>

      <ReviewModal 
        attraction={attraction} 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        onReviewAdded={() => {
          // Opcional: recargar datos o mostrar mensaje de éxito
          alert('¡Reseña publicada con éxito!');
        }}
      />
    </>
  );
};

export default AttractionCard;
