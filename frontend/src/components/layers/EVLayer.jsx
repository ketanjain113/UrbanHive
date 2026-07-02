import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

const EVLayer = ({ chargers, onClick }) => {
  return (
    <>
      {chargers.map(charger => {
        const status = charger.load < 60 ? 'green' : charger.load <= 80 ? 'yellow' : 'red';
        
        const icon = L.divIcon({
          className: `custom-marker ${status}`,
          html: '⚡',
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        return (
          <Marker
            key={charger.id}
            position={[charger.lat, charger.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onClick(charger)
            }}
          />
        );
      })}
    </>
  );
};

export default EVLayer;
