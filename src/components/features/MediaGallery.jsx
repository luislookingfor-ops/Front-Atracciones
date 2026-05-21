import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MediaGallery — Lightbox with keyboard navigation and zoom
 * Props:
 *   images: [{ url, alt }]
 *   className?: string
 */
const MediaGallery = ({ images = [], className = '' }) => {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(() => setActive((a) => (a - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive((a) => (a + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, prev, next]);

  if (!images.length) return null;

  return (
    <>
      {/* ── Gallery grid ── */}
      <div className={`grid gap-2 ${className}`} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {images.map((img, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="relative aspect-[4/3] overflow-hidden cursor-pointer group bg-sand-100"
            onClick={() => { setActive(i); setLightbox(true); }}
          >
            <img
              src={img.url}
              alt={img.alt || `Imagen ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-sand-950/0 group-hover:bg-sand-950/20 transition-colors duration-300 flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            {i === 0 && (
              <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest bg-sand-950 text-sand-50 px-2 py-1 font-medium">
                Principal
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(28,22,17,0.94)' }}
            onClick={() => setLightbox(false)}
          >
            {/* Close */}
            <button
              className="absolute top-6 right-6 p-2 text-sand-300 hover:text-white transition-colors"
              onClick={() => setLightbox(false)}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev */}
            <button
              className="absolute left-6 p-3 text-sand-300 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Image */}
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl max-h-[80vh] mx-16"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[active].url}
                alt={images[active].alt}
                className="max-h-[80vh] max-w-full object-contain"
              />
              <div className="mt-3 text-center text-sand-400 text-xs tracking-widest uppercase">
                {active + 1} / {images.length}
                {images[active].alt && (
                  <span className="ml-3 text-sand-300">{images[active].alt}</span>
                )}
              </div>
            </motion.div>

            {/* Next */}
            <button
              className="absolute right-6 p-3 text-sand-300 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActive(i); }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${i === active ? 'bg-white scale-125' : 'bg-sand-600 hover:bg-sand-400'}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MediaGallery;
