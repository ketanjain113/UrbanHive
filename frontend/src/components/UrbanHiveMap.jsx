import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

import TrafficLayer from './layers/TrafficLayer';
import ParkingLayer from './layers/ParkingLayer';
import EVLayer from './layers/EVLayer';
import PetrolLayer from './layers/PetrolLayer';
import EmergencyLayer from './layers/EmergencyLayer';
import InfraLayer from './layers/InfraLayer';

const indoreCenter = [22.7196, 75.8577];

const MapController = ({ center, zoom, onZoomEnd }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), {
        animate: true,
        duration: 1.2
      });
    }
  }, [center, map]);

  useEffect(() => {
    if (zoom && zoom !== map.getZoom()) {
      map.setZoom(zoom, { animate: true });
    }
  }, [zoom, map]);

  useEffect(() => {
    const handleZoomEnd = () => {
      onZoomEnd(map.getZoom());
    };
    map.on('zoomend', handleZoomEnd);
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onZoomEnd]);

  return null;
};

const tileUrls = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
};

const tileAttributions = {
  light: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  satellite: 'Tiles &copy; <a href="https://maps.google.com">Google</a> &mdash; Imagery: Maxar, Landsat, Copernicus'
};

const UrbanHiveMap = ({ 
  data, 
  activeLayers, 
  onFeatureClick, 
  emergencyCorridor, 
  mapCenter, 
  mapZoom, 
  onZoomEnd, 
  mapStyle = 'light' 
}) => {
  const mergedData = useMemo(() => {
    return data;
  }, [data]);

  return (
    <MapContainer 
      center={indoreCenter} 
      zoom={13} 
      zoomControl={false}
      className="w-full h-full"
    >
      <MapController center={mapCenter} zoom={mapZoom} onZoomEnd={onZoomEnd} />
      <TileLayer
        key={mapStyle}
        url={tileUrls[mapStyle] || tileUrls.light}
        attribution={tileAttributions[mapStyle] || tileAttributions.light}
      />

      {activeLayers.infra && mergedData?.infra && (
        <InfraLayer 
          infraData={mergedData.infra} 
          onClick={onFeatureClick} 
        />
      )}

      {activeLayers.traffic && mergedData?.traffic?.roads && (
        <TrafficLayer 
          roads={mergedData.traffic.roads} 
          onClick={(data) => onFeatureClick({ type: 'traffic', data })} 
        />
      )}

      {activeLayers.parking && mergedData?.parking?.lots && (
        <ParkingLayer 
          lots={mergedData.parking.lots} 
          onClick={(data) => onFeatureClick({ type: 'parking', data })} 
        />
      )}

      {activeLayers.ev && mergedData?.ev?.chargers && (
        <EVLayer 
          chargers={mergedData.ev.chargers} 
          onClick={(data) => onFeatureClick({ type: 'ev', data })} 
        />
      )}

      {activeLayers.petrol && mergedData?.petrol?.pumps && (
        <PetrolLayer 
          pumps={mergedData.petrol.pumps} 
          onClick={(data) => onFeatureClick({ type: 'petrol', data })} 
        />
      )}

      {activeLayers.emergency && emergencyCorridor && (
        <EmergencyLayer 
          corridor={emergencyCorridor} 
        />
      )}
    </MapContainer>
  );
};

export default UrbanHiveMap;
