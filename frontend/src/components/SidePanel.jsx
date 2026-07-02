import React from 'react';
import { X, Navigation, Train, MapPin, Landmark, Award, Shield, Users, Wind, Activity, Zap, Compass, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, BarChart, Bar, XAxis, Cell } from 'recharts';

const SidePanel = ({ feature, onClose, onDeactivateEmergency }) => {
  if (!feature) return null;

  const handleNavigate = () => {
    // Open Google Maps
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${feature.data.lat},${feature.data.lng}`, '_blank');
  };

  const renderContent = () => {
    switch (feature.type) {
      case 'traffic': {
        const { name, status, speed, phase } = feature.data;
        const mockChartData = Array.from({length: 10}, (_, i) => ({ speed: Math.max(5, speed + (Math.random() * 10 - 5)) }));
        
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              {name} — {status === 'heavy' ? 'Heavy Traffic' : status === 'moderate' ? 'Moderate Traffic' : 'Flowing'}
            </h2>
            
            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <p className="text-sm text-gray-600 mb-1">Current speed:</p>
              <p className="text-2xl font-bold text-gray-900">{speed} km/h <span className="text-sm font-normal text-gray-500">(usual: 45 km/h)</span></p>
            </div>

            <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-sm text-gray-600">AI signal phase:</p>
                <p className="font-medium text-gray-900">Phase {phase} active</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Est. wait:</p>
                <p className="font-medium text-gray-900">~{status === 'heavy' ? 4 : status === 'moderate' ? 2 : 1} min</p>
              </div>
            </div>

            <div className="h-24 mt-2">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Recent Speed Trend</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <YAxis domain={[0, 60]} hide />
                  <Line type="monotone" dataKey="speed" stroke="#059669" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      case 'parking': {
        const { name, capacity, occupied, fill_pct, eta_full } = feature.data;
        const freeSpaces = capacity - occupied;

        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">{name}</h2>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border-8 border-emerald-100 flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="36" cy="36" r="36" className="fill-none stroke-emerald-600 stroke-[8]" strokeDasharray={`${fill_pct * 2.26} 226`} />
                </svg>
                <span className="font-bold text-gray-900">{fill_pct.toFixed(0)}%</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{freeSpaces} <span className="text-base font-normal text-gray-500">free of {capacity}</span></p>
                <p className="text-sm text-gray-600">Parking spaces available</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mt-2">
              <p className="text-sm text-gray-600">Estimated full in:</p>
              <p className={`text-xl font-bold ${eta_full < 15 ? 'text-red-600' : 'text-gray-900'}`}>{eta_full} min</p>
            </div>

            <button onClick={handleNavigate} className="w-full bg-[#059669] text-white rounded-full py-3.5 mt-4 font-semibold flex items-center justify-center gap-2 hover:bg-[#047857] shadow-sm transition-colors">
              <Navigation size={18} />
              Navigate Here
            </button>
          </div>
        );
      }

      case 'ev': {
        const { name, load, bays_total, bays_free, suggestion } = feature.data;
        
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">{name}</h2>
            
            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm text-gray-600">Station Load</p>
                <p className="font-bold text-gray-900">{load}%</p>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${load > 80 ? 'bg-red-500' : load > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  style={{width: `${load}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <p className="text-sm text-gray-600 mb-1">Free bays:</p>
              <p className="text-2xl font-bold text-gray-900">{bays_free} <span className="text-sm font-normal text-gray-500">of {bays_total}</span></p>
            </div>

            {load > 80 && suggestion && (
              <div className="bg-emerald-50/80 backdrop-blur-md text-emerald-800 p-5 rounded-2xl border border-emerald-200/50 flex gap-3 items-start mt-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="mt-0.5">⚡</div>
                <div>
                  <p className="font-medium mb-1">This charger is getting full.</p>
                  <p className="text-sm">{suggestion}</p>
                </div>
              </div>
            )}

            <button onClick={handleNavigate} className="w-full bg-[#059669] text-white rounded-full py-3.5 mt-4 font-semibold flex items-center justify-center gap-2 hover:bg-[#047857] shadow-sm transition-colors">
              <Navigation size={18} />
              Navigate Here
            </button>
          </div>
        );
      }

      case 'petrol': {
        const { name, queue, congestion, recommended } = feature.data;
        
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">{name}</h2>
            
            <div className="flex gap-4">
              <div className="flex-1 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-3xl font-bold text-gray-900">{queue}</p>
                <p className="text-sm text-gray-600">Cars waiting</p>
              </div>
              <div className="flex-1 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-lg font-bold text-gray-900 capitalize mt-1">{congestion}</p>
                <p className="text-sm text-gray-600">Road to pump</p>
              </div>
            </div>

            {recommended && (
              <div className="bg-green-50/80 backdrop-blur-md text-green-800 p-5 rounded-2xl border border-green-200/50 flex items-center gap-3 mt-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0"><path d="M20 6 9 17l-5-5"/></svg>
                <p className="text-sm font-medium">AI Pick — lowest wait + easiest route right now</p>
              </div>
            )}

            <button onClick={handleNavigate} className="w-full bg-[#059669] text-white rounded-full py-3.5 mt-4 font-semibold flex items-center justify-center gap-2 hover:bg-[#047857] shadow-sm transition-colors">
              <Navigation size={18} />
              Navigate Here
            </button>
          </div>
        );
      }

      case 'emergency_corridor': {
        const { id, vehicleType, from, to, eta, clearedJunctions } = feature.data;
        
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
              <h2 className="text-xl font-bold">Corridor Active</h2>
            </div>
            
            <div className="bg-red-50/80 backdrop-blur-md p-5 rounded-2xl border border-red-200/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <p className="font-bold text-red-900 text-lg">{id} — {vehicleType}</p>
              <div className="flex items-center gap-2 mt-2 text-red-800 font-medium">
                <span>{from}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                <span>{to}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-3xl font-bold text-gray-900">{clearedJunctions}</p>
                <p className="text-sm text-gray-600">Junctions cleared</p>
              </div>
              <div className="flex-1 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-3xl font-bold text-gray-900">{eta} <span className="text-lg">min</span></p>
                <p className="text-sm text-gray-600">Est. arrival</p>
              </div>
            </div>

            <button 
              onClick={onDeactivateEmergency} 
              className="w-full bg-[#FF3B30] text-white rounded-full py-3.5 mt-4 font-semibold hover:bg-red-600 shadow-sm transition-colors"
            >
              Deactivate Corridor
            </button>
          </div>
        );
      }

      case 'city_boundary': {
        const { name, area, population, cleanliness_ranking, aqi, smart_mobility_score } = feature.data;
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Compass className="text-[#059669] shrink-0" size={24} />
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {name}
              </h2>
            </div>

            {/* Cleanliness Award Ribbon */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white p-4 rounded-2xl flex items-center gap-3 shadow-md">
              <Award size={36} className="shrink-0 animate-bounce" />
              <div>
                <p className="font-bold text-sm uppercase tracking-wider">Swachh Survekshan</p>
                <p className="text-xs opacity-90">{cleanliness_ranking}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-xs text-gray-500 font-medium">MUNICIPAL AREA</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{area}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-xs text-gray-500 font-medium">POPULATION</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{population}</p>
              </div>
            </div>

            {/* AQI Indicator */}
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <Wind size={14} className="text-green-500" /> AIR QUALITY INDEX (AQI)
                </span>
                <span className="text-sm font-bold text-green-600">{aqi} (Satisfactory)</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(aqi/300)*100}%` }}></div>
              </div>
            </div>

            {/* Smart Mobility Index */}
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <Activity size={14} className="text-emerald-500" /> SMART MOBILITY INDEX
                </span>
                <span className="text-sm font-bold text-emerald-600">{smart_mobility_score}/100</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${smart_mobility_score}%` }}></div>
              </div>
            </div>

            {/* Infrastructure Breakdown */}
            <div className="bg-white/40 border border-white/30 rounded-2xl p-4 flex flex-col gap-2.5">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Mobility Assets</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">AI Traffic Signals</span>
                <span className="font-semibold text-gray-800">84 Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">BRTS Transit Buses</span>
                <span className="font-semibold text-gray-800">450 Fleet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Public EV Bays</span>
                <span className="font-semibold text-gray-800">120 Chargers</span>
              </div>
            </div>
          </div>
        );
      }

      case 'metro_line': {
        const { name, status, progress, length, fleet, frequency } = feature.data;
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Train className="text-[#FF9500] shrink-0" size={24} />
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {name}
              </h2>
            </div>

            {/* Status Indicator */}
            <div className="bg-orange-50/80 border border-orange-200/50 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">OPERATIONAL STATUS</p>
                <p className="text-sm font-bold text-orange-600 mt-0.5">{status}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium">TRAIN FREQUENCY</p>
                <p className="text-sm font-bold text-orange-600 mt-0.5">Every {frequency}</p>
              </div>
            </div>

            {/* Construction Progress */}
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 font-medium">PHASE 1 TRIAL COMPLETION</span>
                <span className="text-sm font-bold text-gray-900">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            {/* Metro parameters list */}
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Route Distance</span>
                <span className="font-semibold text-gray-900">{length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fleet Allocated</span>
                <span className="font-semibold text-gray-900">{fleet}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Power Grid Source</span>
                <span className="font-semibold text-green-600 flex items-center gap-1">
                  <Zap size={14} /> 100% Solar Powered
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 border-t pt-3 leading-relaxed">
              * The Indore Metro yellow line acts as a central Ring corridor, connecting crucial transit zones and squares to reduce vehicular traffic on AB Road & MR 10 by an estimated 35%.
            </div>
          </div>
        );
      }

      case 'metro_station': {
        const { name, ridership, status, connection } = feature.data;
        const peakData = [
          { hour: '08 AM', riders: 120 },
          { hour: '11 AM', riders: 80 },
          { hour: '02 PM', riders: 60 },
          { hour: '05 PM', riders: 150 },
          { hour: '08 PM', riders: 110 }
        ];

        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Train className="text-[#FF9500] shrink-0" size={24} />
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {name}
              </h2>
            </div>

            {/* Transit connection */}
            <div className="bg-emerald-50/80 border border-emerald-200/50 p-4 rounded-2xl">
              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Multi-Modal Hub Connection</p>
              <p className="text-sm text-emerald-900 font-medium mt-1 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> {connection}
              </p>
            </div>

            {/* Mini stats cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-xs text-gray-500 font-medium">DAILY BOARDINGS</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{(ridership/1000).toFixed(1)}k</p>
              </div>
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-xs text-gray-500 font-medium">STATION STATUS</p>
                <p className="text-sm font-bold text-green-600 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {status}
                </p>
              </div>
            </div>

            {/* Daily ridership chart */}
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-box">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Ridership Pattern (Hourly Load)</p>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakData}>
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#6B7280' }} />
                    <Bar dataKey="riders" radius={[4, 4, 0, 0]}>
                      {peakData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.riders > 100 ? '#FF9500' : '#FFCC00'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button onClick={handleNavigate} className="w-full bg-[#059669] text-white rounded-full py-3.5 mt-2 font-semibold flex items-center justify-center gap-2 hover:bg-[#047857] shadow-sm transition-colors">
              <Navigation size={18} />
              Navigate to Station
            </button>
          </div>
        );
      }

      case 'famous_location': {
        const { name, congestion, AQI, cameras, footfall, info } = feature.data;
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Landmark className="text-[#5856D6] shrink-0" size={24} />
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {name}
              </h2>
            </div>

            {/* Description Info */}
            <p className="text-sm text-gray-600 leading-relaxed bg-white/40 border border-white/20 p-4 rounded-2xl">
              {info}
            </p>

            {/* Mini metrics dashboard */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-xs text-gray-500 font-medium">CONGESTION LEVEL</p>
                <p className={`text-sm font-bold mt-1 ${congestion === 'High' || congestion === 'Extreme' ? 'text-red-500' : congestion === 'Moderate' ? 'text-amber-500' : 'text-green-500'}`}>
                  {congestion}
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-xs text-gray-500 font-medium">DAILY FOOTFALL</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{footfall}</p>
              </div>
            </div>

            {/* Smart Infrastructure Indicators */}
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Shield size={16} className="text-indigo-500" /> Smart IoT Cameras
                </span>
                <span className="font-semibold text-gray-900">{cameras} Active</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Wind size={16} className="text-green-500" /> Local Air Quality
                </span>
                <span className={`font-semibold ${AQI > 80 ? 'text-amber-600' : 'text-green-600'}`}>AQI {AQI}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Users size={16} className="text-emerald-500" /> Pedestrian Crossing AI
                </span>
                <span className="font-semibold text-green-600">Active</span>
              </div>
            </div>

            {/* Camera feed live indicator */}
            <div className="relative h-28 w-full bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-white/10 group">
              <div className="absolute top-2 left-2 bg-red-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1 z-10">
                <span className="w-1 h-1 rounded-full bg-white"></span> Live Feed
              </div>
              {/* Simulated camera grid overlay */}
              <div className="absolute inset-0 border border-white/5 grid grid-cols-2 grid-rows-2 opacity-30 pointer-events-none"></div>
              <p className="text-[11px] text-slate-400 font-mono text-center select-none group-hover:text-white transition-colors duration-300">
                SECURE NETWORK LINK ACTIVE<br />
                <span className="text-xs text-emerald-400">CAMERA ONLINE</span>
              </p>
            </div>

            <button onClick={handleNavigate} className="w-full bg-[#059669] text-white rounded-full py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-[#047857] shadow-sm transition-colors">
              <Navigation size={18} />
              Directions to Square
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile: Bottom Sheet */}
      <div className={`md:hidden fixed inset-x-0 bottom-0 z-[1100] bg-white/40 backdrop-blur-3xl border-t border-white/50 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] rounded-t-[32px] transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        feature ? 'translate-y-0' : 'translate-y-full'
      }`} style={{ maxHeight: '65vh' }}>
        <div className="flex flex-col h-full relative">
          {/* Drag Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-9 h-1 rounded-full bg-gray-300"></div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-4 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors z-[1010]"
            aria-label="Close panel"
          >
            <X size={15} />
          </button>
          <div className="px-4 pb-4 pt-2 overflow-y-auto flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Desktop: Side Panel */}
      <div className={`hidden md:block absolute top-4 right-4 bottom-4 w-[440px] bg-white/30 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 rounded-[28px] z-[1000] transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        feature ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="h-full flex flex-col relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all duration-200 z-[1010]"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
          <div className="p-5 pt-10 overflow-y-auto flex-1 h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default SidePanel;

