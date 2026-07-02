import React, { useState } from 'react';
import {
  Crosshair,
  Plus,
  Minus,
  Compass,
  Activity,
  Train,
  Zap,
  Layers,
  Fuel,
  ChevronDown
} from 'lucide-react';

const MapControls = ({
  currentZoom,
  onZoomChange,
  onLocate,
  currentStyle,
  onStyleChange,
  activeLayers,
  toggleLayer,
  hasSidePanelOpen
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isSatellite = currentStyle === 'satellite';
  const leftCardThumbnail = isSatellite
    ? 'https://a.basemaps.cartocdn.com/light_all/13/4683/2781.png'
    : 'https://mt1.google.com/vt/lyrs=y&x=5891&y=3541&z=13';
  const leftCardLabel = isSatellite ? 'Map' : 'Satellite';

  const layerItems = [
    { id: 'terrain', label: 'Terrain', icon: Compass, active: currentStyle === 'dark', action: () => onStyleChange(currentStyle === 'dark' ? 'light' : 'dark') },
    { id: 'traffic', label: 'Traffic', icon: Activity, active: activeLayers.traffic, action: () => toggleLayer('traffic') },
    { id: 'transit', label: 'Transit', icon: Train, active: activeLayers.infra, action: () => toggleLayer('infra') },
    { id: 'ev', label: 'EV', icon: Zap, active: activeLayers.ev, action: () => toggleLayer('ev') },
    { id: 'parking', label: 'Parking', icon: Layers, active: activeLayers.parking, action: () => toggleLayer('parking') },
    { id: 'petrol', label: 'Petrol', icon: Fuel, active: activeLayers.petrol, action: () => toggleLayer('petrol') },
  ];

  return (
    <>
      {/* Zoom + Locate (Right Edge) */}
      <div
        className={`absolute z-[1000] flex flex-col items-center gap-1.5 md:gap-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bottom-24 md:bottom-28 ${
          hasSidePanelOpen ? 'right-3 md:right-[484px]' : 'right-3 md:right-4'
        }`}
      >
        <button
          onClick={onLocate}
          className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-200/80 transition-all duration-150 active:scale-95"
          title="Recenter"
        >
          <Crosshair size={16} strokeWidth={2} />
        </button>
        <div className="w-9 h-[68px] md:w-10 md:h-[76px] bg-white rounded-xl flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-200/80 overflow-hidden">
          <button
            onClick={() => onZoomChange(currentZoom + 1)}
            className="flex-1 w-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <Plus size={15} strokeWidth={2.5} />
          </button>
          <div className="w-4 h-px bg-gray-200"></div>
          <button
            onClick={() => onZoomChange(currentZoom - 1)}
            className="flex-1 w-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-black/5 transition-colors active:bg-black/10"
          >
            <Minus size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Layer Switcher (Vertical) */}
      <div
        className={`absolute z-[1000] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col gap-2.5 top-1/2 -translate-y-1/2 ${
          hasSidePanelOpen ? 'left-3 md:hidden' : 'left-3 md:left-4'
        }`}
      >
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-[52px] h-[52px] md:w-[60px] md:h-[60px] rounded-2xl bg-white/40 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 flex flex-col items-center justify-center text-gray-600 hover:text-gray-900 active:scale-95 transition-all duration-200"
            title="Map Layers"
          >
            <Layers size={22} strokeWidth={2.2} className="mb-0.5" />
            <span className="text-[9px] md:text-[10px] font-bold">Layers</span>
          </button>
        ) : (
          <>
            {/* Map Type Card */}
            <button
              onClick={() => onStyleChange(isSatellite ? 'light' : 'satellite')}
              className="relative w-[52px] h-[52px] md:w-[60px] md:h-[60px] rounded-2xl overflow-hidden border-2 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.1)] group transition-all duration-150 active:scale-95 shrink-0 animate-fade-in"
              title={`Switch to ${leftCardLabel}`}
            >
              <img
                src={leftCardThumbnail}
                alt={leftCardLabel}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-1.5">
                <span className="text-[9px] md:text-[10px] text-white font-bold uppercase tracking-wider">{leftCardLabel}</span>
              </div>
            </button>

            {/* Layer Icons Column */}
            <div className="flex flex-col items-center bg-white/40 backdrop-blur-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl p-1.5 md:p-2 gap-1.5 w-[52px] md:w-[60px] animate-fade-in">
              {layerItems.map(({ id, label, icon: Icon, active, action }) => (
                <button
                  key={id}
                  onClick={action}
                  className="flex flex-col items-center justify-center w-full aspect-square rounded-xl hover:bg-black/5 active:bg-black/10 transition-all duration-150 group"
                  title={label}
                >
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    active
                      ? 'bg-[#059669] text-white shadow-md shadow-[#059669]/20'
                      : 'bg-black/5 text-gray-500 group-hover:text-gray-700'
                  }`}>
                    <Icon size={16} strokeWidth={2.2} />
                  </div>
                  <span className={`text-[8px] md:text-[9px] font-bold mt-1 leading-none transition-colors ${
                    active ? 'text-[#059669]' : 'text-gray-500 group-hover:text-gray-700'
                  }`}>{label}</span>
                </button>
              ))}
              
              <div className="w-8 h-px bg-black/10 my-0.5"></div>
              
              <button
                onClick={() => setIsExpanded(false)}
                className="flex flex-col items-center justify-center w-full aspect-square rounded-xl hover:bg-black/5 active:bg-black/10 transition-all duration-150 text-gray-500 hover:text-gray-700"
                title="Minimize"
              >
                <ChevronDown size={20} strokeWidth={2.5} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default MapControls;
