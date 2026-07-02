import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { mockData } from '../data/mockData';
import { RELAY_URL, URBANHIVE_UPDATE_EVENT } from '../config/relay';
import { useUrbanHiveStore } from '../store/useUrbanHiveStore';
import { normalizeCityState } from '../utils/cityStateAdapter';

export function useUrbanHiveSocket() {
  const cityState = useUrbanHiveStore((state) => state.cityState);
  const connected = useUrbanHiveStore((state) => state.connected);
  const alerts = useUrbanHiveStore((state) => state.alerts);
  const setCityState = useUrbanHiveStore((state) => state.setCityState);
  const setConnected = useUrbanHiveStore((state) => state.setConnected);
  const addAlert = useUrbanHiveStore((state) => state.addAlert);

  useEffect(() => {
    let isMounted = true;

    const loadLatestSnapshot = async () => {
      try {
        const response = await fetch(`${RELAY_URL}/latest`);
        if (!response.ok) return;
        const latest = await response.json();
        if (isMounted) {
          setCityState(normalizeCityState(latest, mockData));
        }
      } catch (error) {
        addAlert({
          id: 'offline-fallback',
          type: 'system',
          message: 'Using static map data until relay data arrives',
          severity: 'warning',
        });
      }
    };

    const socket = io(RELAY_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setConnected(true);
      loadLatestSnapshot();
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on(URBANHIVE_UPDATE_EVENT, (payload) => {
      setCityState(normalizeCityState(payload, mockData));
    });

    socket.on('connect_error', () => {
      setConnected(false);
      if (!useUrbanHiveStore.getState().cityState) {
        loadLatestSnapshot();
      }
    });

    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, [addAlert, setCityState, setConnected]);

  return {
    data: cityState ?? mockData,
    connected,
    alerts,
  };
}
