import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Globe, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AttractionCard from '../components/features/AttractionCard';
import attractionService from '../services/attractionService';

const Catalog = () => {
  const [attractions, setAttractions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ pais: '', ciudad: '', categoria: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attrData, catData, countryData] = await Promise.all([
          attractionService.getAll(),
          attractionService.getCategories(),
          attractionService.getCountries()
        ]);
        setAttractions(attrData);
        setCategories(catData);
        setCountries(countryData);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAttractions = attractions.filter((item) => {
    const q = searchQuery.toLowerCase();
    const nombre = item.nombre?.toLowerCase() || '';
    const ciudad = item.ciudadNombre?.toLowerCase() || '';
    
    const matchSearch = nombre.includes(q) || ciudad.includes(q);
    const matchPais = !filters.pais || item.paisNombre === filters.pais;
    const matchCat = !filters.categoria || item.categoriaNombre === filters.categoria;
    
    return matchSearch && matchPais && matchCat;
  });

  const clearFilters = () => { setFilters({ pais: '', ciudad: '', categoria: '' }); setSearchQuery(''); };

  const hasFilters = searchQuery || filters.pais || filters.categoria || filters.ciudad;

  const selectClass = "w-full bg-transparent border-b border-sand-300 py-2.5 text-sand-800 text-sm focus:outline-none focus:border-sand-950 transition-colors";

  return (
    <div style={{ backgroundColor: '#fdfaf5' }} className="min-h-screen">

      {/* ─── Page Header ───────────────────────────── */}
      <div className="border-b border-sand-200 py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-ocean-600 mb-3 block">
            Nuestras Atracciones
          </span>
          <h1
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl md:text-6xl font-light text-sand-950 mb-4"
          >
            Explorar el <em className="italic">Mundo</em>
          </h1>
          <p className="text-sand-500 font-light max-w-xl">
            Descubre experiencias únicas cuidadosamente seleccionadas para el viajero moderno.
          </p>
        </div>
      </div>

      {/* ─── Search + Filter bar ────────────────────── */}
      <div className="border-b border-sand-200 py-5 sticky top-20 z-40" style={{ backgroundColor: '#fdfaf5' }}>
        <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
            <input
              type="text"
              id="catalog-search-input"
              placeholder="Buscar destino o ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-sand-300 text-sand-950 placeholder-sand-400 focus:outline-none focus:border-sand-950 transition-colors text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" /> Limpiar
              </button>
            )}
            <button
              id="btn-toggle-filters"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 text-xs font-medium tracking-[0.1em] uppercase transition-colors ${isFilterOpen ? 'text-ocean-600' : 'text-sand-700 hover:text-sand-950'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isFilterOpen ? 'Ocultar filtros' : 'Filtros'}
            </button>
            <span className="text-xs text-sand-400">
              {filteredAttractions.length} resultado{filteredAttractions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-sand-200 mt-5"
            >
              <div className="container mx-auto px-6 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-2 flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> País
                  </label>
                  <select value={filters.pais} onChange={(e) => setFilters({ ...filters, pais: e.target.value })} className={selectClass}>
                    <option value="">Todos los países</option>
                    {countries.map(p => <option key={p.id || p.nombre} value={p.nombre}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-2 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Categoría
                  </label>
                  <select value={filters.categoria} onChange={(e) => setFilters({ ...filters, categoria: e.target.value })} className={selectClass}>
                    <option value="">Todas las categorías</option>
                    {categories.map(c => <option key={c.id || c.nombre} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Ciudad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Roma"
                    value={filters.ciudad}
                    onChange={(e) => setFilters({ ...filters, ciudad: e.target.value })}
                    className={selectClass}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Grid ───────────────────────────────────── */}
      <div className="container mx-auto px-6 lg:px-12 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-sand-200 mb-4" />
                <div className="h-3 bg-sand-200 w-1/3 mb-2" />
                <div className="h-5 bg-sand-200 w-2/3 mb-2" />
                <div className="h-3 bg-sand-200 w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredAttractions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredAttractions.map((attr, i) => (
              <AttractionCard key={attr.id} attraction={attr} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <h2
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-3xl font-light text-sand-600 mb-4"
            >
              Sin resultados
            </h2>
            <p className="text-sand-400 text-sm mb-8 font-light">Intenta ajustar tus filtros de búsqueda.</p>
            <button onClick={clearFilters} className="text-xs font-medium tracking-[0.15em] uppercase border-b border-ocean-600 text-ocean-600 pb-1 hover:text-ocean-700">
              Ver todas las atracciones
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
