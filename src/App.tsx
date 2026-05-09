import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, Wind, Droplets, Sun, Map as MapIcon, 
  Bell, Settings, Info, Search, Navigation,
  AlertTriangle, History, Activity, Globe, X, ChevronRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { cn } from './lib/utils';
import { getWeatherIcon, getWeatherDescription } from './components/WeatherInfo';
import RadarMap from './components/RadarMap';
import WeatherEffects from './components/WeatherEffects';
import GlobalMap from './components/GlobalMap';

// Types
interface WeatherData {
  current: any;
  forecast: any;
  aqi: any;
  alerts: any[];
}

const CONTINENTS = {
  "Asia": [
    { name: "Japan", city: "Tokyo", lat: 35.6895, lon: 139.6917 },
    { name: "China", city: "Beijing", lat: 39.9042, lon: 116.4074 },
    { name: "India", city: "Mumbai", lat: 19.0760, lon: 72.8777 },
    { name: "South Korea", city: "Seoul", lat: 37.5665, lon: 126.9780 },
    { name: "Vietnam", city: "Hanoi", lat: 21.0285, lon: 105.8542 }
  ],
  "Europe": [
    { name: "United Kingdom", city: "London", lat: 51.5074, lon: -0.1278 },
    { name: "France", city: "Paris", lat: 48.8566, lon: 2.3522 },
    { name: "Germany", city: "Berlin", lat: 52.5200, lon: 13.4050 },
    { name: "Italy", city: "Rome", lat: 41.9028, lon: 12.4964 },
    { name: "Spain", city: "Madrid", lat: 40.4168, lon: -3.7038 }
  ],
  "North America": [
    { name: "USA", city: "New York", lat: 40.7128, lon: -74.0060 },
    { name: "Canada", city: "Toronto", lat: 43.6532, lon: -79.3832 },
    { name: "Mexico", city: "Mexico City", lat: 19.4326, lon: -99.1332 }
  ],
  "Africa": [
    { name: "Egypt", city: "Cairo", lat: 30.0444, lon: 31.2357 },
    { name: "South Africa", city: "Cape Town", lat: -33.9249, lon: 18.4241 },
    { name: "Nigeria", city: "Lagos", lat: 6.5244, lon: 3.3792 }
  ],
  "Oceania": [
    { name: "Australia", city: "Sydney", lat: -33.8688, lon: 151.2093 },
    { name: "New Zealand", city: "Auckland", lat: -36.8485, lon: 174.7633 }
  ]
};

export default function App() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [city, setCity] = useState<string>("Detecting...");
  const [country, setCountry] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'history' | 'alerts' | 'global'>('dashboard');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [activeRadarLayer, setActiveRadarLayer] = useState<'radar' | 'satellite' | 'wind' | 'temp' | 'pressure'>('radar');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          fetchWeatherData(latitude, longitude);
        },
        (err) => {
          console.error("Geo error:", err);
          const defaultLoc = { lat: 51.5074, lon: -0.1278 };
          setLocation(defaultLoc);
          setCity("London");
          fetchWeatherData(defaultLoc.lat, defaultLoc.lon);
        }
      );
    }
  }, []);

  const fetchWeatherData = async (lat: number, lon: number, cityName?: string, countryName?: string) => {
    setLoading(true);
    try {
      if (cityName) {
        setCity(cityName);
        setCountry(countryName || "");
      } else {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${lat}&longitude=${lon}`);
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results[0]) {
          setCity(geoData.results[0].name);
          setCountry(geoData.results[0].country || "");
        } else {
          setCity("Current Vector");
          setCountry("");
        }
      }

      const [currRes, foreRes, aqiRes, alertRes] = await Promise.all([
        fetch(`/api/weather/current?lat=${lat}&lon=${lon}`),
        fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`),
        fetch(`/api/weather/aqi?lat=${lat}&lon=${lon}`),
        fetch(`/api/weather/alerts?lat=${lat}&lon=${lon}`)
      ]);

      const [current, forecast, aqi, alertsData] = await Promise.all([
        currRes.json(),
        foreRes.json(),
        aqiRes.json(),
        alertRes.json()
      ]);

      setWeather({ current, forecast, aqi, alerts: alertsData.alerts });
    } catch (err) {
      setError("Failed to sync with atmospheric sensors.");
    } finally {
      setLoading(false);
    }
  };

  const selectCountry = (item: { name: string, city: string, lat: number, lon: number }) => {
    setLocation({ lat: item.lat, lon: item.lon });
    setCity(item.city);
    setCountry(item.name);
    fetchWeatherData(item.lat, item.lon, item.city, item.name);
    setActiveTab('dashboard');
  };

  const onMapLocationSelect = (lat: number, lon: number) => {
    setLocation({ lat, lon });
    fetchWeatherData(lat, lon);
    setActiveTab('dashboard');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-red-600 font-mono text-sm tracking-widest uppercase italic">Crimson Sky Initialization...</span>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600 selection:text-white flex flex-col h-screen overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#3a0d0d_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Header Bar */}
      <header className="h-16 flex items-center justify-between px-8 bg-[#0A0A0A] border-b border-red-900/30 relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <Globe size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter italic uppercase text-white">CRIMSON <span className="text-red-500 font-black">SKY</span></h1>
            <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE_DATA_FEED
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-white/50">
          <button onClick={() => setActiveTab('dashboard')} className={cn("transition-colors hover:text-white cursor-pointer", activeTab === 'dashboard' && "text-red-500")}>Dashboard</button>
          <button onClick={() => setActiveTab('map')} className={cn("transition-colors hover:text-white cursor-pointer", activeTab === 'map' && "text-red-500")}>Radar</button>
          <button onClick={() => setActiveTab('global')} className={cn("transition-colors hover:text-white cursor-pointer", activeTab === 'global' && "text-red-500")}>Continents</button>
          <button onClick={() => setActiveTab('alerts')} className={cn("transition-colors hover:text-white cursor-pointer", activeTab === 'alerts' && "text-red-500")}>Alerts</button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
            <Search size={14} className="text-white/20" />
            <input type="text" placeholder="COORD SEARCH..." className="bg-transparent border-none outline-none text-[10px] font-mono placeholder:text-white/20 text-white" />
          </div>
          <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-black text-xs uppercase italic tracking-tighter transition-all shadow-[0_4px_20px_rgba(220,38,38,0.2)] text-white cursor-pointer">Premium Pro</button>
        </div>
      </header>

      {/* Primary Dashboard Grid */}
      <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden relative z-10">
        
        {/* Left Col (3): Current Stats & Alerts */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar">
          {/* Main Weather Card */}
          <section className="bg-gradient-to-br from-[#1A0A0A] to-[#0A0A0A] border border-red-900/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            {weather && (
              <WeatherEffects 
                key={weather.current.current.weather_code} 
                code={weather.current.current.weather_code} 
                isDay={weather.current.current.is_day === 1}
              />
            )}
            <div className="absolute top-4 right-4 bg-red-600/10 border border-red-600/30 rounded px-2 py-1 text-[8px] font-mono text-red-500 uppercase font-black tracking-widest relative z-10">Critical</div>
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="flex flex-col items-center mb-2">
                <span className="text-white/40 font-mono text-xs uppercase tracking-[0.2em]">{city}</span>
                {country && <span className="text-red-500/60 font-mono text-[8px] uppercase tracking-[0.3em] font-black">{country}</span>}
              </div>
              <div className="relative">
                <h2 className="text-8xl font-black italic tracking-tighter leading-none mb-4 text-white">
                  {Math.round(weather?.current.current.temperature_2m)}°
                </h2>
                <div className="absolute -right-8 top-2 opacity-40 group-hover:opacity-80 transition-opacity translate-x-4">
                   {weather && React.cloneElement(getWeatherIcon(weather.current.current.weather_code) as React.ReactElement, { size: 64 })}
                </div>
              </div>
              <p className="text-red-400 font-bold uppercase italic tracking-tight mb-8">{getWeatherDescription(weather?.current.current.weather_code)}</p>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <MiniStat label="Humidity" value={`${weather?.current.current.relative_humidity_2m}%`} />
                <MiniStat label="Wind" value={`${weather?.current.current.wind_speed_10m} km/h`} />
              </div>
            </div>
          </section>

          {/* Warnings List */}
          <section className="flex-1 bg-[#0A0A0A] border border-red-900/20 rounded-3xl p-6 flex flex-col overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Active Warnings</h3>
                <span className="bg-red-600 px-2 py-0.5 rounded text-[8px] font-black text-white">{weather?.alerts.length} ACTIVE</span>
             </div>
             <div className="space-y-4 overflow-y-auto flex-1 no-scrollbar text-white">
                {weather?.alerts.map(alert => (
                  <div key={alert.id} className={cn(
                    "p-4 rounded-xl border border-white/5 transition-all hover:bg-white/5",
                    alert.severity === 'Critical' ? "border-l-4 border-l-red-600 bg-red-600/5" : "border-l-4 border-l-red-900 bg-white/5"
                  )}>
                    <h4 className="text-xs font-black uppercase tracking-tight text-red-500 mb-1">{alert.type}</h4>
                    <p className="text-[10px] text-white/50 leading-relaxed">{alert.description}</p>
                  </div>
                ))}
             </div>
             <button onClick={() => setActiveTab('alerts')} className="mt-6 text-center text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors cursor-pointer">Tactical Config</button>
          </section>
        </div>

        {/* Center Col (6): Radar & Visualization / Main Content */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dash-center"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6 h-full overflow-hidden"
              >
                {/* Simulated Radar View */}
                <div className="flex-1 bg-[#080808] border border-white/5 rounded-3xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#111_0%,#000_100%)]" />
                  <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }} />
                  
                  {/* Radar Sweepers */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none"
                  >
                    <div className="w-[1px] h-full bg-gradient-to-t from-red-600/40 via-red-600 to-transparent" style={{ transformOrigin: 'center bottom', height: '100%', bottom: '50%' }} />
                    <div className="w-[1px] h-full bg-gradient-to-t from-emerald-600/20 via-emerald-600 to-transparent rotate-180" style={{ transformOrigin: 'center bottom', height: '100%', bottom: '50%' }} />
                  </motion.div>

                  {/* Overlays */}
                  <div className="absolute inset-0 p-8 flex flex-col pointer-events-none">
                    <div className="flex justify-between items-start pointer-events-auto">
                      <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                        <span className="text-[10px] text-white/30 uppercase font-mono tracking-widest block mb-1">Aether Radar Frame</span>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-emerald-500 font-mono text-[10px] uppercase tracking-tighter">Lat {location?.lat.toFixed(4)} / Lon {location?.lon.toFixed(4)}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white uppercase italic tracking-tight">{city}</span>
                            {country && <span className="text-[8px] font-mono text-red-500/60 font-black uppercase tracking-widest">// {country}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <RadarBtn label="Precip" active />
                        <RadarBtn label="Thermal" />
                        <RadarBtn label="Flow" />
                      </div>
                    </div>
                    
                    <div className="mt-auto pointer-events-auto">
                      <div className="bg-black/60 backdrop-blur border border-white/5 p-4 rounded-2xl w-48">
                         <div className="flex gap-1 h-1.5 mb-2 rounded-full overflow-hidden">
                           <div className="flex-1 bg-green-500/40" />
                           <div className="flex-1 bg-yellow-500/40" />
                           <div className="flex-1 bg-red-600/40" />
                           <div className="flex-1 bg-purple-600/40" />
                         </div>
                         <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase">
                            <span>Mild</span>
                            <span>Extreme</span>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Central Node */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-red-600 rounded-full shadow-[0_0_20px_#dc2626]" />
                    <div className="absolute w-24 h-24 border border-red-600/20 rounded-full animate-ping" />
                  </div>
                </div>

                {/* Forecast Strip */}
                <div className="h-44 bg-[#0A0A0A] border border-white/5 rounded-3xl p-4 flex gap-4 text-white">
                  {weather?.forecast.daily.time.slice(0, 6).map((date: string, i: number) => (
                    <div key={date} className={cn(
                      "flex-1 rounded-2xl p-4 flex flex-col items-center justify-between border transition-all hover:bg-white/5 group",
                      i === 0 ? "bg-red-600/5 border-red-600/20" : "bg-white/5 border-white/5"
                    )}>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", i === 0 ? "text-red-500" : "text-white/40")}>
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                      </span>
                      <div className="group-hover:scale-110 transition-transform">
                        {getWeatherIcon(weather.forecast.daily.weather_code[i])}
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-black italic tracking-tighter">{Math.round(weather.forecast.daily.temperature_2m_max[i])}°</span>
                        <span className="text-[10px] font-mono text-white/20">{Math.round(weather.forecast.daily.temperature_2m_min[i])}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'global' && (
              <motion.div 
                key="global-center" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6 h-full overflow-hidden"
              >
                <div className="bg-[#0A0A0A] border border-red-900/30 rounded-3xl p-8 h-full flex flex-col overflow-hidden text-white">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Theater of Operations</h2>
                      <p className="text-white/40 text-sm">Deploy atmospheric sensors across global sectors.</p>
                    </div>
                    {!selectedContinent && (
                      <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-4 flex items-center gap-4">
                        <Activity className="text-red-500 animate-pulse" size={20} />
                        <div>
                          <p className="text-[8px] font-black uppercase text-red-500 tracking-[0.2em] mb-0.5">Tactical Hubs</p>
                          <p className="text-xs font-bold font-mono">18 NODES ONLINE</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 xl:grid-cols-2 gap-6 pb-4">
                    <div className="h-[400px] xl:h-full min-h-[400px]">
                      <GlobalMap onLocationSelect={onMapLocationSelect} selectedLocation={location} />
                    </div>

                    <div className="flex flex-col gap-8">
                      {selectedContinent ? (
                        <div className="col-span-full">
                          <button onClick={() => setSelectedContinent(null)} className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest mb-6 hover:translate-x-[-4px] transition-transform cursor-pointer">
                            <X size={12} /> Back to Regions
                          </button>
                          <h3 className="text-xl font-bold uppercase mb-4 text-white/60">{selectedContinent} Hub Analysis</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {CONTINENTS[selectedContinent as keyof typeof CONTINENTS].map(item => (
                              <button 
                                key={item.city} 
                                onClick={() => selectCountry(item)}
                                className="group bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:bg-red-600/20 hover:border-red-600/40 transition-all text-left cursor-pointer"
                              >
                                <div>
                                  <h4 className="font-bold text-lg leading-none mb-1 group-hover:text-red-500 transition-colors text-white">{item.city}</h4>
                                  <span className="text-[10px] text-white/30 uppercase font-mono tracking-widest">{item.name}</span>
                                </div>
                                <ChevronRight className="text-white/10 group-hover:text-red-500 transition-colors" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-12">
                          {/* Summary Widget */}
                          <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-6 flex items-center gap-2">
                              <Globe size={12} /> Atmospheric Hub Overview
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                              {Object.entries(CONTINENTS).map(([region, cities]) => (
                                <button 
                                  key={region}
                                  onClick={() => setSelectedContinent(region)}
                                  className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all text-left group cursor-pointer"
                                >
                                  <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{region}</span>
                                    <ChevronRight size={14} className="text-white/10 group-hover:text-red-600 transition-colors" />
                                  </div>
                                  <div className="flex flex-col gap-3">
                                    {cities.slice(0, 2).map(city => (
                                      <div key={city.city} className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-white/80">{city.city}</span>
                                        <span className="text-xs font-mono text-red-500 font-black italic">ACTIVE</span>
                                      </div>
                                    ))}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </section>

                          {/* Region Selector */}
                          <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Regional Deployments</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                              {Object.keys(CONTINENTS).map(continent => (
                                <button 
                                  key={continent}
                                  onClick={() => setSelectedContinent(continent)}
                                  className="aspect-video bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-red-600/10 hover:border-red-600/50 transition-all group cursor-pointer"
                                >
                                  <Globe size={20} className="text-white/10 group-hover:text-red-600 transition-colors" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-white/60 group-hover:text-white">{continent}</span>
                                </button>
                              ))}
                            </div>
                          </section>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'alerts' && (
              <motion.div key="alerts-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full bg-[#0A0A0A] border border-red-900/30 rounded-3xl p-8 overflow-y-auto no-scrollbar text-white">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-8">Alert Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <AlertPreference label="Extreme Heat Index" threshold="> 38°C" active />
                   <AlertPreference label="Gale Warning" threshold="> 50 km/h" active />
                   <AlertPreference label="Frost Alert" threshold="< 1°C" active={false} />
                   <AlertPreference label="AQI Health Alerts" threshold="> 150" active />
                </div>
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div 
                key="radar-center" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col gap-6"
              >
                <div className="flex-1 bg-[#0A0A0A] border border-red-900/30 rounded-3xl overflow-hidden relative">
                  {location && (
                    <RadarMap lat={location.lat} lon={location.lon} city={city} activeLayer={activeRadarLayer} />
                  )}
                  
                  {/* Radar HUD Overlay */}
                  <div className="absolute top-6 left-6 z-10 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#dc2626]" />
                        <span className="text-[10px] text-white font-mono uppercase tracking-[0.2em] font-black">Live Satellite Feed</span>
                      </div>
                      <p className="text-[10px] text-white/40 font-mono uppercase tracking-tighter">
                        Mode: {activeRadarLayer.toUpperCase()} / Link: RED_DELTA_9
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-6 right-6 z-10 flex flex-wrap justify-end gap-2 max-w-full">
                    <button 
                      onClick={() => setActiveRadarLayer('radar')}
                      className={cn(
                        "px-4 py-2 rounded font-black text-[10px] uppercase italic tracking-tighter transition-all cursor-pointer",
                        activeRadarLayer === 'radar' ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-white/5 backdrop-blur-md border border-white/10 text-white/40 hover:text-white"
                      )}
                    >
                      Precipitation
                    </button>
                    <button 
                      onClick={() => setActiveRadarLayer('temp')}
                      className={cn(
                        "px-4 py-2 rounded font-black text-[10px] uppercase italic tracking-tighter transition-all cursor-pointer",
                        activeRadarLayer === 'temp' ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-white/5 backdrop-blur-md border border-white/10 text-white/40 hover:text-white"
                      )}
                    >
                      Temperature
                    </button>
                    <button 
                      onClick={() => setActiveRadarLayer('wind')}
                      className={cn(
                        "px-4 py-2 rounded font-black text-[10px] uppercase italic tracking-tighter transition-all cursor-pointer",
                        activeRadarLayer === 'wind' ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-white/5 backdrop-blur-md border border-white/10 text-white/40 hover:text-white"
                      )}
                    >
                      Wind Speed
                    </button>
                    <button 
                      onClick={() => setActiveRadarLayer('satellite')}
                      className={cn(
                        "px-4 py-2 rounded font-black text-[10px] uppercase italic tracking-tighter transition-all cursor-pointer",
                        activeRadarLayer === 'satellite' ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-white/5 backdrop-blur-md border border-white/10 text-white/40 hover:text-white"
                      )}
                    >
                      Satellite
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Col (3): Advanced Data & AQI */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pl-2 no-scrollbar text-white">
          {/* AQI Module */}
          <section className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6 font-mono">Atmospheric Quality</h3>
            <div className="flex items-center gap-6">
               <div className="relative w-24 h-24 flex items-center justify-center">
                 <svg className="absolute w-full h-full transform -rotate-90">
                   <circle cx="48" cy="48" r="44" fill="transparent" stroke="#111" strokeWidth="6" />
                   <circle cx="48" cy="48" r="44" fill="transparent" stroke="#dc2626" strokeWidth="6" strokeDasharray="276" strokeDashoffset={276 - (276 * (weather?.aqi.current.us_aqi || 0) / 300)} strokeLinecap="round" className="transition-all duration-1000" />
                 </svg>
                 <span className="text-2xl font-black italic tracking-tighter text-white">{weather?.aqi.current.us_aqi}</span>
               </div>
               <div className="flex-1">
                 <p className="text-red-500 font-black italic text-lg leading-none mb-2">POOR</p>
                 <p className="text-[9px] text-white/40 font-mono leading-tight uppercase">Particulate concentration high in sector {city.toUpperCase()}.</p>
               </div>
            </div>
          </section>

          {/* Meteorological Details */}
          <section className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-8 font-mono">Telemetry Data</h3>
            <div className="space-y-6 flex-1">
               <TelemetryItem label="Pressure MSL" value={`${weather?.current.current.pressure_msl} hPa`} progress={70} />
               <TelemetryItem label="UV Index Max" value={weather?.forecast.daily.uv_index_max[0]} progress={40} color="bg-yellow-500" />
               <TelemetryItem label="Cloud Cover" value={`${weather?.current.current.cloud_cover}%`} progress={weather?.current.current.cloud_cover} color="bg-blue-600" />
               
               <div className="pt-8 border-t border-white/5">
                  <h4 className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-4 font-mono">Historical Vector</h4>
                  <div className="h-20 flex items-end gap-1">
                    {[30, 45, 80, 60, 40, 55, 90].map((h, i) => (
                      <div key={i} className={cn("flex-1 rounded-t-sm transition-all hover:opacity-100", i === 6 ? "bg-red-600 opacity-100" : "bg-white/10 opacity-30")} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <p className="text-[9px] text-white/20 font-mono mt-3 uppercase tracking-tighter">+12% Thermal deviation vs 5yr average</p>
               </div>
            </div>

            {/* Widget Preview Mini */}
            <div className="mt-8 bg-red-600/10 border border-red-600/30 rounded-2xl p-4 flex justify-between items-center group cursor-pointer hover:bg-red-600/20 transition-colors">
               <div className="flex flex-col">
                 <span className="text-[8px] font-black font-mono text-red-500 uppercase tracking-widest mb-1 text-red-500">Station Widget</span>
                 <span className="text-xs font-bold font-mono text-white">32° CLOUD_PEAK</span>
               </div>
               <Activity size={18} className="text-red-600 group-hover:scale-125 transition-transform" />
            </div>
          </section>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-[#0A0A0A] border-t border-red-900/30 px-8 flex items-center justify-between text-[8px] font-mono text-white/30 uppercase tracking-[0.2em] relative z-20">
         <div className="flex gap-8">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600 rounded-full" />SOURCE: CRIMSON_W_CORE</span>
            <span>Uptime: 99.98%</span>
         </div>
         <div className="flex gap-8 items-center">
            <span>Refresh: {new Date().toLocaleTimeString()}</span>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
               <span className="text-emerald-500 font-black italic">Systems Operational</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

// Subcomponents
function MiniStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center">
      <span className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">{label}</span>
      <span className="text-sm font-black font-mono italic text-white">{value}</span>
    </div>
  );
}

function RadarBtn({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={cn(
      "px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer",
      active ? "bg-red-600 text-white border-red-500 shadow-[0_4px_15px_rgba(220,38,38,0.3)]" : "bg-black/60 border-white/10 text-white/40 hover:bg-white/10"
    )}>
      {label}
    </button>
  );
}

function TelemetryItem({ label, value, progress, color = "bg-red-600" }: { label: string, value: any, progress: number, color?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <span className="text-[9px] font-mono text-white/40 uppercase">{label}</span>
        <span className="text-xs font-bold font-mono text-white">{value}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={cn("h-full", color)} />
      </div>
    </div>
  );
}

function AlertPreference({ label, threshold, active }: { label: string, threshold: string, active: boolean }) {
  const [toggle, setToggle] = useState(active);
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all text-white">
       <div>
         <h4 className="font-bold text-sm mb-1">{label}</h4>
         <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Trigger: {threshold}</span>
       </div>
       <button onClick={() => setToggle(!toggle)} className={cn(
         "w-12 h-6 rounded-full relative transition-colors cursor-pointer",
         toggle ? "bg-red-600" : "bg-white/10"
       )}>
         <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", toggle ? "left-7" : "left-1")} />
       </button>
    </div>
  );
}
