import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Star, Clock, Users, Shield, Globe, ArrowLeft,
  Share2, Heart, ChevronRight, Tag, Check
} from 'lucide-react';
import Swal from 'sweetalert2';
import attractionService from '../services/attractionService';
import useCartStore from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import MediaGallery from '../components/features/MediaGallery';
import InteractiveItinerary from '../components/features/InteractiveItinerary';
import LocationMap from '../components/features/LocationMap';
import AvailabilityCalendar from '../components/features/AvailabilityCalendar';
import { IMAGE_BASE_URL } from '../services/api';

// ── Mock enrichment (filled by real API once microservices are ready) ──
const MOCK_GALLERY = (mainUrl) => [
  { url: mainUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', alt: 'Vista principal' },
  { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800', alt: 'Panorama' },
  { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', alt: 'Detalles' },
  { url: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800', alt: 'Experiencia' },
];

const MOCK_ITINERARY = [
  { order: 1, title: 'Punto de encuentro', description: 'Nos reunimos en el lobby principal. El guía portará un letrero identificador.', duration: 15, type: 'included', location: 'Plaza Central' },
  { order: 2, title: 'Recorrido histórico', description: 'Visita guiada por los puntos de mayor interés histórico y cultural de la zona.', duration: 90, type: 'included', location: 'Centro Histórico' },
  { order: 3, title: 'Almuerzo típico', description: 'Pausa para almuerzo en restaurante local recomendado. Costo no incluido.', duration: 60, type: 'optional', location: 'Restaurante La Tradición' },
  { order: 4, title: 'Visita al mirador', description: 'Acceso al punto más alto con vistas panorámicas de 360°.', duration: 45, type: 'included' },
  { order: 5, title: 'Regreso y cierre', description: 'Retorno al punto de inicio. Incluye foto grupal y certificado digital.', duration: 20, type: 'included' },
];

const MOCK_INCLUSIONS = [
  { label: 'Guía bilingüe certificado', included: true },
  { label: 'Transporte de retorno', included: true },
  { label: 'Seguro de viajero', included: true },
  { label: 'Acceso a zonas premium', included: true },
  { label: 'Almuerzo', included: false },
  { label: 'Propinas', included: false },
];

const AttractionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addItem } = useCartStore();

  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalidad, setModalidad] = useState('shared'); // 'shared' | 'private'
  const [passengers, setPassengers] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeSection, setActiveSection] = useState('galeria');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await attractionService.getById(id);
        setAttraction(data);
      } catch {
        setAttraction(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    window.scrollTo(0, 0);
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      Swal.fire({
        icon: 'info',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para realizar una reserva.',
        confirmButtonText: 'Ir al login',
        confirmButtonColor: '#1c1611',
      }).then((r) => { if (r.isConfirmed) navigate('/login', { state: { from: location } }); });
      return;
    }
    if (!selectedSlot) {
      Swal.fire({ icon: 'warning', title: 'Selecciona un horario', text: 'Elige una fecha y horario disponible para continuar.', confirmButtonColor: '#1c1611' });
      return;
    }
    const price = modalidad === 'private' ? (attraction.precio || 0) * 1.8 : (attraction.precio || 0);
    addItem({
      id: `${id}-${selectedSlot.id}`,
      attractionId: id,
      name: attraction.nombre,
      image: attraction.imagenUrl || '',
      price,
      quantity: passengers,
      scheduleId: selectedSlot.id,
      date: selectedSlot.slot_date,
      time: selectedSlot.start_time,
      modalidad,
      ciudadNombre: attraction.ciudadNombre || '',
    });
    sessionStorage.setItem('checkout_slot', JSON.stringify(selectedSlot));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-sand-200 border-t-sand-950 rounded-full animate-spin mx-auto" />
          <p className="text-sand-400 text-xs uppercase tracking-widest">Cargando experiencia...</p>
        </div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-sand-50">
        <p className="text-2xl font-light text-sand-600">Atracción no encontrada</p>
        <Link to="/atracciones" className="text-xs uppercase tracking-widest text-ocean-600 border-b border-ocean-600 pb-0.5">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const mainImage = attraction.imagenUrl
    ? (attraction.imagenUrl.startsWith('http') ? attraction.imagenUrl : `${IMAGE_BASE_URL}${attraction.imagenUrl}`)
    : 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200';

  const gallery = MOCK_GALLERY(mainImage);
  const privatePrice = ((attraction.precio || 0) * 1.8).toFixed(2);
  const sharedPrice = Number(attraction.precio || 0).toFixed(2);
  const displayPrice = modalidad === 'private' ? privatePrice : sharedPrice;

  const SECTIONS = [
    { id: 'galeria', label: 'Galería' },
    { id: 'itinerario', label: 'Itinerario' },
    { id: 'mapa', label: 'Ubicación' },
    { id: 'reservar', label: 'Reservar' },
  ];

  return (
    <div className="bg-sand-50 min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img src={mainImage} alt={attraction.nombre} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-sand-950/80 via-sand-950/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 glass-dark p-2.5 text-sand-100 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Actions */}
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            onClick={() => setWishlisted(!wishlisted)}
            className={`glass-dark p-2.5 transition-colors ${wishlisted ? 'text-red-400' : 'text-sand-300 hover:text-red-400'}`}
          >
            <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
          <button className="glass-dark p-2.5 text-sand-300 hover:text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Hero info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-4xl">
            {attraction.categoriaNombre && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-sand-300 mb-3 block">
                {attraction.categoriaNombre}
              </span>
            )}
            <h1
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
              className="text-4xl md:text-6xl font-light text-white leading-tight mb-4"
            >
              {attraction.nombre}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sand-300 text-sm">
              {attraction.ciudadNombre && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {attraction.ciudadNombre}, {attraction.paisNombre}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-sand-400 text-sand-400" /> 4.9 · 248 reseñas
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Máx. {attraction.capacidadMaxima} personas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky section nav ───────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white border-b border-sand-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-0">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSection(s.id);
                document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`px-6 py-4 text-xs font-medium uppercase tracking-widest transition-all duration-200 ${
                activeSection === s.id ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-16">
          {/* About */}
          <section>
            <span className="text-[10px] uppercase tracking-[0.2em] text-ocean-600 mb-3 block">Descripción</span>
            <p className="text-sand-700 leading-relaxed font-light text-base">
              {attraction.descripcion || 'Una experiencia única diseñada para los viajeros más exigentes. Cada detalle ha sido cuidado para garantizar una vivencia inolvidable.'}
            </p>
          </section>

          {/* Gallery */}
          <section id="section-galeria">
            <h2
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
              className="text-3xl font-light text-sand-950 mb-6"
            >
              Galería
            </h2>
            <MediaGallery images={gallery} className="grid-cols-2 md:grid-cols-4" />
          </section>

          {/* Inclusions */}
          <section>
            <h2
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
              className="text-3xl font-light text-sand-950 mb-6"
            >
              Qué <em className="italic">incluye</em>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_INCLUSIONS.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 border ${item.included ? 'border-ocean-100 bg-ocean-50' : 'border-sand-100 bg-sand-50 opacity-60'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.included ? 'bg-ocean-500' : 'bg-sand-300'}`}>
                    {item.included ? <Check className="w-3 h-3 text-white" /> : <span className="text-white text-xs">✕</span>}
                  </div>
                  <span className={`text-sm ${item.included ? 'text-sand-800' : 'text-sand-400 line-through'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Itinerary */}
          <section id="section-itinerario">
            <h2
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
              className="text-3xl font-light text-sand-950 mb-8"
            >
              Itinerario <em className="italic">detallado</em>
            </h2>
            <InteractiveItinerary stops={MOCK_ITINERARY} />
          </section>

          {/* Map */}
          <section id="section-mapa">
            <h2
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
              className="text-3xl font-light text-sand-950 mb-6"
            >
              Punto de <em className="italic">encuentro</em>
            </h2>
            <LocationMap
              lat={attraction.latitud || -0.22985}
              lng={attraction.longitud || -78.52495}
              label={attraction.nombre}
              height="360px"
            />
            <p className="mt-3 text-xs text-sand-500 italic">
              Coordenadas del punto de encuentro principal. El guía lo estará esperando 15 minutos antes.
            </p>
          </section>
        </div>

        {/* Right column — Booking widget */}
        <aside className="lg:col-span-1">
          <div
            id="section-reservar"
            className="sticky top-20 bg-white border border-sand-200 shadow-sm p-6 space-y-6"
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest text-sand-400">Precio desde</p>
              <div className="flex items-end gap-2 mt-1">
                <span
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  className="text-4xl font-semibold text-sand-950"
                >
                  ${displayPrice}
                </span>
                <span className="text-sand-400 text-sm mb-1">/ persona</span>
              </div>
            </div>

            {/* Modalidad */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-sand-500 mb-3">Modalidad</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'shared', label: 'Compartido', desc: `$${sharedPrice}` },
                  { value: 'private', label: 'Privado', desc: `$${privatePrice}` },
                ].map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setModalidad(m.value)}
                    className={`p-3 border text-left transition-all duration-200 ${
                      modalidad === m.value
                        ? 'border-sand-950 bg-sand-950 text-sand-50'
                        : 'border-sand-200 hover:border-sand-400'
                    }`}
                  >
                    <div className="text-xs font-medium">{m.label}</div>
                    <div className={`text-[10px] mt-1 ${modalidad === m.value ? 'text-sand-300' : 'text-sand-400'}`}>{m.desc}/persona</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Passengers */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-sand-500 mb-3">Pasajeros</p>
              <div className="flex items-center gap-3 border border-sand-200 p-3">
                <button
                  onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 border border-sand-200 flex items-center justify-center hover:bg-sand-100 transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium">{passengers}</span>
                <button
                  onClick={() => setPassengers((p) => Math.min(attraction.capacidadMaxima || 20, p + 1))}
                  className="w-8 h-8 border border-sand-200 flex items-center justify-center hover:bg-sand-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-sand-500 mb-3">Fecha y horario</p>
              <AvailabilityCalendar
                attractionId={id}
                onSelectSlot={setSelectedSlot}
                selectedSlot={selectedSlot}
              />
            </div>

            {/* Selected summary */}
            {selectedSlot && (
              <div className="bg-ocean-50 border border-ocean-100 p-4 text-sm">
                <div className="text-[10px] uppercase tracking-widest text-ocean-600 mb-2">Selección</div>
                <div className="text-sand-800">
                  📅 {selectedSlot.slot_date} · ⏰ {selectedSlot.start_time}
                </div>
                <div className="text-ocean-600 font-semibold mt-1">
                  Total: ${(parseFloat(displayPrice) * passengers).toFixed(2)}
                </div>
              </div>
            )}

            <button
              onClick={handleBook}
              className="w-full py-4 bg-sand-950 text-sand-50 text-xs font-medium uppercase tracking-widest hover:bg-sand-800 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {selectedSlot ? 'Confirmar Reserva' : 'Selecciona un horario'}
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[10px] text-sand-400 justify-center">
              <Shield className="w-3 h-3" /> Reserva 100% segura · Cancelación flexible
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AttractionDetail;
