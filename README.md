# Tourism Intelligence System

An interactive Tourism Demand Forecasting and Visualization System that predicts tourist activity across locations and visualizes it on a 3D globe.

The system combines Machine Learning, real-time APIs, and 3D visualization to analyze tourism trends based on time (month), location, and events.

---

## Features

- Interactive 3D globe visualization  
- Tourism demand prediction using machine learning  
- Month-based slider for dynamic analysis  
- Hover insights (city, tourism index, event, season)  
- Top destination recommendation system  
- Multi-country support (5 countries dataset)

---

## Dataset

This project uses tourism data from 5 countries.

Each dataset includes:
- Country  
- City/State  
- Month  
- Tourism Index  
- Latitude and Longitude  
- Event information  

---

## Tech Stack

- Frontend: React (Vite), react-globe.gl, Three.js  
- Backend: FastAPI  
- Machine Learning: XGBoost, Pandas, NumPy  
- Data: CSV datasets  

---

## Installation and Setup

### 1. Clone the Project

```bash
git clone <your-repo-link>
cd tourism-website

2. Backend Setup

cd backend

# Create virtual environment
python -m venv .venv

# Activate environment

# Windows:
.venv\Scripts\activate

# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pandas numpy xgboost

# Run backend server
uvicorn main:app --reload

Backend will run at:

http://127.0.0.1:8000

3. Frontend Setup

Open a new terminal:

cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

Frontend will run at:

http://localhost:5173

## How It Works

1. User selects a month using the slider  
2. Frontend sends a request to the backend API  
3. Backend processes data and generates predictions using the ML model  
4. API returns tourism demand data  
5. Globe updates in real time  
6. Hovering on points displays:
   - City  
   - Tourism Index  
   - Event  
   - Season  

---

## API Endpoints

- `/demand?month=Jan`  
  Returns tourism data for visualization  

- `/recommendations?month=Jan`  
  Returns the top destination  

---

## Usage

- Use the slider to explore tourism trends by month  
- Click "Show Recommendations" to get the top destination  
- Hover over globe points to view detailed insights  

---

## Notes

- Ensure the backend is running before starting the frontend  
- Dataset is limited to 5 countries for demonstration purposes  
- The system is designed to scale with additional datasets  
