import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, ArrowRight, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import AttractionCard from '../components/features/AttractionCard';
import attractionService from '../services/attractionService';

const Home = () => {
  const [featuredAttractions, setFeaturedAttractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await attractionService.getAll();
        // Assuming we take the first 3 as featured
        setFeaturedAttractions(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching featured attractions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const stats = [
    { value: '500+', label: 'Atracciones' },
    { value: '80+', label: 'Países' },
    { value: '50K+', label: 'Viajeros' },
    { value: '4.9', label: 'Valoración' },
  ];

  return (
    <div>
      {/* ─── HERO SECTION ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-end pb-20 overflow-hidden">
        {/* Full bleed background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=90"
            className="w-full h-full object-cover"
            alt="Paisaje de viaje"
          />
          {/* Tidescape-style gradient: dark at bottom, lighter at top */}
          <div className="absolute inset-0 bg-gradient-to-t from-sand-950/85 via-sand-950/30 to-transparent" />
        </div>

        {/* Hero content — bottom-left aligned like Tidescape */}
        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Eyebrow tag */}
              <span className="inline-block text-xs font-medium tracking-[0.2em] uppercase text-sand-300 mb-6">
                Portal de Atracciones Turísticas
              </span>

              {/* Large serif heading — Tidescape style */}
              <h1
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-[1.05] mb-8"
              >
                Descubre el mundo con{' '}
                <em className="italic font-normal">Atracciones</em>
              </h1>

              <p className="text-sand-300 text-base md:text-lg leading-relaxed max-w-xl mb-10 font-light">
                Acceso exclusivo a las experiencias más increíbles alrededor del globo. Simple, elegante y seguro.
              </p>

              {/* CTA buttons — Tidescape rectangular style */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/atracciones"
                  id="hero-cta-explore"
                  className="inline-flex items-center justify-center px-8 py-4 bg-sand-50 text-sand-950 text-xs font-medium tracking-[0.1em] uppercase hover:bg-white transition-all duration-200"
                >
                  Explorar Catálogo <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  to="/registro"
                  id="hero-cta-register"
                  className="inline-flex items-center justify-center px-8 py-4 border border-sand-200/50 text-sand-100 text-xs font-medium tracking-[0.1em] uppercase hover:border-sand-100 hover:text-white transition-all duration-200"
                >
                  Crear Cuenta
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Stats strip — bottom right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="absolute bottom-0 right-6 lg:right-12 flex gap-8 pb-20"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  className="text-3xl font-semibold text-white"
                >
                  {s.value}
                </div>
                <div className="text-[10px] tracking-[0.15em] uppercase text-sand-400">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent to-sand-300 mx-auto" />
        </motion.div>
      </section>

      {/* ─── INTRO / ABOUT SECTION ──────────────────────────────────── */}
      <section className="py-28 bg-sand-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-ocean-600 mb-4 block">
                Sobre Nosotros
              </span>
              <h2
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                className="text-4xl md:text-5xl font-light text-sand-950 leading-tight mb-6"
              >
                Viajes que dejan <em className="italic">huella</em> en el alma
              </h2>
              <p className="text-sand-600 leading-relaxed mb-6 font-light">
                Nuestro microservicio de atracciones conecta a viajeros apasionados con las experiencias más auténticas del planeta. Desde maravillas históricas hasta paraísos naturales inexplorados.
              </p>
              <p className="text-sand-600 leading-relaxed mb-10 font-light">
                Cada destino ha sido cuidadosamente curado para garantizar que tu próximo viaje supere todas las expectativas.
              </p>
              <Link
                to="/atracciones"
                className="inline-flex items-center text-xs font-medium tracking-[0.15em] uppercase text-sand-950 border-b border-sand-950 pb-1 hover:text-ocean-600 hover:border-ocean-600 transition-colors"
              >
                Ver todas las atracciones <ArrowRight className="ml-2 w-3 h-3" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80"
                  alt="Viaje de lujo"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating card accent */}
              <div className="absolute -bottom-6 -left-6 bg-sand-50 p-6 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-4 h-4 fill-sand-500 text-sand-500" />
                  <span className="text-xs font-medium tracking-widest uppercase text-sand-600">Calificación</span>
                </div>
                <div
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  className="text-4xl font-semibold text-sand-950"
                >
                  4.9
                </div>
                <p className="text-xs text-sand-500 mt-1">Basado en 12,000+ reseñas</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES STRIP ─────────────────────────────────────────── */}
      <section className="py-20 bg-sand-100 border-y border-sand-200">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-sand-200">
            {[
              { icon: MapPin, num: '01', title: 'Variedad Increíble', desc: 'Miles de atracciones en más de 80 países disponibles al instante.' },
              { icon: ShieldCheck, num: '02', title: 'Pago Seguro', desc: 'Transacciones encriptadas y múltiples métodos de pago.' },
              { icon: Zap, num: '03', title: 'Acceso Instantáneo', desc: 'Sin colas, sin esperas. Entradas digitales al momento.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="px-10 py-12 first:pl-0 last:pr-0"
              >
                <span className="text-xs tracking-[0.2em] text-sand-400 mb-4 block">{f.num}</span>
                <h3
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  className="text-2xl font-medium text-sand-950 mb-3"
                >
                  {f.title}
                </h3>
                <p className="text-sand-600 text-sm leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED ATTRACTIONS ───────────────────────────────────── */}
      <section className="py-28 bg-sand-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-ocean-600 mb-4 block">
                Catálogo
              </span>
              <h2
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                className="text-4xl md:text-5xl font-light text-sand-950 leading-tight"
              >
                Atracciones <em className="italic">Destacadas</em>
              </h2>
            </div>
            <Link
              to="/atracciones"
              className="inline-flex items-center text-xs font-medium tracking-[0.15em] uppercase text-ocean-600 border-b border-ocean-600 pb-1 hover:text-ocean-700 hover:border-ocean-700 transition-colors whitespace-nowrap"
            >
              Ver todas <ArrowRight className="ml-2 w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-sand-200 mb-4" />
                  <div className="h-4 bg-sand-200 w-1/2 mb-2" />
                  <div className="h-6 bg-sand-200 w-3/4" />
                </div>
              ))
            ) : featuredAttractions.length > 0 ? (
              featuredAttractions.map((attr) => (
                <AttractionCard key={attr.atraccionId || attr.id} attraction={attr} />
              ))
            ) : (
              <div className="col-span-3 text-center py-10 text-sand-500 italic">
                No hay atracciones disponibles en este momento.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIAL / CTA SECTION ──────────────────────────────── */}
      <section
        className="relative py-32 overflow-hidden"
        style={{ backgroundColor: '#1c1611' }}
      >
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="background"
        />
        <div className="relative z-10 container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-sand-400 mb-6 block">
              Únete a nosotros
            </span>
            <h2
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-5xl md:text-7xl font-light text-white leading-tight mb-8 max-w-3xl mx-auto"
            >
              ¿Listo para tu próxima <em className="italic">aventura</em>?
            </h2>
            <p className="text-sand-400 text-lg font-light mb-12 max-w-xl mx-auto">
              Únete a miles de viajeros que ya están explorando el mundo con nosotros.
            </p>
            <Link
              to="/registro"
              className="inline-flex items-center px-10 py-5 bg-sand-50 text-sand-950 text-xs font-medium tracking-[0.15em] uppercase hover:bg-white transition-all duration-200"
            >
              Comenzar Ahora <ArrowRight className="ml-3 w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
