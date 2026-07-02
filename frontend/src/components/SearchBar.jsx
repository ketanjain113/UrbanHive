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
        items.push({ id: `metro_station-${s.id}`, name: s.name, type: 'metro_station', lat: s.lat, lng: s.lng, icon: '🚇', category: 'Metro Station', details: `${s.ridership.toLocaleString()} daily`, data: s });
      });
    }
    if (data.infra?.squares) {
      data.infra.squares.forEach(s => {
        items.push({ id: `famous_location-${s.id}`, name: s.name, type: 'famous_location', lat: s.lat, lng: s.lng, icon: '📍', category: 'Landmark', details: s.congestion_level, data: s });
      });
    }
    if (data.parking?.lots) {
      data.parking.lots.forEach(l => {
        items.push({ id: `parking-${l.id}`, name: l.name, type: 'parking', lat: l.lat, lng: l.lng, icon: '🅿️', category: 'Parking', details: `${l.capacity - l.occupied} free`, data: l });
      });
    }
    if (data.ev?.chargers) {
      data.ev.chargers.forEach(c => {
        items.push({ id: `ev-${c.id}`, name: c.name, type: 'ev', lat: c.lat, lng: c.lng, icon: '⚡', category: 'EV', details: `${c.load}% load`, data: c });
      });
    }
    if (data.petrol?.pumps) {
      data.petrol.pumps.forEach(p => {
        items.push({ id: `petrol-${p.id}`, name: p.name, type: 'petrol', lat: p.lat, lng: p.lng, icon: '⛽', category: 'Fuel', details: `${p.queue} queue`, data: p });
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
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered.slice(0, 5));
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
      : "absolute top-3 left-3 right-3 md:left-1/2 md:-translate-x-1/2 md:top-4 md:w-[420px] z-[1000] flex flex-col gap-1.5"
    }>
      {/* Search Input */}
      <div className={`flex items-center w-full transition-all duration-200 border ${
        isDesktopNav 
          ? `h-8 bg-black/5 rounded-full px-3 ${isFocused ? 'bg-white/80 border-[#059669]/40 ring-1 ring-[#059669]/20 shadow-md' : 'border-transparent hover:bg-black/10'}`
          : `h-11 bg-white/40 backdrop-blur-3xl rounded-2xl px-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] ${isFocused ? 'border-[#059669]/40 shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-[#059669]/20' : 'border-white/50'}`
      }`}>
        <Search size={isDesktopNav ? 13 : 15} className="text-gray-400 shrink-0 mr-2" strokeWidth={2} />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { setIsOpen(true); setIsFocused(true); }}
          placeholder="Search places, stations..."
          className={`flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 font-medium pr-2 ${isDesktopNav ? 'text-[11px]' : 'text-[13px] md:text-[14px]'}`}
        />
        <div className="flex items-center gap-1.5">
          {query && (
            <button onClick={() => setQuery('')} className={`rounded-md hover:bg-black/5 flex items-center justify-center text-gray-400 transition-colors ${isDesktopNav ? 'w-5 h-5' : 'w-6 h-6'}`}>
              <X size={13} strokeWidth={2.5} />
            </button>
          )}
          <div className={`w-px bg-gray-300/50 ${isDesktopNav ? 'h-4' : 'h-5'}`}></div>
          <button
            onClick={handleDirections}
            className={`rounded-full bg-[#059669] hover:bg-[#047857] flex items-center justify-center text-white transition-all duration-150 active:scale-95 shadow-[0_4px_12px_rgba(5,150,105,0.3)] ${isDesktopNav ? 'w-6 h-6' : 'w-8 h-8 rounded-xl'}`}
            title="Directions"
          >
            <Navigation size={12} className="rotate-45" strokeWidth={2.5} />
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
