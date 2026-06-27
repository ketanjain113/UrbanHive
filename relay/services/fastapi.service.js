/**
 * FastAPI Service
 * Handles all communication with the FastAPI backend.
 * Provides reusable functions for simulation, city state queries, and health checks.
 */

import { fastAPIClient, FASTAPI_BASE_URL } from '../config/fastapi.js';

/**
 * Performs a health check against the FastAPI backend.
 * @returns {Promise<Object>} The health status from FastAPI
 * @throws {Error} If FastAPI is unavailable
 */
export async function healthCheck() {
  try {
    const response = await fastAPIClient.get('/health');
    return response.data;
  } catch (error) {
    console.error(`FastAPI health check failed: ${error.message}`);
    throw new Error(`FastAPI unavailable: ${error.message}`);
  }
}

/**
 * Retrieves the complete city state from FastAPI.
 * @returns {Promise<Object>} The complete simulation state
 * @throws {Error} If FastAPI is unavailable
 */
export async function getCityState() {
  try {
    const response = await fastAPIClient.get('/all');
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch city state: ${error.message}`);
    throw new Error(`FastAPI unavailable: ${error.message}`);
  }
}

/**
 * Advances the traffic simulation by one tick.
 * @returns {Promise<Object>} The updated simulation state
 * @throws {Error} If FastAPI is unavailable
 */
export async function tickSimulation() {
  try {
    const response = await fastAPIClient.post('/simulate/tick');
    return response.data;
  } catch (error) {
    console.error(`Failed to advance simulation: ${error.message}`);
    throw new Error(`FastAPI unavailable: ${error.message}`);
  }
}

/**
 * Checks if FastAPI backend is reachable.
 * @returns {Promise<boolean>} True if FastAPI is connected, false otherwise
 */
export async function isFastAPIConnected() {
  try {
    await fastAPIClient.get('/health');
    return true;
  } catch (error) {
    console.warn(`FastAPI connection check failed: ${error.message}`);
    return false;
  }
}
