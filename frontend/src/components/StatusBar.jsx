import React, { useEffect, useState } from 'react';
import { getAverageSpeed, getActiveVehicles } from '../utils/kpiUtils';

const StatusBar = ({ data, connected, alerts }) => {
  const [flash, setFlash] = useState(false);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  useEffect(() => {
    if (alerts.length > lastAlertCount) {
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
      setLastAlertCount(alerts.length);
    }
  }, [alerts, lastAlertCount]);

  const avgSpeed = getAverageSpeed(data);
  const activeVehicles = getActiveVehicles(data);
  const activeAlerts = alerts.length;
  const lastUpdate = data?.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

  return (
    <footer className={`h-7 md:h-8 border-t flex items-center px-3 md:px-5 justify-between z-[1000] relative transition-colors duration-200 ${
      flash ? 'bg-yellow-50 border-yellow-200' : 'bg-white/40 backdrop-blur-3xl border-white/40 text-gray-600'
    }`}>
      <div className="flex items-center gap-3 md:gap-5 text-[9px] md:text-[10px] font-semibold tracking-wide">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300 animate-pulse'}`}></div>
          <span className={flash ? 'text-gray-900' : ''}>{connected ? 'Online' : 'Reconnecting'}</span>
        </div>
        <span className="hidden sm:inline text-gray-300">·</span>
        <span className="hidden sm:inline">{activeVehicles.toLocaleString()} vehicles</span>
        <span className="hidden sm:inline text-gray-300">·</span>
        <span className="hidden sm:inline">{avgSpeed} km/h</span>
        {activeAlerts > 0 && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-amber-500 font-bold">{activeAlerts} alert{activeAlerts !== 1 ? 's' : ''}</span>
          </>
        )}
      </div>
      <span className="text-[9px] md:text-[10px] font-medium text-gray-400 tabular-nums">{lastUpdate}</span>
    </footer>
  );
};

export default StatusBar;
