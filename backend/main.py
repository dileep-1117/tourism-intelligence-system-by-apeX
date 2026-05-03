from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from model import df
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONTH_MAP = {
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "apr": 4,
    "may": 5,
    "jun": 6,
    "jul": 7,
    "aug": 8,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
}


def parse_month(month: str) -> int:
    value = str(month or "Jan").strip()
    numeric = None

    try:
        numeric = int(value)
    except ValueError:
        numeric = None

    if numeric and 1 <= numeric <= 12:
        return numeric

    return MONTH_MAP.get(value[:3].lower(), 1)


@app.get("/")
def root():
    return {
        "message": "Tourism Demand Forecasting API is running",
        "endpoints": ["/demand?month=Jan", "/recommendations?month=Jan"],
    }


@app.get("/debug")
def debug_info():
    return {
        "total_rows": len(df),
        "columns": df.columns.tolist(),
        "unique_months": sorted(df["month_num"].unique().tolist()),
        "unique_countries": df["country"].unique().tolist(),
        "sample_data": df[
            ["country", "state", "month_num", "latitude", "longitude", "predicted"]
        ].head(3).to_dict(orient="records"),
        "predicted_range": {
            "min": float(df["predicted"].min()),
            "max": float(df["predicted"].max()),
        },
    }


@app.get("/demand")
def demand(month: str = "Jan"):
    import numpy as np

    month_num = parse_month(month)

    clean_df = df.replace([np.inf, -np.inf], np.nan).dropna(
        subset=["country", "state", "month_num", "latitude", "longitude", "predicted"]
    )

    filtered = clean_df[clean_df["month_num"] == month_num]

    result = {}

    for row in filtered.to_dict(orient="records"):
        country = str(row.get("country", "Unknown"))
        lat = float(row.get("latitude", 0))
        lng = float(row.get("longitude", 0))
        tourism = float(row.get("predicted", 50))

        if lat == 0 or lng == 0:
            continue

        # 🔥 EVENT FIX (MAIN PART)
        event = row.get("event")
        if not event or str(event).strip() == "":
            if tourism > 90:
                event = "🔥 Peak tourist season"
            elif tourism > 80:
                event = "🌍 Popular travel period"
            elif tourism < 60:
                event = "📉 Off season"
            else:
                event = "📌 Normal tourism"

        # 🔥 OPTIONAL: SEASON LOGIC
        season_map = {
            12: "Winter", 1: "Winter", 2: "Winter",
            3: "Spring", 4: "Spring", 5: "Spring",
            6: "Summer", 7: "Summer", 8: "Summer",
            9: "Autumn", 10: "Autumn", 11: "Autumn",
        }
        season = season_map.get(month_num, "Unknown")

        if country not in result:
            result[country] = []

        result[country].append({
            "city": str(row.get("state", "Unknown")),
            "lat": lat,
            "lng": lng,
            "tourism_index": tourism,

            # 🔥 ADD THESE (CRITICAL)
            "event": str(event),
            "season": season
        })

    return result


@app.get("/recommendations")
def recommendations(month: str = "Jan"):
    month_num = parse_month(month)
    filtered = df[df["month_num"] == month_num]

    predictions = {}

    for row in filtered.to_dict(orient="records"):
        val = row.get("predicted", 0)

        if val is None or isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
            val = 0

        key = (str(row["country"]), str(row["state"]))
        score = float(val)
        current = predictions.get(key)

        if current and current["score"] >= score:
            continue

        predictions[key] = {
            "country": row["country"],
            "city": row["state"],
            "score": score,
        }

    return sorted(predictions.values(), key=lambda x: x["score"], reverse=True)[:2]
