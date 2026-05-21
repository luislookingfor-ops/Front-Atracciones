import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom elegant marker
const createCustomIcon = () =>
  L.divIcon({
    html: `
      <div style="
        width: 36px; height: 36px;
        background: #1c1611;
        border: 3px solid #fdfaf5;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(28,22,17,0.35);
      "></div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });

/**
 * LocationMap — Leaflet map with custom marker
 * Props:
 *   lat: number
 *   lng: number
 *   label?: string
 *   zoom?: number
 *   height?: string  (CSS height value)
 */
const LocationMap = ({ lat, lng, label = 'Punto de encuentro', zoom = 15, height = '320px' }) => {
  if (!lat || !lng) return null;

  return (
    <div className="w-full overflow-hidden border border-sand-200" style={{ height }}>
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={createCustomIcon()}>
          <Popup>
            <div className="text-sand-950 text-sm font-medium">{label}</div>
            <div className="text-sand-500 text-xs mt-1">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationMap;
