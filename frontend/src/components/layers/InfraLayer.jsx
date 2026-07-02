import React from 'react';
import { Polygon, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';

const InfraLayer = ({ infraData, onClick }) => {
  if (!infraData) return null;
  const { boundary, metro, squares } = infraData;

  const metroStationIcon = () => L.divIcon({
    className: 'custom-marker metro',
    html: '🚇',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  const squareIcon = () => L.divIcon({
    className: 'custom-marker square',
    html: '📍',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  return (
    <>
      {/* Indore Boundary */}
      {boundary && (
        <Polygon
          positions={boundary.coords}
          pathOptions={{
            color: '#059669',
            weight: 2.5,
            fillColor: '#059669',
            fillOpacity: 0.04,
            dashArray: '8, 8'
          }}
          eventHandlers={{
            click: (e) => {
              if (e.originalEvent) e.originalEvent.stopPropagation();
              onClick({ type: 'city_boundary', data: boundary });
            }
          }}
        />
      )}

      {/* Metro Line Base Glow */}
      {metro?.line && (
        <Polyline
          positions={metro.line.coords}
          pathOptions={{
            color: '#FF9500',
            weight: 6,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          }}
          eventHandlers={{
            click: (e) => {
              if (e.originalEvent) e.originalEvent.stopPropagation();
              onClick({ type: 'metro_line', data: metro.line });
            }
          }}
        />
      )}

      {/* Metro Line Tracks Overlay */}
      {metro?.line && (
        <Polyline
          positions={metro.line.coords}
          pathOptions={{
            color: '#FFFFFF',
            weight: 1.5,
            opacity: 0.9,
            dashArray: '5, 5',
            lineCap: 'round',
            lineJoin: 'round'
          }}
          eventHandlers={{
            click: (e) => {
              if (e.originalEvent) e.originalEvent.stopPropagation();
              onClick({ type: 'metro_line', data: metro.line });
            }
          }}
        />
      )}

      {/* Metro Stations */}
      {metro?.stations?.map(station => (
        <Marker
          key={station.id}
          position={[station.lat, station.lng]}
          icon={metroStationIcon()}
          eventHandlers={{
            click: (e) => {
              if (e.originalEvent) e.originalEvent.stopPropagation();
              onClick({ type: 'metro_station', data: station });
            }
          }}
        />
      ))}

      {/* Famous Squares */}
      {squares?.map(square => (
        <Marker
          key={square.id}
          position={[square.lat, square.lng]}
          icon={squareIcon()}
          eventHandlers={{
            click: (e) => {
              if (e.originalEvent) e.originalEvent.stopPropagation();
              onClick({ type: 'famous_location', data: square });
            }
          }}
        />
      ))}
    </>
  );
};

export default InfraLayer;
