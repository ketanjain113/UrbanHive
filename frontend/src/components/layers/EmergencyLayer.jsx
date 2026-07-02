import React from 'react';
import { Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';

const EmergencyLayer = ({ corridor }) => {
  if (!corridor || !corridor.coords || corridor.coords.length === 0) return null;

  const vehicleIcon = L.divIcon({
    className: 'bg-transparent border-none flex items-center justify-center',
    html: '<div class="emergency-pulse"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const junctionIcon = L.divIcon({
    className: 'bg-transparent border-none flex items-center justify-center',
    html: '<div class="junction-pulse"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  // Origin point of the corridor
  const originPoint = corridor.coords[0];
  
  // Internal junction points (excluding start and end)
  const junctionPoints = corridor.coords.slice(1, -1);

  return (
    <>
      {/* The thick green corridor polyline */}
      <Polyline
        positions={corridor.coords}
        pathOptions={{ color: '#16a34a', weight: 8, opacity: 0.8 }}
      />
      
      {/* Pulsing red circle at vehicle origin */}
      <Marker position={originPoint} icon={vehicleIcon} />

      {/* Pulsing green circles at cleared junctions */}
      {junctionPoints.map((pt, i) => (
        <Marker key={`j-${i}`} position={pt} icon={junctionIcon} />
      ))}
    </>
  );
};

export default EmergencyLayer;
