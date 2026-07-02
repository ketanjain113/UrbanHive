import { create } from 'zustand';
import { Junction, Charger, ParkingZone } from '../types';

/**
 * Complete city state payload from FastAPI backend via relay.
 * Contains all real-time traffic, charging, parking, and vehicle data.
 */
export interface CityState {
  tick: number;
  timestamp: number;
  junctions: Junction[];
  chargers: Charger[];
  parkingZones: ParkingZone[];
  petrolPumps: any[];
  vehicles: any[];
  emergencyCorridors: any[];
  alerts: any[];
  metrics: {
    avgTravelTime: number;
    activeVehicles: number;
    co2Saved: number;
    congestionIndex: number;
  };
  [key: string]: any; // Allow extensibility for future fields
}

interface UrbanHiveState {
  /** Latest city state payload from relay/backend */
  cityState: CityState | null;
  
  /** WebSocket connection status */
  connected: boolean;
  
  /** Timestamp of last city state update */
  lastUpdated: number | null;
  
  /** Update city state with new payload */
  setCityState: (state: CityState) => void;
  
  /** Update connection status */
  setConnected: (connected: boolean) => void;
  
  /** Reset store to initial state */
  reset: () => void;
}

/**
 * Zustand store for managing live UrbanHive simulation state.
 * Holds real-time data from the relay server and tracks connection status.
 */
export const useUrbanHiveStore = create<UrbanHiveState>((set) => ({
  cityState: null,
  connected: false,
  lastUpdated: null,

  setCityState: (cityState) =>
    set({
      cityState,
      lastUpdated: Date.now(),
    }),

  setConnected: (connected) =>
    set({
      connected,
      // Reset lastUpdated when disconnected
      lastUpdated: connected ? undefined : null,
    }),

  reset: () =>
    set({
      cityState: null,
      connected: false,
      lastUpdated: null,
    }),
}));
