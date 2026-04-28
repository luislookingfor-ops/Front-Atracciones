import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const AtraccionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precioBase: 0,
    capacidadMaxima: 0,
    horarioApertura: '08:00:00',
    horarioCierre: '18:00:00',
    ciudadId: 1, 
    categoriaId: 1, 
    imagenUrl: '',
    estado: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  useEffect(() => {
    fetchFormData();
    if (isEdit) {
      fetchAtraccion();
    }
  }, [id]);

  const fetchFormData = async () => {
    try {
      const [countryRes, provinceRes, cityRes, catRes] = await Promise.all([
        api.get('/Pais'),
        api.get('/Provincia'),
        api.get('/Ciudad'),
        api.get('/Categoria')
      ]);
      setCountries(countryRes.data);
      setProvinces(provinceRes.data);
      setCities(cityRes.data);
      setCategories(catRes.data);
      
      if (!isEdit) {
        if (countryRes.data.length > 0) {
          const firstCountryId = countryRes.data[0].paisId;
          setSelectedCountry(firstCountryId);
          
          // Buscar primera provincia de ese país
          const firstProv = provinceRes.data.find(p => p.paisId === firstCountryId);
          if (firstProv) {
            setSelectedProvince(firstProv.provinciaId);
            
            // Buscar primera ciudad de esa provincia
            const firstCity = cityRes.data.find(c => c.provinciaId === firstProv.provinciaId);
            if (firstCity) {
              setFormData(prev => ({ ...prev, ciudadId: firstCity.ciudadId }));
            }
          }
        }
        
        if (catRes.data.length > 0) {
          setFormData(prev => ({ ...prev, categoriaId: catRes.data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const fetchAtraccion = async () => {
    try {
      const response = await api.get(`/Atraccion/${id}`);
      const attraction = response.data;
      setFormData(attraction);
      
      // Encontrar la provincia y el país de la ciudad actual
      const city = cities.find(c => c.ciudadId === attraction.ciudadId);
      if (city) {
        setSelectedProvince(city.provinciaId);
        const province = provinces.find(p => p.provinciaId === city.provinciaId);
        if (province) {
          setSelectedCountry(province.paisId);
        }
      }
    } catch (error) {
      console.error('Error fetching attraction:', error);
    }
  };

  // Efecto para sincronizar países/provincias al editar
  useEffect(() => {
    if (isEdit && cities.length > 0 && provinces.length > 0) {
      const city = cities.find(c => c.ciudadId === formData.ciudadId);
      if (city) {
        setSelectedProvince(city.provinciaId);
        const province = provinces.find(p => p.provinciaId === city.provinciaId);
        if (province) {
          setSelectedCountry(province.paisId);
        }
      }
    }
  }, [formData.ciudadId, cities, provinces, isEdit]);

  const filteredProvinces = provinces.filter(p => p.paisId === parseInt(selectedCountry));
  const filteredCities = cities.filter(c => c.provinciaId === parseInt(selectedProvince));

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    else if (formData.nombre.length < 3) newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    
    if (formData.precioBase < 0) newErrors.precioBase = 'El precio no puede ser negativo';
    if (formData.capacidadMaxima <= 0) newErrors.capacidadMaxima = 'La capacidad debe ser mayor a cero';
    
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (!timeRegex.test(formData.horarioApertura)) newErrors.horarioApertura = 'Formato inválido (HH:MM:SS)';
    if (!timeRegex.test(formData.horarioCierre)) newErrors.horarioCierre = 'Formato inválido (HH:MM:SS)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/Atraccion/${id}`, { ...formData, atraccionId: parseInt(id) });
      } else {
        await api.post('/Atraccion', formData);
      }
      navigate('/admin');
    } catch (error) {
      console.error('Error saving attraction:', error);
      alert(error.response?.data?.message || 'Error al guardar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      setLoading(true);
      const response = await api.post('/Upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, imagenUrl: response.data.url }));
    } catch (error) {
      alert('Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-sand-500 hover:text-sand-950 mb-8 transition-colors text-sm uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> Volver al panel
        </button>

        <div className="bg-white border border-sand-200 p-8 lg:p-12 shadow-sm">
          <h2 
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl font-light text-sand-950 mb-8"
          >
            {isEdit ? 'Editar' : 'Nueva'} <em className="italic">Atracción</em>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Imagen Upload */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Imagen de la Atracción</label>
                <div className="flex items-center gap-4">
                  {formData.imagenUrl && (
                    <img src={formData.imagenUrl} alt="Preview" className="w-24 h-24 object-cover border border-sand-200" />
                  )}
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs text-sand-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-medium file:bg-sand-100 file:text-sand-700 hover:file:bg-sand-200"
                  />
                </div>
                <input type="hidden" name="imagenUrl" value={formData.imagenUrl} />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Nombre de la Atracción</label>
                <input 
                  type="text"
                  name="nombre"
                  className={`w-full p-3 bg-sand-50 border ${errors.nombre ? 'border-red-300' : 'border-sand-100'} focus:ring-1 focus:ring-sand-300 outline-none transition-all`}
                  value={formData.nombre}
                  onChange={handleChange}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.nombre}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Descripción</label>
                <textarea 
                  name="descripcion"
                  rows="4"
                  className={`w-full p-3 bg-sand-50 border ${errors.descripcion ? 'border-red-300' : 'border-sand-100'} focus:ring-1 focus:ring-sand-300 outline-none transition-all`}
                  value={formData.descripcion}
                  onChange={handleChange}
                />
                {errors.descripcion && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.descripcion}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Precio */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Precio Base ($)</label>
                  <input 
                    type="number"
                    name="precioBase"
                    step="0.01"
                    className={`w-full p-3 bg-sand-50 border ${errors.precioBase ? 'border-red-300' : 'border-sand-100'} focus:ring-1 focus:ring-sand-300 outline-none transition-all`}
                    value={formData.precioBase}
                    onChange={handleChange}
                  />
                  {errors.precioBase && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.precioBase}</p>}
                </div>

                {/* Capacidad */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Capacidad Máxima</label>
                  <input 
                    type="number"
                    name="capacidadMaxima"
                    className={`w-full p-3 bg-sand-50 border ${errors.capacidadMaxima ? 'border-red-300' : 'border-sand-100'} focus:ring-1 focus:ring-sand-300 outline-none transition-all`}
                    value={formData.capacidadMaxima}
                    onChange={handleChange}
                  />
                  {errors.capacidadMaxima && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.capacidadMaxima}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Apertura */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Horario Apertura (HH:MM:SS)</label>
                  <input 
                    type="text"
                    name="horarioApertura"
                    placeholder="08:00:00"
                    className={`w-full p-3 bg-sand-50 border ${errors.horarioApertura ? 'border-red-300' : 'border-sand-100'} focus:ring-1 focus:ring-sand-300 outline-none transition-all`}
                    value={formData.horarioApertura}
                    onChange={handleChange}
                  />
                  {errors.horarioApertura && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.horarioApertura}</p>}
                </div>

                {/* Cierre */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Horario Cierre (HH:MM:SS)</label>
                  <input 
                    type="text"
                    name="horarioCierre"
                    placeholder="18:00:00"
                    className={`w-full p-3 bg-sand-50 border ${errors.horarioCierre ? 'border-red-300' : 'border-sand-100'} focus:ring-1 focus:ring-sand-300 outline-none transition-all`}
                    value={formData.horarioCierre}
                    onChange={handleChange}
                  />
                  {errors.horarioCierre && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.horarioCierre}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* País */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">País</label>
                  <select 
                    className="w-full p-3 bg-sand-50 border border-sand-100 focus:ring-1 focus:ring-sand-300 outline-none"
                    value={selectedCountry}
                    onChange={(e) => {
                      const paisId = parseInt(e.target.value);
                      setSelectedCountry(paisId);
                      const firstProv = provinces.find(p => p.paisId === paisId);
                      if (firstProv) {
                        setSelectedProvince(firstProv.provinciaId);
                        const firstCity = cities.find(c => c.provinciaId === firstProv.provinciaId);
                        if (firstCity) {
                          setFormData({...formData, ciudadId: firstCity.ciudadId});
                        }
                      } else {
                        setSelectedProvince('');
                      }
                    }}
                  >
                    <option value="">Seleccione País</option>
                    {countries.map(c => <option key={c.paisId} value={c.paisId}>{c.nombre}</option>)}
                  </select>
                </div>

                {/* Provincia */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Provincia</label>
                  <select 
                    className="w-full p-3 bg-sand-50 border border-sand-100 focus:ring-1 focus:ring-sand-300 outline-none"
                    value={selectedProvince}
                    onChange={(e) => {
                      const provId = parseInt(e.target.value);
                      setSelectedProvince(provId);
                      const firstCity = cities.find(c => c.provinciaId === provId);
                      if (firstCity) {
                        setFormData({...formData, ciudadId: firstCity.ciudadId});
                      }
                    }}
                    disabled={!selectedCountry}
                  >
                    <option value="">Seleccione Provincia</option>
                    {filteredProvinces.map(p => <option key={p.provinciaId} value={p.provinciaId}>{p.nombre}</option>)}
                  </select>
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Ciudad</label>
                  <select 
                    name="ciudadId"
                    className="w-full p-3 bg-sand-50 border border-sand-100 focus:ring-1 focus:ring-sand-300 outline-none"
                    value={formData.ciudadId}
                    onChange={(e) => setFormData({...formData, ciudadId: parseInt(e.target.value)})}
                    disabled={!selectedProvince}
                  >
                    <option value="">Seleccione Ciudad</option>
                    {filteredCities.map(c => <option key={c.ciudadId} value={c.ciudadId}>{c.nombre}</option>)}
                  </select>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sand-500 font-medium mb-2">Categoría</label>
                  <select 
                    name="categoriaId"
                    className="w-full p-3 bg-sand-50 border border-sand-100 focus:ring-1 focus:ring-sand-300 outline-none"
                    value={formData.categoriaId}
                    onChange={(e) => setFormData({...formData, categoriaId: parseInt(e.target.value)})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-3 py-4">
                <input 
                  type="checkbox"
                  name="estado"
                  id="estado"
                  className="w-4 h-4 accent-sand-950"
                  checked={formData.estado}
                  onChange={handleChange}
                />
                <label htmlFor="estado" className="text-[10px] uppercase tracking-widest text-sand-500 font-medium cursor-pointer">Activo / Visible en el catálogo</label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-sand-950 text-sand-50 text-xs font-medium tracking-widest uppercase hover:bg-sand-800 transition-all duration-300 disabled:opacity-50 mt-8"
            >
              <Save className="w-4 h-4" /> {loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Atracción')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AtraccionForm;
