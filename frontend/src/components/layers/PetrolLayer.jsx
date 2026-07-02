import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

const PetrolLayer = ({ pumps, onClick }) => {
  return (
    <>
      {pumps.map(pump => {
        const status = pump.queue < 3 ? 'green' : pump.queue <= 6 ? 'yellow' : 'red';
        
        const icon = L.divIcon({
          className: `custom-marker ${status}`,
          html: '⛽',
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        return (
          <Marker
            key={pump.id}
            position={[pump.lat, pump.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onClick(pump)
            }}
          />
        );
      })}
    </>
  );
};

export default PetrolLayer;
