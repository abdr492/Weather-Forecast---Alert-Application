import React from 'react';
import { 
  Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudFog, 
  CloudDrizzle, Wind, Moon, SunMedium 
} from "lucide-react";

export const getWeatherIcon = (code: number, isDay: boolean = true) => {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs
  if (code === 0) return isDay ? <Sun className="text-yellow-400" /> : <Moon className="text-blue-200" />;
  if (code >= 1 && code <= 3) return isDay ? <SunMedium className="text-yellow-200" /> : <Cloud className="text-slate-400" />;
  if (code >= 45 && code <= 48) return <CloudFog className="text-slate-300" />;
  if (code >= 51 && code <= 55) return <CloudDrizzle className="text-blue-300" />;
  if (code >= 61 && code <= 65) return <CloudRain className="text-blue-500" />;
  if (code >= 71 && code <= 77) return <CloudSnow className="text-blue-100" />;
  if (code >= 80 && code <= 82) return <CloudRain className="text-blue-600" />;
  if (code >= 95 && code <= 99) return <CloudLightning className="text-purple-500" />;
  return <Cloud className="text-slate-400" />;
};

export const getWeatherDescription = (code: number) => {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] || "Cloudy";
};
