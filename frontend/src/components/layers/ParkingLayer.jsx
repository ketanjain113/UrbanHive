import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

const ParkingLayer = ({ lots, onClick }) => {
  return (
    <>
      {lots.map(lot => {
        const status = lot.fill_pct < 60 ? 'green' : lot.fill_pct <= 85 ? 'yellow' : 'red';
        
        const icon = L.divIcon({
          className: `custom-marker ${status}`,
          html: 'P',
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        return (
          <Marker
            key={lot.id}
            position={[lot.lat, lot.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onClick(lot)
            }}
          />
        );
      })}
    </>
  );
};

export default ParkingLayer;
