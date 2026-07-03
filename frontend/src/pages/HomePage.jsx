import React, { useState } from 'react';
import { useUrbanHiveSocket } from '../hooks/useUrbanHiveSocket';
import { deactivateEmergencyCorridor } from '../api/emergency';
import TopBar from '../components/TopBar';
import StatusBar from '../components/StatusBar';
import UrbanHiveMap from '../components/UrbanHiveMap';
import SidePanel from '../components/SidePanel';
import EmergencyModal from '../components/EmergencyModal';
import SearchBar from '../components/SearchBar';
import MapControls from '../components/MapControls';
import { Activity, Car, Zap, Fuel, AlertTriangle, Map, Navigation2, Sun, Moon, Siren } from 'lucide-react';

function HomePage() {
  const { data, connected, alerts } = useUrbanHiveSocket();

  const [activeLayers, setActiveLayers] = useState({
    infra: true,
    traffic: true,
    parking: false,
    ev: false,
    petrol: false,
    emergency: false
  });

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapStyle, setMapStyle] = useState('light');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyCorridor, setEmergencyCorridor] = useState(null);

  const handleLocate = () => {
    setMapCenter([22.7196, 75.8577]);
    setMapZoom(13);
  };

  const handleSelectLocation = (item) => {
    setSelectedFeature({ type: item.type, data: item.data });
    setMapCenter([item.lat, item.lng]);
    setMapZoom(14);

    const layerMapping = { metro_station: 'infra', famous_location: 'infra', parking: 'parking', ev: 'ev', petrol: 'petrol', traffic: 'traffic' };
    const targetLayer = layerMapping[item.type];
    if (targetLayer && !activeLayers[targetLayer]) {
      setActiveLayers(prev => ({ ...prev, [targetLayer]: true }));
    }
  };

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleFeatureClick = (feature) => setSelectedFeature(feature);
  const closeSidePanel = () => setSelectedFeature(null);

  const handleEmergencyActivate = (payload) => {
    // Store emergency data for green corridor page
    const emergencyData = {
      vehicle_id: payload.vehicle_id,
      type: payload.type,
      from_location: payload.from_location,
      to_location: payload.to_location,
      coords: payload.coords || [[22.7523,75.8890],[22.7400,75.8700],[22.7196,75.8577]],
      eta: payload.eta ?? 6,
      clearedJunctions: payload.clearedJunctions ?? 4,
      corridor_id: payload.corridor_id
    };
    
    // Save to session storage for GreenCorridorPage to pick up
    sessionStorage.setItem('emergencyCorridorData', JSON.stringify(emergencyData));
    
    setEmergencyCorridor(emergencyData);
    setActiveLayers(prev => ({ ...prev, emergency: true }));
    setIsEmergencyModalOpen(false);
    setSelectedFeature({
      type: 'emergency_corridor',
      data: { 
        id: payload.vehicle_id, 
        vehicleType: payload.type, 
        from: payload.from_location, 
        to: payload.to_location, 
        eta: emergencyData.eta, 
        clearedJunctions: emergencyData.clearedJunctions
      }
    });
  };

  const deactivateEmergency = async () => {
    // Call deactivation API if corridor has an ID
    if (emergencyCorridor?.corridor_id) {
      try {
        await deactivateEmergencyCorridor(emergencyCorridor.corridor_id);
      } catch (err) {
        console.error('Failed to deactivate corridor:', err);
      }
    }
    
    sessionStorage.removeItem('emergencyCorridorData');
    setEmergencyCorridor(null);
    setActiveLayers(prev => ({ ...prev, emergency: false }));
    closeSidePanel();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F5F5F7]">
      <TopBar data={data}>
        <div className="hidden md:block w-[380px]">
          <SearchBar onSelectLocation={handleSelectLocation} isDesktopNav={true}></SearchBar>
        </div>
      </TopBar>
      <div className="flex-1 flex overflow-hidden relative">
        <UrbanHiveMap 
          data={data} 
          activeLayers={activeLayers} 
          selectedFeature={selectedFeature}
          emergencyCorridor={emergencyCorridor}
          onFeatureClick={handleFeatureClick}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onZoomEnd={setMapZoom}
          mapStyle={mapStyle}
        ></UrbanHiveMap>
        <SidePanel selectedFeature={selectedFeature} onClose={closeSidePanel} emergencyCorridor={emergencyCorridor} onDeactivate={deactivateEmergency}></SidePanel>
        
        {/* Mobile Search Bar */}
        <div className="md:hidden">
          <SearchBar onSelectLocation={handleSelectLocation} isDesktopNav={false}></SearchBar>
        </div>
      </div>
      <StatusBar data={data} connected={connected} alerts={alerts}></StatusBar>
      <MapControls
        currentZoom={mapZoom}
        onZoomChange={setMapZoom}
        onLocate={handleLocate}
        currentStyle={mapStyle}
        onStyleChange={setMapStyle}
        activeLayers={activeLayers}
        toggleLayer={toggleLayer}
        hasSidePanelOpen={!!selectedFeature}
      ></MapControls>
      {isEmergencyModalOpen && <EmergencyModal onClose={() => setIsEmergencyModalOpen(false)} onActivate={handleEmergencyActivate}></EmergencyModal>}
      <button 
        onClick={() => setIsEmergencyModalOpen(true)}
        className={`fixed bottom-6 z-[1000] px-4 py-2.5 bg-[#FF3B30] hover:bg-[#FF2D20] text-white rounded-full shadow-lg shadow-red-500/30 flex items-center gap-2 font-bold text-sm tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 active:scale-95 ${
          selectedFeature ? 'right-6 md:right-[496px]' : 'right-6'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <span className="absolute w-full h-full bg-white/40 rounded-full animate-ping opacity-75"></span>
          <Siren size={18} strokeWidth={2.5} />
        </div>
        EMERGENCY
      </button>
    </div>
  );
}

export default HomePage;
