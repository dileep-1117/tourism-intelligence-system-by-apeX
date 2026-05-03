import { useCallback, useEffect, useRef, useState } from "react";
import GlobeGL from "react-globe.gl";
import { fetchDemand } from "../services/api";

function Globe({ month }) {
  const [points, setPoints] = useState([]);
  const globeRef = useRef();

  // 🌍 Smooth globe rotation
  useEffect(() => {
    if (!globeRef.current) return;

    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
  }, []);

  // 🔥 FIX: get event based on month
  const getEventForMonth = (city, month) => {
    if (!month) return "No major event";

    const m = month.toLowerCase();

    // case 1: events object
    if (city.events && typeof city.events === "object") {
      return (
        city.events[month] ||
        city.events[m] ||
        "No major event"
      );
    }

    // case 2: event_jan, event_feb...
    if (city[`event_${m}`]) {
      return city[`event_${m}`];
    }

    // fallback
    return city.event || "No major event";
  };

  const loadData = useCallback(async () => {
    try {
      const data = await fetchDemand(month);
      if (!data) return;

      const groupedPoints = new Map();

      Object.entries(data).forEach(([country, cities]) => {
        if (!Array.isArray(cities)) return;

        cities.forEach((city) => {
          const lat = Number(city.lat);
          const lng = Number(city.lng);
          const value = Number(city.tourism_index);

          if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(value)) {
            return;
          }

          const key = `${lat.toFixed(4)}:${lng.toFixed(4)}`;
          const existing = groupedPoints.get(key);

          if (existing) {
            existing.total += value;
            existing.count += 1;
          } else {
            groupedPoints.set(key, {
              lat,
              lng,
              city: city.city,
              country,
              total: value,
              count: 1,

              // ✅ FIXED
              event: getEventForMonth(city, month),
              season: city.season || "Normal season",
            });
          }
        });
      });

      const rawPoints = Array.from(groupedPoints.values()).map((p) => ({
        lat: p.lat,
        lng: p.lng,
        city: p.city,
        country: p.country,
        value: p.total / p.count,
        event: p.event,
        season: p.season,
      }));

      if (!rawPoints.length) return;

      const values = rawPoints.map((p) => p.value);
      const min = Math.min(...values);
      const max = Math.max(...values);

      const pts = rawPoints.map((p) => {
        const norm = (p.value - min) / (max - min || 1);
        const v = Math.max(norm, 0.08);

        const r = Math.floor(255 * v);
        const g = Math.floor(80 * (1 - v));
        const b = Math.floor(255 * (1 - v));

        return {
          lat: p.lat,
          lng: p.lng,
          city: p.city,
          country: p.country,
          tourism_index: p.value,
          event: p.event,
          season: p.season,
          size: 0.15 + v * 0.4,
          color: `rgba(${r}, ${g}, ${b}, 0.95)`
        };
      });

      setPoints(pts);

    } catch (err) {
      console.error("Load error:", err);
    }
  }, [month]);

  useEffect(() => {
    if (!month) return;

    const t = setTimeout(loadData, 300);
    return () => clearTimeout(t);
  }, [loadData, month]);

  return (
    <div className="globe-stage">
      <GlobeGL
        ref={globeRef}
        width={window.innerWidth}
        height={window.innerHeight}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"

        pointsData={points}
        pointLat={(d) => d.lat}
        pointLng={(d) => d.lng}
        pointAltitude={0.006}
        pointRadius={(d) => d.size}
        pointColor={(d) => d.color}

        pointsMerge={false}
        pointsTransitionDuration={800}

        // 🔥 TOOLTIP WITH EVENTS
        pointLabel={(d) => `
          <div style="
            background: rgba(0,0,0,0.85);
            padding: 10px;
            border-radius: 10px;
            color: white;
            min-width: 160px;
          ">
            <strong>${d.city}</strong><br/>
            <span>${d.country}</span><br/><br/>

            🔥 Event: ${d.event}<br/>
            📅 Season: ${d.season}<br/>
            📊 Index: ${Number(d.tourism_index).toFixed(1)}
          </div>
        `}

        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.2}
      />
    </div>
  );
}

export default Globe;