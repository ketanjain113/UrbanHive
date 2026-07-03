import React, { useState, useRef, useEffect } from 'react';
import { Search, Navigation, X, MapPin } from 'lucide-react';

const SearchBar = ({ data, onSelectLocation, isDesktopNav = false }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);

  const getSearchableItems = () => {
    const items = [];
    if (!data) return items;

    if (data.infra?.metro?.stations) {
      data.infra.metro.stations.forEach(s => {
        items.push({ id: `metro_station-${s.id}`, name: s.name || 'Metro Station', type: 'metro_station', lat: s.lat || 22.7196, lng: s.lng || 75.8577, icon: '🚇', category: 'Metro Station', details: `${(s.ridership || 0).toLocaleString()} daily`, data: s });
      });
    }
    if (data.infra?.squares) {
      data.infra.squares.forEach(s => {
        items.push({ id: `famous_location-${s.id}`, name: s.name || 'Landmark', type: 'famous_location', lat: s.lat || 22.7196, lng: s.lng || 75.8577, icon: '📍', category: 'Landmark', details: s.congestion_level || 'Normal', data: s });
      });
    }
    if (data.parking?.lots) {
      data.parking.lots.forEach(l => {
        items.push({ id: `parking-${l.id}`, name: l.name || 'Parking Lot', type: 'parking', lat: l.lat || 22.7196, lng: l.lng || 75.8577, icon: '🅿️', category: 'Parking', details: `${(l.capacity || 0) - (l.occupied || 0)} free`, data: l });
      });
    }
    if (data.ev?.chargers) {
      data.ev.chargers.forEach(c => {
        items.push({ id: `ev-${c.id}`, name: c.name || 'EV Station', type: 'ev', lat: c.lat || 22.7196, lng: c.lng || 75.8577, icon: '⚡', category: 'EV', details: `${c.load || 0}% load`, data: c });
      });
    }
    if (data.petrol?.pumps) {
      data.petrol.pumps.forEach(p => {
        items.push({ id: `petrol-${p.id}`, name: p.name || 'Petrol Pump', type: 'petrol', lat: p.lat || 22.7196, lng: p.lng || 75.8577, icon: '⛽', category: 'Fuel', details: `${p.queue || 0} queue`, data: p });
      });
    }
    if (data.traffic?.roads) {
      data.traffic.roads.forEach(r => {
        const lat = r.lat ?? r.coords?.[0]?.[0] ?? 22.7196;
        const lng = r.lng ?? r.coords?.[0]?.[1] ?? 75.8577;
        items.push({ id: `traffic-${r.id}`, name: r.name || 'Road Network', type: 'traffic', lat, lng, icon: '🚦', category: 'Road Network', details: `${r.speed || 0} km/h (${r.status || 'flowing'})`, data: r });
      });
    }
    return items;
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const filtered = getSearchableItems().filter(item =>
      item.name?.toLowerCase().includes(query.toLowerCase()) ||
      item.category?.toLowerCase().includes(query.toLowerCase()) ||
      item.details?.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered.slice(0, 8));
  }, [query, data]);

  const handleSelect = (item) => {
    onSelectLocation(item);
    setQuery('');
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleDirections = (e) => {
    e.stopPropagation();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=22.7196,75.8577`, '_blank');
  };

  return (
    <div ref={containerRef} className={isDesktopNav 
      ? "relative w-full z-[1000] flex flex-col gap-1.5" 
      : "absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-1.5 shadow-2xl rounded-full"
    }>
      {/* Search Input */}
      <div className={`flex items-center w-full transition-all duration-300 border ${
        isDesktopNav 
          ? `h-9 bg-gray-100 rounded-full pl-3 pr-1 ${isFocused ? 'bg-white border-[#059669]/40 ring-2 ring-[#059669]/20 shadow-md' : 'border-transparent hover:bg-gray-200/80'}`
          : `h-12 bg-white/95 backdrop-blur-xl rounded-full pl-4 pr-1.5 shadow-lg ${isFocused ? 'border-[#059669]/50 shadow-xl ring-2 ring-[#059669]/20' : 'border-gray-200/80'}`
      }`}>
        <Search size={isDesktopNav ? 14 : 16} className={`${isFocused ? 'text-[#059669]' : 'text-gray-400'} shrink-0 mr-2 transition-colors`} strokeWidth={2} />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { setIsOpen(true); setIsFocused(true); }}
          placeholder="Search places, stations..."
          className={`flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 font-medium pr-2 ${isDesktopNav ? 'text-[12px]' : 'text-[14px]'}`}
        />
        <div className="flex items-center gap-1">
          {query && (
            <button onClick={() => setQuery('')} className={`rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors ${isDesktopNav ? 'w-6 h-6 mr-0.5' : 'w-8 h-8 mr-1'}`}>
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
          <div className={`w-[1px] bg-gray-200 ${isDesktopNav ? 'h-5 mr-1' : 'h-6 mr-1.5'}`}></div>
          <button
            onClick={handleDirections}
            className={`rounded-full bg-[#059669] hover:bg-[#047857] flex items-center justify-center text-white transition-all duration-200 active:scale-95 shadow-[0_4px_12px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_16px_rgba(5,150,105,0.4)] ${isDesktopNav ? 'w-7 h-7' : 'w-9 h-9'}`}
            title="Directions"
          >
            <Navigation size={isDesktopNav ? 12 : 14} className="rotate-45" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className={`absolute left-0 right-0 bg-white/90 backdrop-blur-3xl rounded-2xl border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-1.5 animate-fade-in ${isDesktopNav ? 'top-10' : 'top-[52px]'}`}>
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-2.5 py-2.5 rounded-xl hover:bg-black/5 flex items-center gap-3 transition-colors duration-100 group"
            >
              <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[14px] shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] md:text-[13px] text-gray-900 font-semibold truncate group-hover:text-[#059669] transition-colors">{item.name}</p>
                <p className="text-[9px] md:text-[10px] text-gray-500 truncate">
                  <span className="font-semibold">{item.category}</span> · {item.details}
                </p>
              </div>
              <MapPin size={14} className="text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
