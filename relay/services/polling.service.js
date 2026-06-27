/**
 * Polling Service
 * Automatically polls the FastAPI backend every 5 seconds.
 * Handles the sequence: advance tick → get city state → cache it.
 * Includes automatic retry on error without crashing the relay.
 */

import { tickSimulation, getCityState } from './fastapi.service.js';
import { setLatestCityState } from './cache.service.js';
import { broadcastCityState } from '../sockets/socketManager.js';

const POLLING_INTERVAL = 5000; // 5 seconds
let pollingTimer = null;
let pollingActive = false;

/**
 * Start the polling loop.
 * The relay will automatically poll FastAPI every 5 seconds.
 */
export function startPolling() {
  if (pollingActive) {
    console.warn('Polling already started');
    return;
  }

  pollingActive = true;
  console.log('Starting FastAPI polling (every 5 seconds)');
  poll();
}

/**
 * Stop the polling loop.
 * Useful for graceful shutdown or testing.
 */
export function stopPolling() {
  pollingActive = false;

  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }

  console.log('Polling stopped');
}

/**
 * Perform a single poll cycle.
 * Sequence: 1) Advance tick, 2) Get city state, 3) Cache it
 * On error, logs the issue and retries after 5 seconds.
 */
async function poll() {
  try {
    await tickSimulation();
    const cityState = await getCityState();

    setLatestCityState(cityState);
    broadcastCityState(cityState);

    const tickNumber = cityState.tick || 'unknown';
    console.log(`Simulation Tick Updated → Tick ${tickNumber}`);
  } catch (error) {
    console.error(`Polling error: ${error.message}. Retrying in ${POLLING_INTERVAL / 1000} seconds...`);
  } finally {
    if (pollingActive) {
      pollingTimer = setTimeout(poll, POLLING_INTERVAL);
    }
  }
}
