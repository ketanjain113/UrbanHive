import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUrbanHiveStore } from '../store/useUrbanHiveStore';
import { CityState } from '../store/useUrbanHiveStore';

const RELAY_URL = process.env.REACT_APP_RELAY_URL || 'http://localhost:3001';
const UPDATE_EVENT = 'urbanhive:update';

/**
 * React hook for managing Socket.io connection to UrbanHive relay server.
 * 
 * Automatically connects on mount, listens for city state updates,
 * and syncs with useUrbanHiveStore. Cleans up on unmount.
 * 
 * Usage:
 *   function MyComponent() {
 *     useUrbanHiveSocket();
 *     const { cityState, connected } = useUrbanHiveStore();
 *     // component code
 *   }
 */
export function useUrbanHiveSocket(): void {
  const setCityState = useUrbanHiveStore((s) => s.setCityState);
  const setConnected = useUrbanHiveStore((s) => s.setConnected);

  useEffect(() => {
    let socket: Socket | null = null;

    /**
     * Initialize socket connection and set up event listeners.
     */
    const initSocket = () => {
      socket = io(RELAY_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        transports: ['websocket', 'polling'],
      });

      /**
       * Connection established.
       */
      socket.on('connect', () => {
        console.log('[UrbanHive Socket] Connected to relay');
        setConnected(true);
      });

      /**
       * Connection lost.
       */
      socket.on('disconnect', () => {
        console.log('[UrbanHive Socket] Disconnected from relay');
        setConnected(false);
      });

      /**
       * Receive city state update from relay.
       */
      socket.on(UPDATE_EVENT, (cityState: CityState) => {
        console.log(`[UrbanHive Socket] Received tick ${cityState.tick}`);
        setCityState(cityState);
      });

      /**
       * Connection error handler.
       */
      socket.on('connect_error', (error: Error) => {
        console.warn(`[UrbanHive Socket] Connection error: ${error.message}`);
      });
    };

    initSocket();

    /**
     * Cleanup on unmount: disconnect socket.
     */
    return () => {
      if (socket) {
        console.log('[UrbanHive Socket] Cleaning up connection');
        socket.disconnect();
      }
    };
  }, [setCityState, setConnected]);
}
