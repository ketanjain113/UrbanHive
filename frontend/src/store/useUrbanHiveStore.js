import { create } from 'zustand';

const initialState = {
  cityState: null,
  connected: false,
  lastUpdated: null,
  alerts: [],
};

export const useUrbanHiveStore = create((set) => ({
  ...initialState,

  setCityState: (cityState) =>
    set({
      cityState,
      lastUpdated: Date.now(),
      alerts: Array.isArray(cityState?.alerts) ? cityState.alerts.slice(0, 5) : [],
    }),

  setConnected: (connected) =>
    set({
      connected,
      lastUpdated: connected ? Date.now() : null,
    }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 5),
    })),

  reset: () => set(initialState),
}));
