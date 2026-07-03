# UrbanHive 🏙️

UrbanHive is a comprehensive Smart City Management OS designed to monitor and manage urban infrastructure in real-time. It features interactive map visualizations, live traffic simulation, and emergency response coordination.

## 🌟 Features

- **Interactive City Map**: Toggle layers for Infrastructure, Live Traffic, Parking availability, EV Charging Stations, and Petrol Pumps.
- **Emergency Corridors**: Dedicated UI to create and activate "Green Corridors" for emergency vehicles (ambulances, fire trucks). It clears junctions and provides ETA tracking.
- **Traffic Simulation**: Integrated with SUMO (Simulation of Urban MObility) to visualize traffic flows and junction states.
- **Real-Time Data**: WebSocket-powered relay server ensuring the frontend stays perfectly synced with backend simulations and events.
- **Modern UI**: Sleek, responsive, and dynamic interface built with React and Tailwind CSS.

## 🏗️ Architecture

The project is divided into three main microservices:

1. **Frontend (`/frontend`)**: A React (Vite) application that serves the interactive dashboard and map UI.
2. **Backend (`/backend`)**: A FastAPI Python server that processes data, handles API requests, and integrates with the SUMO traffic simulation (`/backend/sumo`).
3. **Relay Server (`/relay`)**: A Node.js WebSocket server running on port 3001 that bridges real-time communications between the backend and frontend.

## 🚀 Getting Started

### Prerequisites
- **Node.js & npm** (for frontend and relay server)
- **Python 3.x** (for backend - Conda environment recommended)
- **SUMO (Simulation of Urban MObility)** installed on your system and added to your PATH (required for running simulations).

### Quick Start (Windows)

The easiest way to get everything running is to use the provided batch script. Open a terminal (if using Conda, open your Anaconda Prompt and activate your environment, e.g., `conda activate route`), and run:

```bash
.\start_all.bat
```

This will automatically launch three separate windows:
- Backend Server (Port 8000)
- Relay Server (Port 3001)
- React Frontend (Port 5173 / Default Vite port)

### Manual Setup

If you prefer to start them manually or are on a different OS:

**1. Start the Relay Server:**
```bash
cd relay
npm install
npm run dev
```

**2. Start the Backend:**
```bash
cd backend
pip install -r requirements.txt # or install your dependencies
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**3. Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🚗 SUMO Traffic Simulation

The traffic simulation configurations are located in `backend/sumo/`. 
To view the traffic simulation visually:
1. Open terminal and navigate to `backend/sumo/`
2. Run `sumo-gui -c run.sumocfg`
3. In the GUI, go to **Edit -> Edit View Settings** and apply the **urbanhive** theme.
4. Click Play!

## 🛠️ Built With
- **Frontend**: React, Vite, TailwindCSS, Lucide-React
- **Backend**: Python, FastAPI, Uvicorn
- **Simulation**: SUMO
- **Relay**: Node.js, Express, Socket.io
