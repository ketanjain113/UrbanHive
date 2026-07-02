import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { io } from "socket.io-client";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:4000" : window.location.origin);

const MODEL_URL = import.meta.env.VITE_MODEL_URL || "http://127.0.0.1:8000/model";

const HOSPITAL = {
  name: "MY Hospital, Indore",
  coord: [22.7281, 75.8685],
};

const DEFAULT_ROUTES = {
  alpha: {
    name: "Route Alpha",
    points: [
      [22.7196, 75.8577],
      [22.7209, 75.8602],
      [22.7224, 75.8629],
      [22.724, 75.8655],
      [22.7257, 75.8669],
      [22.7271, 75.8677],
      [22.7281, 75.8685],
    ],
    intersections: [
      { id: "A", pointIndex: 1, coord: [22.7209, 75.8602] },
      { id: "B", pointIndex: 3, coord: [22.724, 75.8655] },
      { id: "C", pointIndex: 5, coord: [22.7271, 75.8677] },
    ],
  },
};

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function getVehicleIcon(vehicleType) {
  const typeMap = {
    Ambulance: "🚑",
    "Fire Engine": "🚒",
    Police: "🚓",
  };
  return typeMap[vehicleType] || "🚑";
}

function createVehicleMarker(coord, vehicleType) {
  return L.marker(coord, {
    icon: L.divIcon({
      className: "vehicle-marker",
      html: `<span style="font-size: 24px; display: flex; align-items: center; justify-content: center;">${getVehicleIcon(vehicleType)}</span>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    }),
  });
}

function GreenCorridorPage() {
  const navigate = useNavigate();
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const webcamCanvasRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const videoFileInputRef = useRef(null);

  // Read emergency data from sessionStorage
  const [emergencyData, setEmergencyData] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [vehicleIndex, setVehicleIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [signals, setSignals] = useState({});
  const [logs, setLogs] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Webcam and model features
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [webcamConnecting, setWebcamConnecting] = useState(false);
  const [webcamError, setWebcamError] = useState("");
  const [webcamFrame, setWebcamFrame] = useState("");
  
  // Video upload features
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [videoPredicting, setVideoPredicting] = useState(false);
  const [videoOutput, setVideoOutput] = useState("");
  const [videoPredictError, setVideoPredictError] = useState("");
  const [detectionResults, setDetectionResults] = useState(null);

  // Load emergency data on mount
  useEffect(() => {
    const storedData = sessionStorage.getItem("emergencyCorridorData");
    if (!storedData) {
      setEmergencyData(null);
      setRouteData(DEFAULT_ROUTES.alpha);
      return;
    }
    
    try {
      const data = JSON.parse(storedData);
      setEmergencyData(data);
      addLog(`Emergency Corridor Activated: ${data.vehicle_id} (${data.type})`);
      addLog(`Route: ${data.from_location} → ${data.to_location}`);
      setRouteData(DEFAULT_ROUTES.alpha);
    } catch (err) {
      console.error("Failed to parse emergency data:", err);
      setRouteData(DEFAULT_ROUTES.alpha);
    }
  }, []);

  const addLog = (message) => {
    setLogs(prev => [
      { time: nowTime(), message },
      ...prev
    ].slice(0, 20));
  };

  const currentRoute = useMemo(() => routeData || DEFAULT_ROUTES.alpha, [routeData]);
  const currentCoord = useMemo(
    () => currentRoute.points[vehicleIndex] || currentRoute.points[0],
    [currentRoute, vehicleIndex]
  );

  // Initialize map
  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current).setView(currentCoord, 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map with route and signals
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.CircleMarker || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Draw route
    const traversedRoute = currentRoute.points.slice(0, vehicleIndex + 1);
    if (traversedRoute.length > 1) {
      L.polyline(traversedRoute, {
        color: "#22c55e",
        weight: 4,
        opacity: 0.9,
      }).addTo(map);
    }

    const upcomingRoute = currentRoute.points.slice(vehicleIndex);
    if (upcomingRoute.length > 1) {
      L.polyline(upcomingRoute, {
        color: "#0e7be6",
        weight: 4,
        opacity: 0.5,
        dashArray: "5, 5",
      }).addTo(map);
    }

    // Draw signals
    currentRoute.intersections.forEach((intersection) => {
      const signalState = signals[intersection.id] || "RED";
      const color = signalState === "GREEN" ? "#22c55e" : "#ef4444";
      
      L.circleMarker(intersection.coord, {
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      })
        .bindPopup(`Signal ${intersection.id}: ${signalState}`)
        .addTo(map);
    });

    // Draw hospital
    L.circleMarker(HOSPITAL.coord, {
      radius: 10,
      fillColor: "#ffd43b",
      color: "#0f2238",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95,
    })
      .bindPopup(HOSPITAL.name)
      .addTo(map);

    // Draw emergency vehicle
    if (vehicleMarkerRef.current) {
      map.removeLayer(vehicleMarkerRef.current);
    }
    const marker = createVehicleMarker(currentCoord, emergencyData?.type || "Ambulance");
    marker.bindPopup(`${emergencyData?.vehicle_id || "Emergency Vehicle"} - ${emergencyData?.type || "Ambulance"}`);
    marker.addTo(map);
    vehicleMarkerRef.current = marker;

    map.panTo(currentCoord);
  }, [currentCoord, vehicleIndex, currentRoute, signals, emergencyData]);

  // Socket connection for live signal updates
  useEffect(() => {
    const socket = io(BACKEND_BASE_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      setSocketConnected(true);
      addLog("Connected to signal system");
    });

    socket.on("vehicle:update", (data) => {
      if (data.signal) {
        setSignals(prev => ({
          ...prev,
          [data.intersection || data.id]: data.signal,
        }));
        addLog(`Signal Update: Intersection ${data.intersection || data.id} → ${data.signal}`);
      }
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      addLog("Disconnected from signal system");
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Webcam handling
  const startWebcam = async () => {
    setWebcamConnecting(true);
    setWebcamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      webcamStreamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        setWebcamRunning(true);
        captureWebcamFrame();
        addLog("Webcam started - AI detection active");
      }
    } catch (err) {
      setWebcamError("Failed to access webcam: " + err.message);
      addLog(`Webcam Error: ${err.message}`);
    } finally {
      setWebcamConnecting(false);
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }
    setWebcamRunning(false);
    setWebcamFrame("");
    addLog("Webcam stopped");
  };

  const captureWebcamFrame = async () => {
    if (!webcamRunning || !webcamVideoRef.current || !webcamCanvasRef.current) return;

    const canvas = webcamCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(webcamVideoRef.current, 0, 0);
    
    // Convert canvas to blob and send to model
    canvas.toBlob(async (blob) => {
      try {
        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");

        const response = await fetch(`${MODEL_URL}/predict/frame`, {
          method: "POST",
          body: formData,
        });
        
        if (response.ok) {
          const annotatedBlob = await response.blob();
          const frameUrl = URL.createObjectURL(annotatedBlob);
          setWebcamFrame(frameUrl);
        }
      } catch (err) {
        console.error("Frame inference error:", err);
      }
    }, "image/jpeg");

    // Capture next frame
    requestAnimationFrame(captureWebcamFrame);
  };

  // Video file upload and processing
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    const preview = URL.createObjectURL(file);
    setVideoPreview(preview);
    addLog(`Video loaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  };

  const processVideo = async () => {
    if (!videoFile) {
      setVideoPredictError("Please select a video file first");
      return;
    }

    setVideoPredicting(true);
    setVideoPredictError("");
    setVideoOutput("");

    try {
      const formData = new FormData();
      formData.append("file", videoFile);

      const response = await fetch(`${MODEL_URL}/predict/video/file`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const outputUrl = URL.createObjectURL(blob);
      setVideoOutput(outputUrl);
      addLog(`✓ Video processed successfully`);
    } catch (err) {
      setVideoPredictError(`Failed to process video: ${err.message}`);
      addLog(`Video processing error: ${err.message}`);
    } finally {
      setVideoPredicting(false);
    }
  };

  // Auto-advance vehicle simulation
  useEffect(() => {
    if (!isActive || vehicleIndex >= currentRoute.points.length - 1) {
      if (vehicleIndex >= currentRoute.points.length - 1) {
        setIsActive(false);
        addLog("✓ Emergency vehicle reached destination");
      }
      return;
    }

    const timer = setInterval(() => {
      setVehicleIndex(prev => {
        const next = prev + 1;
        if (next >= currentRoute.points.length) {
          setIsActive(false);
        }
        return next;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [isActive, vehicleIndex, currentRoute.points.length]);

  const progress = Math.round((vehicleIndex / Math.max(currentRoute.points.length - 1, 1)) * 100);
  const eta = Math.max((currentRoute.points.length - vehicleIndex) * 1.5, 0).toFixed(1);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-emerald-600 border-b border-green-500/30 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2 font-semibold"
          >
            ← Back to Map
          </button>
          <h1 className="text-2xl font-bold">
            🚑 Emergency Corridor
            {emergencyData && ` - ${emergencyData.vehicle_id}`}
          </h1>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${socketConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
          {socketConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Map and Model Output */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div ref={mapElementRef} className="flex-1 rounded-xl border border-green-500/30 overflow-hidden shadow-2xl" />
          
          {/* Progress Bar */}
          <div className="bg-slate-800/60 border border-green-500/20 rounded-lg p-4 backdrop-blur">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-green-300">Route Progress</span>
              <span className="text-sm font-mono text-green-400">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* AI Model Output */}
          {(webcamFrame || videoOutput) && (
            <div className="bg-slate-800/60 border border-yellow-500/30 rounded-lg overflow-hidden shadow-lg max-h-64">
              <div className="text-xs font-semibold text-yellow-300 p-2 border-b border-yellow-500/20">
                🤖 AI Detection Output
              </div>
              {webcamFrame && (
                <img src={webcamFrame} alt="Webcam Detection" className="w-full h-full object-contain" />
              )}
              {videoOutput && (
                <video src={videoOutput} controls className="w-full h-full object-contain" />
              )}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          {/* Emergency Info */}
          {emergencyData && (
            <div className="bg-slate-800/60 border border-green-500/20 rounded-lg p-4 backdrop-blur">
              <h3 className="font-bold text-lg mb-3 text-green-300">Emergency Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Vehicle ID:</span>
                  <span className="font-mono font-semibold">{emergencyData.vehicle_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="font-semibold">{emergencyData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">From:</span>
                  <span className="text-right text-xs text-gray-300">{emergencyData.from_location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">To:</span>
                  <span className="text-right text-xs text-gray-300">{emergencyData.to_location}</span>
                </div>
              </div>
            </div>
          )}

          {/* Status Card */}
          <div className="bg-slate-800/60 border border-green-500/20 rounded-lg p-4 backdrop-blur">
            <h3 className="font-bold text-lg mb-3 text-green-300">Status</h3>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-green-400 mb-1">{eta} min</div>
                <div className="text-sm text-gray-400">Estimated Time to Destination</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm font-semibold">{isActive ? "Route Active" : "Route Complete"}</span>
              </div>
            </div>
          </div>

          {/* Webcam Controls */}
          <div className="bg-slate-800/60 border border-yellow-500/20 rounded-lg p-4 backdrop-blur">
            <h3 className="font-bold text-lg mb-3 text-yellow-300">🎥 Live Webcam Detection</h3>
            <div className="space-y-3">
              <button
                onClick={webcamRunning ? stopWebcam : startWebcam}
                disabled={webcamConnecting}
                className={`w-full py-2 px-3 rounded-lg font-semibold transition-all ${
                  webcamRunning
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-yellow-600 hover:bg-yellow-700 text-white disabled:bg-gray-500"
                }`}
              >
                {webcamConnecting ? "Connecting..." : webcamRunning ? "Stop Webcam" : "Start Webcam"}
              </button>
              {webcamError && <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">{webcamError}</div>}
              <video
                ref={webcamVideoRef}
                autoPlay
                playsInline
                className="w-full h-32 bg-black rounded border border-yellow-500/20"
              />
              <canvas ref={webcamCanvasRef} className="hidden" width="640" height="480" />
            </div>
          </div>

          {/* Video Upload */}
          <div className="bg-slate-800/60 border border-blue-500/20 rounded-lg p-4 backdrop-blur">
            <h3 className="font-bold text-lg mb-3 text-blue-300">📹 Video Upload Detection</h3>
            <div className="space-y-3">
              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:bg-blue-600 file:text-white file:cursor-pointer"
              />
              {videoPreview && (
                <video src={videoPreview} className="w-full h-32 bg-black rounded border border-blue-500/20" />
              )}
              <button
                onClick={processVideo}
                disabled={!videoFile || videoPredicting}
                className={`w-full py-2 px-3 rounded-lg font-semibold transition-all ${
                  videoPredicting
                    ? "bg-gray-500 text-gray-300"
                    : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-500"
                }`}
              >
                {videoPredicting ? "Processing..." : "Process Video with YOLO"}
              </button>
              {videoPredictError && (
                <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">{videoPredictError}</div>
              )}
            </div>
          </div>

          {/* Traffic Signals */}
          <div className="bg-slate-800/60 border border-green-500/20 rounded-lg p-4 backdrop-blur">
            <h3 className="font-bold text-lg mb-3 text-green-300">Traffic Signals</h3>
            <div className="space-y-2">
              {currentRoute.intersections.map((intersection) => {
                const signalState = signals[intersection.id] || "RED";
                const isPassed = intersection.pointIndex < vehicleIndex;
                
                return (
                  <div key={intersection.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg border border-slate-600/50">
                    <span className="font-mono font-semibold text-lg">Intersection {intersection.id}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          signalState === "GREEN" ? "bg-green-400 shadow-lg shadow-green-500" : "bg-red-400 shadow-lg shadow-red-500"
                        }`}
                      />
                      <span className={`text-sm font-bold ${signalState === "GREEN" ? "text-green-300" : "text-red-300"}`}>
                        {isPassed ? "✓ PASSED" : signalState}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-slate-800/60 border border-green-500/20 rounded-lg p-4 backdrop-blur flex-1 flex flex-col overflow-hidden">
            <h3 className="font-bold text-lg mb-3 text-green-300">Activity Log</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {logs.length === 0 ? (
                <p className="text-sm text-gray-500">No events yet...</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="text-xs border-l-2 border-green-500/30 pl-2 py-1">
                    <span className="text-gray-500">{log.time}</span>
                    <span className="text-gray-300 ml-2">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GreenCorridorPage;
