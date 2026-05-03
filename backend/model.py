import os

import numpy as np
import pandas as pd
from xgboost import XGBRegressor


# =========================
# LOAD ALL CSV FILES
# =========================
folder = "data"
files = [f for f in os.listdir(folder) if f.endswith(".csv")]

df_list = []

for file in files:
    temp = pd.read_csv(os.path.join(folder, file))
    temp.columns = temp.columns.str.strip().str.lower()
    df_list.append(temp)

df = pd.concat(df_list, ignore_index=True)

print("FINAL COLUMNS:", df.columns.tolist())

# =========================
# CHECK REQUIRED
# =========================
required = ["country", "month", "tourism_index", "state", "event", "latitude", "longitude"]

for col in required:
    if col not in df.columns:
        raise Exception(f"Missing column: {col}")

# =========================
# FIX MONTH (NUMERIC + STRING SUPPORT)
# =========================
df["month"] = df["month"].astype(str).str.strip()

# try numeric first
df["month_num"] = pd.to_numeric(df["month"], errors="coerce")

# fallback to text months
month_map = {
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

df.loc[df["month_num"].isna(), "month_num"] = (
    df["month"].str[:3].str.lower().map(month_map)
)

# FIX: Any remaining NaN -> 1 (January default)
df["month_num"] = df["month_num"].fillna(1).astype(int)

print("MONTH NUM:", df["month_num"].unique())
print(f"Rows per month: {df['month_num'].value_counts().sort_index().to_dict()}")

# =========================
# DATA CLEANING
# =========================
# Convert mixed CSV values into real numbers before XGBoost sees them.
numeric_cols = ["latitude", "longitude", "tourism_index"]
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# Remove rows with NaN in critical columns.
df = df.dropna(subset=numeric_cols)

# Replace inf values.
for col in numeric_cols:
    df[col] = df[col].replace([np.inf, -np.inf], np.nan).fillna(0).astype(float)

print(f"Rows after cleaning: {len(df)}")
print(f"Final columns: {df.columns.tolist()}")
print(
    "Sample data:\n"
    f"{df[['country', 'state', 'month_num', 'latitude', 'longitude', 'tourism_index']].head(5)}"
)

# =========================
# ENCODING
# =========================
df["country_code"] = df["country"].astype("category").cat.codes
df["city_code"] = df["state"].astype("category").cat.codes
df["event_code"] = df["event"].astype("category").cat.codes

# =========================
# SORT + LAG
# =========================
df = df.sort_values(["country", "state", "month_num"])

df["lag_1"] = df.groupby(["country", "state"])["tourism_index"].shift(1)
df["lag_1"] = df["lag_1"].fillna(df["tourism_index"])
df["lag_1"] = pd.to_numeric(df["lag_1"], errors="coerce").fillna(0).astype(float)

# =========================
# MODEL TRAIN
# =========================
X = df[["month_num", "country_code", "city_code", "event_code", "lag_1"]]
y = df["tourism_index"]

X = X.apply(pd.to_numeric, errors="coerce").fillna(0)
y = pd.to_numeric(y, errors="coerce").fillna(0)

model = XGBRegressor(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    objective="reg:squarederror",
)

model.fit(X, y)

print("MODEL TRAINED")

# =========================
# CACHE PREDICTIONS
# =========================
df["predicted"] = model.predict(X)

# FIX INVALID VALUES
df["predicted"] = df["predicted"].replace([np.inf, -np.inf], np.nan)
df["predicted"] = df["predicted"].fillna(0)

# DEBUG: Verify data quality
print("Predictions cached")
print(f"Total rows: {len(df)}")
print(f"Unique months: {sorted(df['month_num'].unique())}")
print(f"Unique countries: {df['country'].unique()}")
print(f"Predicted min/max: {df['predicted'].min():.2f} / {df['predicted'].max():.2f}")
print(f"NaN values in predicted: {df['predicted'].isna().sum()}")
print(
    "Sample data (first 3 rows):\n"
    f"{df[['country', 'state', 'month_num', 'latitude', 'longitude', 'predicted']].head(3)}"
)
