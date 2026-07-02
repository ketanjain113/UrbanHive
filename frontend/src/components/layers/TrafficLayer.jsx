import React from 'react';
import { TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

const createTomTomIncidentIcon = (color, speed, status, delay) => L.divIcon({
  className: 'custom-tomtom-incident',
  html: `
    <div style="background-color: #0f172a; border-left: 4px solid ${color}; box-shadow: 0 4px 16px rgba(0,0,0,0.4);" class="px-2.5 py-1 rounded-lg flex items-center gap-2 text-white font-sans transform hover:scale-105 transition-all duration-200 cursor-pointer border border-white/10">
      <span class="w-2 h-2 rounded-full shrink-0 animate-pulse" style="background-color: ${color};"></span>
      <div class="flex flex-col text-left">
        <span class="font-extrabold text-[12px] leading-tight text-white">${speed} km/h</span>
        <span class="text-[9px] leading-tight font-bold tracking-wider text-gray-300 uppercase">${delay > 0 ? `+${delay}m delay` : status}</span>
      </div>
    </div>
  `,
  iconSize: [96, 36],
  iconAnchor: [48, 18]
});

const TrafficLayer = ({ roads, onClick }) => {
  // Support TomTom Traffic Flow API with automatic Live Traffic fallback
  const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;
  const trafficTileUrl = TOMTOM_API_KEY 
    ? `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`
    : "https://mt1.google.com/vt?lyrs=traffic&x={x}&y={y}&z={z}";

  return (
    <>
      {/* Real-Time Traffic Flow Tile Overlay (TomTom / Live Traffic Feed) */}
      <TileLayer
        url={trafficTileUrl}
        maxZoom={20}
        zIndex={400}
        opacity={0.95}
        attribution={TOMTOM_API_KEY ? "&copy; TomTom Traffic Flow API" : "&copy; Live Traffic Flow API"}
      />

      {/* TomTom Style Incident & Flow Telemetry Badges */}
      {roads && roads.map(road => {
        const speed = Math.round(road.speed ?? road.speed_kmh ?? 0);
        const status = road.status ?? road.congestion ?? (speed > 30 ? 'flowing' : speed >= 15 ? 'moderate' : 'heavy');
        const color = speed > 30 ? '#10b981' : speed >= 15 ? '#f59e0b' : '#ef4444';
        const delay = speed < 20 ? Math.round((25 - speed) * 0.8) : speed < 35 ? 2 : 0;
        
        // Position badge at main junction
        const position = road.coords?.[1] || road.coords?.[0] || [22.7196, 75.8577];

        return (
          <Marker
            key={road.id}
            position={position}
            icon={createTomTomIncidentIcon(color, speed, status, delay)}
            eventHandlers={{
              click: (e) => {
                if (e.originalEvent) e.originalEvent.stopPropagation();
                onClick(road);
              }
            }}
          >
            <Tooltip direction="top" offset={[0, -18]} opacity={0.98} className="custom-tooltip">
              <div className="font-sans px-1.5 py-1 min-w-[180px]">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1 mb-1">
                  <p className="font-bold text-gray-900 text-[13px] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: color }}></span>
                    <span className="truncate">{road.name || 'Monitored Junction'}</span>
                  </p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0f172a] text-white">TomTom AI</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-gray-600 font-medium py-0.5">
                  <span>Flow Speed:</span>
                  <span className="font-bold text-gray-900">{speed} km/h <span className="text-[10px] uppercase font-semibold text-gray-500">({status})</span></span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-gray-600 font-medium py-0.5">
                  <span>Incident Delay:</span>
                  <span className="font-bold" style={{ color: delay > 0 ? '#ef4444' : '#10b981' }}>{delay > 0 ? `+${delay} mins` : 'Free flow'}</span>
                </div>
                <p className="text-[10px] text-[#059669] font-bold mt-1 pt-1 border-t border-gray-100 flex items-center justify-between">
                  <span>Open AI Signal Command</span>
                  <span>→</span>
                </p>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
};

export default TrafficLayer;
