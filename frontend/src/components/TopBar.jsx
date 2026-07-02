import React from 'react';
import { Wifi, Signal } from 'lucide-react';
import UrbanHiveLogo from './UrbanHiveLogo';
import { getTemperature } from '../utils/kpiUtils';

const TopBar = ({ children, data }) => {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateString = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const temperature = getTemperature(data);

  return (
    <header className="h-11 md:h-12 bg-white/40 backdrop-blur-3xl flex items-center justify-between px-3 md:px-5 z-[1000] relative border-b border-white/40">
      {/* Brand */}
      <div className="flex items-center gap-2 md:gap-2.5">
        <UrbanHiveLogo className="text-[#059669]" size={28} />
        <div className="flex flex-col">
          <h1 className="text-[12px] md:text-[13px] font-bold text-gray-900 leading-none tracking-[-0.01em]">UrbanHive</h1>
          <p className="text-[8px] md:text-[10px] text-gray-500 font-medium leading-none mt-0.5 tracking-wide uppercase">Mobility OS</p>
        </div>
      </div>

      {/* Center content (SearchBar on Desktop, or Location text) */}
      <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
        {children || (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] md:text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Indore, MP</span>
            <span className="text-[7px] md:text-[8px] text-[#059669] bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile: just time. Desktop: date + time */}
        <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-semibold text-gray-500">
          <span className="hidden md:inline">{dateString}</span>
          <span className="text-gray-900 font-bold tabular-nums">{timeString}</span>
        </div>
        <div className="hidden md:block w-px h-4 bg-gray-200"></div>
        <div className="hidden md:flex items-center gap-2 text-gray-400">
          <Wifi size={12} strokeWidth={2.5} />
          <Signal size={12} strokeWidth={2.5} />
        </div>
        {/* Temperature pill */}
        <div className="flex items-center gap-1 bg-emerald-50 text-[#059669] text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
          <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#059669] animate-pulse"></span>
          {temperature}°C
        </div>
      </div>
    </header>
  );
};

export default TopBar;
