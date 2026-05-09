import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '../lib/utils';
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

interface RadarMapProps {
  lat: number;
  lon: number;
  city: string;
  activeLayer: 'radar' | 'satellite' | 'wind' | 'temp' | 'pressure';
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function ZoomControls() {
  const map = useMap();
  
  return (
    <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2">
      <button 
        onClick={() => map.zoomIn()}
        className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
        title="Zoom In"
      >
        <span className="text-xl font-bold">+</span>
      </button>
      <button 
        onClick={() => map.zoomOut()}
        className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
        title="Zoom Out"
      >
        <span className="text-xl font-bold">−</span>
      </button>
    </div>
  );
}

const RadarMap: React.FC<RadarMapProps> = ({ lat, lon, city, activeLayer }) => {
  const center: [number, number] = [lat, lon];
  const owmKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  
  // Layer logic
  const getLayerUrl = () => {
    switch (activeLayer) {
      case 'radar':
        return "https://tilecache.rainviewer.com/v2/radar/current/256/{z}/{x}/{y}/2/1_1.png";
      case 'satellite':
        return "https://tilecache.rainviewer.com/v2/satellite/current/256/{z}/{x}/{y}/0/1_1.png";
      case 'wind':
        return owmKey 
          ? `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${owmKey}`
          : "https://tilecache.rainviewer.com/v2/satellite/current/256/{z}/{x}/{y}/1/1_1.png"; // Fallback to flow
      case 'temp':
        return owmKey 
          ? `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${owmKey}`
          : "https://tilecache.rainviewer.com/v2/satellite/current/256/{z}/{x}/{y}/4/1_1.png"; // Fallback to thermal-ish satellite
      case 'pressure':
        return owmKey 
          ? `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${owmKey}`
          : "";
      default:
        return "";
    }
  };

  const getLegendInfo = () => {
    switch (activeLayer) {
      case 'radar': return { title: 'Precipitation Index', low: 'Mild', high: 'Extreme', gradient: 'bg-gradient-to-r from-blue-500 via-green-500 to-red-600' };
      case 'satellite': return { title: 'Cloud Density', low: 'Clear', high: 'Dense', gradient: 'bg-gradient-to-r from-gray-900 to-white' };
      case 'wind': return { title: 'Wind Speed', low: 'Low', high: 'Gale', gradient: 'bg-gradient-to-r from-emerald-900 via-emerald-500 to-white' };
      case 'temp': return { title: 'Thermal Gradient', low: 'Cold', high: 'Hot', gradient: 'bg-gradient-to-r from-blue-900 via-green-500 to-red-900' };
      case 'pressure': return { title: 'Atmospheric Pressure', low: 'Low', high: 'High', gradient: 'bg-gradient-to-r from-purple-900 to-emerald-900' };
      default: return null;
    }
  };

  const legend = getLegendInfo();

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={6} 
        minZoom={2}
        maxZoom={10}
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#050505' }}
        zoomControl={false}
      >
        <ChangeView center={center} />
        <ZoomControls />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Dynamic Weather Layer */}
        <div className="absolute inset-0 z-[401] pointer-events-none overflow-hidden mix-blend-overlay opacity-30">
          <div className="w-full h-full animate-radar-pulse bg-red-600/5" />
          <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-scanline" />
        </div>

        <TileLayer
          key={activeLayer}
          opacity={activeLayer === 'wind' || activeLayer === 'temp' ? 0.4 : 0.6}
          url={getLayerUrl()}
        />

        {(activeLayer === 'wind' || activeLayer === 'radar') && (
          // Tactical Flow HUD Overlay
          <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(220,38,38,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-wind-flow" />
          </div>
        )}

        <Marker position={center}>
          <Popup>
            <div className="text-black font-bold">
              Station: {city}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Dynamic Legend */}
      {legend && (
        <div className="absolute bottom-6 right-6 z-[1000] bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl w-48">
          <h4 className="text-[10px] text-white/40 uppercase font-mono tracking-widest mb-2 font-black">
            {legend.title}
          </h4>
          <div className={cn("flex gap-1 h-2 mb-2 rounded-full overflow-hidden", legend.gradient)} />
          <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase">
            <span>{legend.low}</span>
            <span>{legend.high}</span>
          </div>
        </div>
      )}

      {/* Warning for missing key if using OWM layers */}
      {(activeLayer === 'temp' || activeLayer === 'pressure' || (activeLayer === 'wind' && owmKey === undefined)) && !owmKey && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-red-600/20 backdrop-blur-md border border-red-600/40 px-4 py-2 rounded-lg text-[8px] font-mono text-red-500 uppercase font-black animate-pulse">
          OpenWeather API Key Required for precise {activeLayer} rendering
        </div>
      )}
    </div>
  );
};

export default RadarMap;
