import { useUrbanHiveStore } from '../store/useUrbanHiveStore';

/**
 * Browser console logger for UrbanHive live data.
 * Use this utility to inspect the live data stream in the console.
 * 
 * Call this function once in a component or useEffect to enable detailed logging:
 * 
 * Usage:
 *   import { enableUrbanHiveConsoleLogging } from '../utils/developerLogger';
 *   
 *   useEffect(() => {
 *     enableUrbanHiveConsoleLogging();
 *   }, []);
 */

let loggingEnabled = false;

export function enableUrbanHiveConsoleLogging(verbose = false): void {
  if (loggingEnabled) {
    console.log('[UrbanHive Logger] Already enabled');
    return;
  }

  loggingEnabled = true;

  console.log('%c[UrbanHive] Console logging enabled', 'color: #00FF00; font-weight: bold; font-size: 12px;');
  console.log(
    '%cTo inspect the live store, use: window.__urbanHiveStore()',
    'color: #FFA500; font-size: 11px;'
  );

  // Expose store accessor on window for debugging
  (window as any).__urbanHiveStore = () => {
    const state = useUrbanHiveStore.getState();
    return {
      connected: state.connected,
      tick: state.cityState?.tick,
      lastUpdated: state.lastUpdated,
      cityState: state.cityState,
    };
  };

  // Subscribe to store updates
  const unsubscribe = useUrbanHiveStore.subscribe(
    (state) => state.cityState?.tick,
    (tick, prevTick) => {
      if (verbose || tick !== prevTick) {
        const state = useUrbanHiveStore.getState();
        console.log(
          `%c[UrbanHive] Tick ${tick}`,
          'color: #00FF00; font-weight: bold;',
          {
            connected: state.connected,
            tick: state.cityState?.tick,
            lastUpdated: new Date(state.lastUpdated || 0).toLocaleTimeString(),
            junctions: state.cityState?.junctions?.length ?? 0,
            chargers: state.cityState?.chargers?.length ?? 0,
            parkingZones: state.cityState?.parkingZones?.length ?? 0,
          }
        );
      }
    }
  );

  // Handle connection status changes
  useUrbanHiveStore.subscribe(
    (state) => state.connected,
    (connected) => {
      console.log(
        `%c[UrbanHive] Connection: ${connected ? 'CONNECTED ✓' : 'DISCONNECTED ✗'}`,
        `color: ${connected ? '#00FF00' : '#FF0000'}; font-weight: bold;`
      );
    }
  );

  console.log(
    '%cTo disable logging, run: window.__urbanHiveDisableLogging()',
    'color: #888; font-size: 11px;'
  );

  (window as any).__urbanHiveDisableLogging = () => {
    unsubscribe();
    loggingEnabled = false;
    console.log('[UrbanHive] Console logging disabled');
  };
}

/**
 * Disable UrbanHive console logging.
 */
export function disableUrbanHiveConsoleLogging(): void {
  if ((window as any).__urbanHiveDisableLogging) {
    (window as any).__urbanHiveDisableLogging();
  }
}
