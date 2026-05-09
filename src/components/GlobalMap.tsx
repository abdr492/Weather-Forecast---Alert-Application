import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default leaflet icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface GlobalMapProps {
  onLocationSelect: (lat: number, lon: number) => void;
  selectedLocation?: { lat: number, lon: number } | null;
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

const GlobalMap: React.FC<GlobalMapProps> = ({ onLocationSelect, selectedLocation }) => {
  return (
    <div className="w-full h-full relative z-0 rounded-3xl overflow-hidden border border-red-900/20">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        minZoom={2}
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#050505' }}
        zoomControl={true}
        maxBounds={[[-90, -180], [90, 180]]}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapEvents onLocationSelect={onLocationSelect} />

        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
            <Popup>
              <div className="text-black font-bold">
                Selected Target
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Help Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[8px] font-mono text-white/60 uppercase tracking-widest pointer-events-none">
        Click anywhere to deploy atmospheric sensors
      </div>
    </div>
  );
};

export default GlobalMap;
