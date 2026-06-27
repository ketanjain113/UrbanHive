/**
 * Cache Service
 * In-memory storage for the latest city state from FastAPI.
 * This module maintains only the newest city state object.
 */

let latestCityState = null;

/**
 * Store the latest city state in memory.
 * @param {Object} data - The city state object from FastAPI
 */
export function setLatestCityState(data) {
  latestCityState = data;
}

/**
 * Retrieve the latest city state from memory.
 * @returns {Object|null} The cached city state, or null if not available
 */
export function getLatestCityState() {
  return latestCityState;
}
