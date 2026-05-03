import { useState } from "react";
import { fetchRecommendations } from "../services/api";
import Recommendation from "./Recommendation";

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function ControlPanel({ month, setMonth }) {
  const [recommendations, setRecommendations] = useState([]);

  const handleSlider = (e) => {
    const index = parseInt(e.target.value, 10);
    const selected = months[index];

    console.log("Slider month:", selected);
    setMonth(selected);
    setRecommendations([]);
  };

  const handleRecommendations = async () => {
    try {
      console.log("Fetching recommendations for:", month);

      const data = await fetchRecommendations(month);
      if (!data) return;

      const flat = Array.isArray(data) ? data : Object.values(data).flat();
      const unique = Array.from(
        new Map(flat.map((item) => [`${item.city}_${item.country}`, item])).values()
      );

      const sorted = unique.sort(
        (a, b) => (b.score || b.tourism_index || 0) - (a.score || a.tourism_index || 0)
      );

      setRecommendations(sorted.slice(0, 2));
    } catch (err) {
      console.error("Recommendation error:", err);
    }
  };

  return (
    <div className="panel">
      <h2>Select Month</h2>

      <input
        type="range"
        min={0}
        max={11}
        step={1}
        value={months.indexOf(month)}
        onChange={handleSlider}
        style={{ width: "100%" }}
      />

      <h3>{month}</h3>

      <button className="recommend-button" onClick={handleRecommendations}>
        Show Recommendations
      </button>

      <h3>Top Places</h3>

      {recommendations.length === 0 ? (
        <p className="recommend-empty">Click button to load</p>
      ) : (
        <div className="recommend-list">
          {recommendations.map((p, i) => (
            <Recommendation key={`${p.country}-${p.city}`} place={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ControlPanel;
