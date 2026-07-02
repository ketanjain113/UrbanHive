import React, { useEffect } from 'react';
import { useUrbanHiveStore } from '../store/useUrbanHiveStore';

/**
 * Temporary developer panel for verifying live backend data connection.
 * Displays socket connection status and the latest tick number from UrbanHive backend.
 * 
 * This component is non-intrusive and can be easily removed after testing.
 * Place it in your app root or any page to verify data flow.
 * 
 * Usage:
 *   <DeveloperPanel />
 */
export const DeveloperPanel: React.FC = () => {
  const connected = useUrbanHiveStore((s) => s.connected);
  const cityState = useUrbanHiveStore((s) => s.cityState);
  const lastUpdated = useUrbanHiveStore((s) => s.lastUpdated);

  const tick = cityState?.tick ?? 'N/A';
  const timestamp = cityState?.timestamp ?? 'N/A';
  const junctionCount = cityState?.junctions?.length ?? 0;
  const chargerCount = cityState?.chargers?.length ?? 0;
  const parkingCount = cityState?.parkingZones?.length ?? 0;

  // Log state changes for debugging
  useEffect(() => {
    console.log('[UrbanHive Dev Panel]', {
      connected,
      tick,
      timestamp,
      lastUpdated: lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A',
      dataPayloadSize: {
        junctions: junctionCount,
        chargers: chargerCount,
        parkingZones: parkingCount,
      },
    });
  }, [connected, tick, timestamp, lastUpdated, junctionCount, chargerCount, parkingCount]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: '#00FF00',
        fontFamily: 'monospace',
        fontSize: '11px',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #00FF00',
        maxWidth: '300px',
        boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
        ● UrbanHive Live Data
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <span style={{ color: connected ? '#00FF00' : '#FF0000' }}>
          ● {connected ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
      </div>

      <div style={{ marginBottom: '6px' }}>
        tick: <span style={{ color: '#FFA500' }}>{tick}</span>
      </div>

      <div style={{ marginBottom: '6px' }}>
        timestamp: {timestamp !== 'N/A' ? new Date(timestamp).toLocaleTimeString() : 'N/A'}
      </div>

      <div style={{ marginBottom: '6px' }}>
        lastUpdate: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}
      </div>

      <div style={{ borderTop: '1px solid #00FF00', paddingTop: '8px', marginTop: '8px' }}>
        <div>junctions: {junctionCount}</div>
        <div>chargers: {chargerCount}</div>
        <div>parking: {parkingCount}</div>
      </div>

      <div
        style={{
          fontSize: '9px',
          marginTop: '8px',
          color: '#888',
          textAlign: 'center',
        }}
      >
        Dev Panel (remove after testing)
      </div>
    </div>
  );
};
