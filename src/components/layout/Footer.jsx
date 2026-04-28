import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#1c1611' }} className="pt-20 pb-10">
      <div className="container mx-auto px-6 lg:px-12">

        {/* Top row: brand + CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-16 border-b border-sand-800">
          <div className="max-w-sm">
            <span
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-3xl font-light tracking-[0.12em] uppercase text-sand-100 block mb-4"
            >
              Atracciones
            </span>
            <p className="text-sand-500 text-sm leading-relaxed font-light">
              Explora las mejores experiencias turísticas del mundo con nuestro portal especializado.
            </p>
          </div>
          <Link
            to="/registro"
            className="inline-flex items-center px-8 py-4 border border-sand-600 text-sand-200 text-xs font-medium tracking-[0.15em] uppercase hover:border-sand-300 hover:text-white transition-all duration-200 whitespace-nowrap"
          >
            Comenzar ahora →
          </Link>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16 border-b border-sand-800">

          {/* Explore */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-5 font-medium">Explorar</h4>
            <ul className="space-y-3">
              {[
                { label: 'Inicio', to: '/' },
                { label: 'Catálogo', to: '/atracciones' },
                { label: 'Destinos Populares', to: '/atracciones' },
                { label: 'Ofertas Especiales', to: '/atracciones' },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-sand-400 hover:text-sand-100 transition-colors font-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-5 font-medium">Cuenta</h4>
            <ul className="space-y-3">
              {[
                { label: 'Iniciar Sesión', to: '/login' },
                { label: 'Crear Cuenta', to: '/registro' },
                { label: 'Mi Carrito', to: '/carrito' },
                { label: 'Historial', to: '/carrito' },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-sand-400 hover:text-sand-100 transition-colors font-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-5 font-medium">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sand-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-sand-400 font-light">Av. 12 de Octubre y Veintimilla</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sand-600 flex-shrink-0" />
                <span className="text-sm text-sand-400 font-light">+(593) 987-654-321</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sand-600 flex-shrink-0" />
                <span className="text-sm text-sand-400 font-light">soporte@atracciones.com</span>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-5 font-medium">Redes</h4>
            <ul className="space-y-3">
              {['Instagram', 'Twitter / X', 'Facebook', 'LinkedIn'].map((s) => (
                <li key={s}>
                  <a href="#" className="text-sm text-sand-400 hover:text-sand-100 transition-colors font-light">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-xs text-sand-600">
            © {new Date().getFullYear()} Microservicio.Atracciones. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {['Privacidad', 'Términos', 'Cookies'].map((t) => (
              <a key={t} href="#" className="text-xs text-sand-600 hover:text-sand-400 transition-colors">
                {t}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
