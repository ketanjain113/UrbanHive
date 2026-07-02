import React from 'react';
import { Polyline } from 'react-leaflet';

const TrafficLayer = ({ roads, onClick }) => {
  return (
    <>
      {roads.map(road => {
        const color = road.speed > 30 ? '#16a34a' : road.speed >= 15 ? '#d97706' : '#dc2626';
        
        return (
          <Polyline
            key={road.id}
            positions={road.coords}
            pathOptions={{ color, weight: 6, opacity: 0.85 }}
            eventHandlers={{
              click: () => onClick(road)
            }}
          />
        );
      })}
    </>
  );
};

export default TrafficLayer;
