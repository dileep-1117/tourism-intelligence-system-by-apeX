const BASE = "http://127.0.0.1:8000";

export const fetchDemand = async (month) => {
  try {
    console.log("fetchDemand month:", month);

    const res = await fetch(`${BASE}/demand?month=${encodeURIComponent(month)}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    console.log("Demand API response:", data);

    return data;
  } catch (err) {
    console.error("Demand API error:", err.message);

    return null;
  }
};

export const fetchRecommendations = async (month) => {
  try {
    console.log("fetchRecommendations month:", month);

    const res = await fetch(`${BASE}/recommendations?month=${encodeURIComponent(month)}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.error("Recommendation API error:", err.message);

    return null;
  }
};
