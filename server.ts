import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Weather API Proxy
  app.get("/api/weather/current", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Weather Current Error:", error);
      res.status(500).json({ error: "Failed to fetch current weather" });
    }
  });

  app.get("/api/weather/forecast", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=auto`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forecast" });
    }
  });

  app.get("/api/weather/aqi", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      const response = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AQI" });
    }
  });

  // Simulated Alerts Endpoint
  // In a real app, this would query a global weather alert database or specific regional APIs
  app.get("/api/weather/alerts", async (req, res) => {
    // For demo purposes, we generate some "mock" severe alerts based on random logic 
    // or simply return an empty array if conditions are mild.
    const mockAlerts = [
      {
        id: "alert-1",
        type: "Severe Thunderstorm",
        severity: "Critical",
        description: "Severe thunderstorm warning in effect for the next 4 hours. Expect high winds and possible hail.",
        time: new Date().toISOString()
      },
      {
        id: "alert-2",
        type: "Heat Advisory",
        severity: "Alert",
        description: "Excessive heat expected tomorrow. Stay hydrated and avoid outdoor activities during peak hours.",
        time: new Date().toISOString()
      }
    ];
    res.json({ alerts: mockAlerts });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
