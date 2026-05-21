import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, ArrowLeft, Globe, Tag, List, MapPin, Package,
  Plus, Trash2, GripVertical, Eye, EyeOff, Pause, Play, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { catalogApi } from '../../services/api';

const TABS = [
  { id: 'general',     label: 'General',     icon: Globe },
  { id: 'ubicacion',   label: 'Ubicación',   icon: MapPin },
  { id: 'tags',        label: 'Tags',        icon: Tag },
  { id: 'inclusiones', label: 'Inclusiones', icon: Package },
  { id: 'itinerario',  label: 'Itinerario',  icon: List },
];

const MOCK_TAGS = ['Aventura', 'Cultural', 'Gastronómico', 'Naturaleza', 'Histórico', 'Familiar', 'Nocturno', 'Acuático', 'Premium', 'Eco-turismo'];
const MOCK_INCLUSIONS = ['Guía bilingüe', 'Transporte de retorno', 'Seguro de viajero', 'Almuerzo', 'Entrada principal', 'Fotografías', 'Propinas', 'Equipo de seguridad', 'Snack de bienvenida'];

const emptyStop = () => ({ id: Date.now().toString(), name: '', description: '', stayTimeMinutes: 30, latitude: 0, longitude: 0, stopNumber: 1, admissionType: 'included' });

const EditAttraction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precioBase: '',
    capacidadMaxima: '',
    categoriaId: '',
    imagenUrl: '',
    publicada: true,
    activa: true,
    paisId: '',
    provinciaId: '',
    ciudadId: '',
    latitud: '',
    longitud: '',
    direccion: '',
    selectedTags: [],
    incluidos: [],
    excluidos: [],
    stops: [emptyStop()],
  });

  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch initial configuration data (Locations & Categories)
  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch Categories
        const catRes = await catalogApi.get('/category');
        const catList = catRes.data.items || catRes.data || [];
        const formattedCats = catList.map(c => ({ id: c.id, nombre: c.name }));
        setCategories(formattedCats);

        // Fetch Locations Hierarchy
        const locRes = await catalogApi.get('/location');
        const nodes = locRes.data || [];
        const allCountries = [];
        const allProvinces = [];
        const allCities = [];

        nodes.forEach(country => {
          if (country.type === 'country') {
            allCountries.push({ id: country.id, nombre: country.name });
            (country.children || []).forEach(state => {
              allProvinces.push({ id: state.id, nombre: state.name, countryId: country.id });
              (state.children || []).forEach(city => {
                allCities.push({ id: city.id, nombre: city.name, provinceId: state.id });
              });
            });
          }
        });

        setCountries(allCountries);
        setProvinces(allProvinces);
        setCities(allCities);

        // If Editing, fetch the attraction details now that we have hierarchy loaded
        if (!isNew) {
          await fetchAttraction(formattedCats, allCities, allProvinces, allCountries);
        } else {
          // Preselect first available location/category
          if (formattedCats.length > 0) {
            setForm(prev => ({ ...prev, categoriaId: formattedCats[0].id }));
          }
          if (allCountries.length > 0) {
            const firstCountry = allCountries[0].id;
            const provs = allProvinces.filter(p => p.countryId === firstCountry);
            const firstProvince = provs.length > 0 ? provs[0].id : '';
            const cts = allCities.filter(c => c.provinceId === firstProvince);
            const firstCity = cts.length > 0 ? cts[0].id : '';

            setForm(prev => ({
              ...prev,
              paisId: firstCountry,
              provinciaId: firstProvince,
              ciudadId: firstCity
            }));
          }
        }
      } catch (err) {
        console.error('Error initializing form data:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id]);

  const fetchAttraction = async (formattedCats, allCities, allProvinces, allCountries) => {
    try {
      const res = await catalogApi.get(`/attraction/${id}/complete`);
      const d = res.data;

      // Find matching location details to map back state/country dropdowns
      const targetCity = allCities.find(c => c.id === d.locationId);
      let provId = '';
      let countryId = '';
      if (targetCity) {
        provId = targetCity.provinceId;
        const targetProv = allProvinces.find(p => p.id === provId);
        if (targetProv) {
          countryId = targetProv.countryId;
        }
      }

      setForm({
        nombre: d.name || '',
        descripcion: d.descriptionFull || d.descriptionShort || '',
        precioBase: d.startingPrice || (d.products?.[0]?.priceTiers?.[0]?.price) || '',
        capacidadMaxima: d.maxGroupSize || (d.products?.[0]?.maxGroupSize) || 20,
        categoriaId: d.subcategoryId || (formattedCats.length > 0 ? formattedCats[0].id : ''),
        imagenUrl: d.mainImageUrl || d.gallery?.[0]?.url || '',
        publicada: d.isPublished !== false,
        activa: d.isActive !== false,
        paisId: countryId,
        provinciaId: provId,
        ciudadId: d.locationId || '',
        latitud: d.latitude || '',
        longitud: d.longitude || '',
        direccion: d.address || d.meetingPoint || '',
        selectedTags: (d.tags || []).map(t => t.name),
        incluidos: (d.inclusions || []).filter(i => i.type === 'included').map(i => i.name),
        excluidos: (d.inclusions || []).filter(i => i.type !== 'included').map(i => i.name),
        stops: d.itinerary?.stops?.map((s, idx) => ({
          id: s.id || idx.toString(),
          name: s.name || '',
          description: s.description || '',
          stayTimeMinutes: s.stayTimeMinutes || 30,
          latitude: s.latitude || 0,
          longitude: s.longitude || 0,
          stopNumber: s.stopNumber || (idx + 1),
          admissionType: s.admissionType || 'included'
        })) || [emptyStop()]
      });
    } catch (err) {
      console.error('Error fetching attraction complete details:', err);
    }
  };

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const toggleInclusion = (item, type) => {
    setForm((prev) => {
      const other = type === 'incluidos' ? 'excluidos' : 'incluidos';
      const inOther = prev[other].includes(item);
      const inCurrent = prev[type].includes(item);
      if (inOther) return prev;
      return {
        ...prev,
        [type]: inCurrent ? prev[type].filter((i) => i !== item) : [...prev[type], item],
      };
    });
  };

  const addStop = () => setField('stops', [...form.stops, emptyStop()]);
  const removeStop = (sid) => setField('stops', form.stops.filter((s) => s.id !== sid));
  const updateStop = (sid, field, value) =>
    setField('stops', form.stops.map((s) => s.id === sid ? { ...s, [field]: value } : s));

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'El nombre de la atracción no puede estar vacío.', confirmButtonColor: '#1c1611' });
      return;
    }
    if (!form.ciudadId) {
      Swal.fire({ icon: 'warning', title: 'Ubicación requerida', text: 'Debe seleccionar una ciudad válida.', confirmButtonColor: '#1c1611' });
      return;
    }

    setSaving(true);
    try {
      // Build DTOs compliant with Catalog.API models
      const defaultProduct = {
        title: 'Entrada General',
        description: 'Acceso básico a la atracción',
        durationMinutes: 120,
        cancelPolicyHours: 24,
        maxGroupSize: parseInt(form.capacidadMaxima) || 20,
        priceTiers: [
          {
            ticketCategoryId: '00000000-0000-0000-0000-000000000000',
            price: parseFloat(form.precioBase) || 0,
            currencyCode: 'USD'
          }
        ]
      };

      const payload = {
        name: form.nombre,
        descriptionShort: form.descripcion.substring(0, 150),
        descriptionFull: form.descripcion,
        locationId: form.ciudadId,
        subcategoryId: form.categoriaId || '00000000-0000-0000-0000-000000000000',
        address: form.direccion,
        meetingPoint: form.direccion,
        latitude: parseFloat(form.latitud) || 0,
        longitude: parseFloat(form.longitud) || 0,
        difficultyLevel: 'easy',
        media: form.imagenUrl ? [
          {
            mediaTypeId: 1,
            url: form.imagenUrl,
            title: form.nombre,
            isMain: true,
            sortOrder: 1
          }
        ] : [],
        tags: [], // Could map tag names to tag ids if fetched, empty for now to remain safe
        inclusions: [
          ...form.incluidos.map(incName => ({ inclusionItemId: '00000000-0000-0000-0000-000000000000', type: 'included' })),
          ...form.excluidos.map(excName => ({ inclusionItemId: '00000000-0000-0000-0000-000000000000', type: 'not_included' }))
        ],
        products: [defaultProduct],
        itinerary: {
          languageId: 1,
          overview: form.nombre,
          stops: form.stops.map((s, idx) => ({
            name: s.name || `Parada ${idx + 1}`,
            description: s.description || '',
            stayTimeMinutes: parseInt(s.stayTimeMinutes) || 30,
            latitude: parseFloat(s.latitude) || 0,
            longitude: parseFloat(s.longitude) || 0,
            stopNumber: idx + 1,
            admissionType: s.admissionType || 'included'
          }))
        }
      };

      if (isNew) {
        await catalogApi.post('/attraction/complete', payload);
      } else {
        // En update actualizamos la información básica
        const updatePayload = {
          name: form.nombre,
          locationId: form.ciudadId,
          subcategoryId: form.categoriaId,
          descriptionShort: form.descripcion.substring(0, 150),
          descriptionFull: form.descripcion,
          address: form.direccion,
          meetingPoint: form.direccion,
          latitude: parseFloat(form.latitud) || 0,
          longitude: parseFloat(form.longitud) || 0,
          difficultyLevel: 'easy'
        };
        await catalogApi.put(`/attraction/${id}`, updatePayload);
      }

      Swal.fire({ icon: 'success', title: isNew ? '¡Atracción creada!' : '¡Cambios guardados!', confirmButtonColor: '#1c1611', timer: 2000, showConfirmButton: false });
      navigate('/admin');
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error al guardar', text: err.response?.data?.message || 'Verifica los datos e inténtalo de nuevo.', confirmButtonColor: '#1c1611' });
    } finally {
      setSaving(false);
    }
  };

  const filteredProvinces = provinces.filter(p => p.countryId === form.paisId);
  const filteredCities = cities.filter(c => c.provinceId === form.provinciaId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <div className="w-10 h-10 border-4 border-sand-200 border-t-sand-950 rounded-full animate-spin" />
      </div>
    );
  }

  const inputCls = 'w-full border border-sand-200 px-4 py-3 text-sm bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sand-400 transition';
  const labelCls = 'block text-[10px] uppercase tracking-widest text-sand-500 mb-1.5';

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Top bar */}
      <div className="bg-white border-b border-sand-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-sand-100 rounded transition-colors">
            <ArrowLeft className="w-4 h-4 text-sand-600" />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-xl font-medium text-sand-950">
              {isNew ? 'Nueva Atracción' : `Editar: ${form.nombre || '...'}`}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-0.5 ${form.publicada ? 'bg-ocean-50 text-ocean-700' : 'bg-sand-100 text-sand-500'}`}>
                {form.publicada ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {form.publicada ? 'Publicada' : 'Borrador'}
              </span>
              <span className={`flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-0.5 ${form.activa ? 'badge-confirmed' : 'badge-pending'}`}>
                {form.activa ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {form.activa ? 'Activa' : 'Pausada'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              const nextVal = !form.publicada;
              if (!isNew) {
                await catalogApi.patch(`/attraction/${id}/status`, { isPublished: nextVal });
              }
              setField('publicada', nextVal);
            }}
            className="px-4 py-2 border border-sand-200 text-xs uppercase tracking-widest text-sand-600 hover:bg-sand-50 transition flex items-center gap-2"
          >
            {form.publicada ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {form.publicada ? 'Pasar a Borrador' : 'Publicar'}
          </button>
          <button
            onClick={async () => {
              const nextVal = !form.activa;
              if (!isNew) {
                await catalogApi.patch(`/attraction/${id}/active`, { isActive: nextVal });
              }
              setField('activa', nextVal);
            }}
            className={`px-4 py-2 border text-xs uppercase tracking-widest transition flex items-center gap-2 ${form.activa ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-ocean-200 text-ocean-700 hover:bg-ocean-50'}`}
          >
            {form.activa ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {form.activa ? 'Pausar reservas' : 'Activar reservas'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-sand-950 text-sand-50 text-xs font-medium uppercase tracking-widest hover:bg-sand-800 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <div className="w-3.5 h-3.5 border-2 border-sand-400 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex border-b border-sand-200 mb-8 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-medium uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* GENERAL */}
            {activeTab === 'general' && (
              <div className="bg-white border border-sand-200 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Nombre *</label>
                    <input value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} className={inputCls} placeholder="Ej: Tour del Centro Histórico de Quito" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Descripción</label>
                    <textarea value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)} rows={4} className={inputCls} placeholder="Describe la experiencia..." />
                  </div>
                  <div>
                    <label className={labelCls}>Precio Base (USD) *</label>
                    <input type="number" value={form.precioBase} onChange={(e) => setField('precioBase', e.target.value)} className={inputCls} placeholder="49.00" min="0" step="0.01" />
                  </div>
                  <div>
                    <label className={labelCls}>Capacidad Máxima</label>
                    <input type="number" value={form.capacidadMaxima} onChange={(e) => setField('capacidadMaxima', e.target.value)} className={inputCls} placeholder="20" min="1" />
                  </div>
                  <div>
                    <label className={labelCls}>Categoría</label>
                    <select value={form.categoriaId} onChange={(e) => setField('categoriaId', e.target.value)} className={inputCls}>
                      <option value="">-- Seleccionar --</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>URL de Imagen Principal</label>
                    <input value={form.imagenUrl} onChange={(e) => setField('imagenUrl', e.target.value)} className={inputCls} placeholder="https://..." />
                  </div>
                </div>
                {!form.publicada && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">Esta atracción está en <strong>Borrador</strong> — no es visible para los clientes en el portal público.</p>
                  </div>
                )}
              </div>
            )}

            {/* UBICACIÓN */}
            {activeTab === 'ubicacion' && (
              <div className="bg-white border border-sand-200 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelCls}>País</label>
                    <select
                      value={form.paisId}
                      onChange={(e) => {
                        const targetCountryId = e.target.value;
                        const provs = provinces.filter(p => p.countryId === targetCountryId);
                        const nextProvince = provs.length > 0 ? provs[0].id : '';
                        const cts = cities.filter(c => c.provinceId === nextProvince);
                        const nextCity = cts.length > 0 ? cts[0].id : '';

                        setForm(prev => ({
                          ...prev,
                          paisId: targetCountryId,
                          provinciaId: nextProvince,
                          ciudadId: nextCity
                        }));
                      }}
                      className={inputCls}
                    >
                      <option value="">-- País --</option>
                      {countries.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Provincia / Estado</label>
                    <select
                      value={form.provinciaId}
                      onChange={(e) => {
                        const targetProvId = e.target.value;
                        const cts = cities.filter(c => c.provinceId === targetProvId);
                        const nextCity = cts.length > 0 ? cts[0].id : '';

                        setForm(prev => ({
                          ...prev,
                          provinciaId: targetProvId,
                          ciudadId: nextCity
                        }));
                      }}
                      className={inputCls}
                      disabled={!form.paisId}
                    >
                      <option value="">-- Provincia --</option>
                      {filteredProvinces.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Ciudad</label>
                    <select
                      value={form.ciudadId}
                      onChange={(e) => setField('ciudadId', e.target.value)}
                      className={inputCls}
                      disabled={!form.provinciaId}
                    >
                      <option value="">-- Ciudad --</option>
                      {filteredCities.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelCls}>Dirección exacta del punto de encuentro</label>
                    <input value={form.direccion} onChange={(e) => setField('direccion', e.target.value)} className={inputCls} placeholder="Calle García Moreno y Espejo, Quito" />
                  </div>
                  <div>
                    <label className={labelCls}>Latitud GPS</label>
                    <input type="number" value={form.latitud} onChange={(e) => setField('latitud', e.target.value)} className={inputCls} placeholder="-0.22985" step="0.00001" />
                  </div>
                  <div>
                    <label className={labelCls}>Longitud GPS</label>
                    <input type="number" value={form.longitud} onChange={(e) => setField('longitud', e.target.value)} className={inputCls} placeholder="-78.52495" step="0.00001" />
                  </div>
                  <div className="flex items-end">
                    <a
                      href={`https://www.google.com/maps?q=${form.latitud},${form.longitud}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3 border border-sand-200 text-xs uppercase tracking-widest text-sand-600 hover:bg-sand-50 transition flex items-center gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Ver en mapa
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAGS */}
            {activeTab === 'tags' && (
              <div className="bg-white border border-sand-200 p-8">
                <p className="text-sand-500 text-sm mb-6">Selecciona las etiquetas que mejor describan esta experiencia.</p>
                <div className="flex flex-wrap gap-3">
                  {MOCK_TAGS.map((tag) => {
                    const selected = form.selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 border text-sm transition-all duration-200 ${selected ? 'border-sand-950 bg-sand-950 text-sand-50' : 'border-sand-200 text-sand-600 hover:border-sand-400'}`}
                      >
                        {selected && '✓ '}{tag}
                      </button>
                    );
                  })}
                </div>
                {form.selectedTags.length > 0 && (
                  <p className="mt-4 text-xs text-sand-400">{form.selectedTags.length} etiqueta(s) seleccionada(s)</p>
                )}
              </div>
            )}

            {/* INCLUSIONES */}
            {activeTab === 'inclusiones' && (
              <div className="bg-white border border-sand-200 p-8">
                <p className="text-sand-500 text-sm mb-6">Selecciona qué servicios están incluidos y cuáles se excluyen explícitamente.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Incluidos */}
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest text-ocean-600 mb-3 font-bold">Incluido</h3>
                    <div className="space-y-2">
                      {MOCK_INCLUSIONS.map((item) => {
                        const isIn = form.incluidos.includes(item);
                        const isEx = form.excluidos.includes(item);
                        return (
                          <button
                            key={item}
                            onClick={() => toggleInclusion(item, 'incluidos')}
                            disabled={isEx}
                            className={`w-full text-left px-4 py-3 border text-sm transition-all duration-200 flex items-center gap-3 ${isIn ? 'border-ocean-300 bg-ocean-50 text-ocean-800' : 'border-sand-100 hover:border-ocean-200 text-sand-600'} ${isEx ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${isIn ? 'bg-ocean-500 border-ocean-500' : 'border-sand-300'}`}>
                              {isIn && <span className="text-white text-xs">✓</span>}
                            </div>
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Excluidos */}
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest text-red-500 mb-3 font-bold">Excluido</h3>
                    <div className="space-y-2">
                      {MOCK_INCLUSIONS.map((item) => {
                        const isIn = form.incluidos.includes(item);
                        const isEx = form.excluidos.includes(item);
                        return (
                          <button
                            key={item}
                            onClick={() => toggleInclusion(item, 'excluidos')}
                            disabled={isIn}
                            className={`w-full text-left px-4 py-3 border text-sm transition-all duration-200 flex items-center gap-3 ${isEx ? 'border-red-200 bg-red-50 text-red-700' : 'border-sand-100 hover:border-red-200 text-sand-600'} ${isIn ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${isEx ? 'bg-red-400 border-red-400' : 'border-sand-300'}`}>
                              {isEx && <span className="text-white text-xs">✕</span>}
                            </div>
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ITINERARIO */}
            {activeTab === 'itinerario' && (
              <div className="bg-white border border-sand-200 p-8 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sand-500 text-sm">Define las paradas del recorrido en orden.</p>
                  <button
                    onClick={addStop}
                    className="flex items-center gap-2 px-4 py-2 border border-sand-200 text-xs uppercase tracking-widest text-sand-700 hover:bg-sand-50 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar parada
                  </button>
                </div>

                {form.stops.map((stop, i) => (
                  <div key={stop.id} className="border border-sand-100 p-5 space-y-4 relative group">
                    <div className="flex items-center gap-3 mb-2">
                      <GripVertical className="w-4 h-4 text-sand-300 cursor-grab" />
                      <div className="w-7 h-7 rounded-full bg-sand-950 text-white flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium text-sand-700">Parada {i + 1}</span>
                      <button
                        onClick={() => removeStop(stop.id)}
                        className="ml-auto text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelCls}>Título</label>
                        <input value={stop.name} onChange={(e) => updateStop(stop.id, 'name', e.target.value)} className={inputCls} placeholder="Ej: Visita al mercado artesanal" />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>Descripción</label>
                        <textarea value={stop.description} onChange={(e) => updateStop(stop.id, 'description', e.target.value)} rows={2} className={inputCls} placeholder="Detalles de esta parada..." />
                      </div>
                      <div>
                        <label className={labelCls}>Duración (min)</label>
                        <input type="number" value={stop.stayTimeMinutes} onChange={(e) => updateStop(stop.id, 'stayTimeMinutes', parseInt(e.target.value))} className={inputCls} min="5" step="5" />
                      </div>
                      <div>
                        <label className={labelCls}>Tipo de acceso</label>
                        <select value={stop.admissionType} onChange={(e) => updateStop(stop.id, 'admissionType', e.target.value)} className={inputCls}>
                          <option value="included">Incluido</option>
                          <option value="optional">Opcional</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EditAttraction;
