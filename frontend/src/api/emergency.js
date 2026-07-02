/**
 * Emergency Corridor API
 * Handles communication with the relay server for emergency corridor requests.
 */

import { RELAY_URL } from '../config/relay';

/**
 * Activate emergency corridor on relay.
 * 
 * @param {Object} payload - Emergency corridor request data
 * @param {string} payload.vehicle_id - Vehicle ID (e.g. AMB-104)
 * @param {string} payload.type - Type of emergency (Ambulance, Fire Engine, Police)
 * @param {string} payload.from_location - Starting location
 * @param {string} payload.to_location - Destination location
 * @returns {Promise<Object>} Response with corridor coordinates and metadata
 * @throws {Error} If the request fails
 */
export async function activateEmergencyCorridor(payload) {
  try {
    const relayPayload = {
      origin: payload.from_location,
      destination: payload.to_location,
      vehicle_type: payload.type,
    };

    const response = await fetch(`${RELAY_URL}/emergency/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(relayPayload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Emergency activation failed: ${response.status}`);
    }

    const result = await response.json();
    const coords = Array.isArray(result.corridor)
      ? result.corridor.map((point) => [point.lat, point.lon ?? point.lng])
      : result.coords;

    return {
      ...result,
      coords,
      eta: result.eta_minutes,
      clearedJunctions: result.affected_junctions?.length,
      corridor_id: result.corridor_id ?? `${payload.vehicle_id || payload.type}-${result.timestamp || Date.now()}`,
    };
  } catch (error) {
    console.error('[Emergency API] Activation failed:', error);
    throw error;
  }
}

/**
 * Deactivate emergency corridor on relay.
 * 
 * @param {string} corridorId - Corridor ID to deactivate
 * @returns {Promise<Object>} Response confirming deactivation
 * @throws {Error} If the request fails
 */
export async function deactivateEmergencyCorridor(corridorId) {
  try {
    const response = await fetch(`${RELAY_URL}/emergency/deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ corridor_id: corridorId }),
    });

    if (response.status === 404) {
      return { status: 'inactive', corridor_id: corridorId };
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Deactivation failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Emergency API] Deactivation failed:', error);
    throw error;
  }
}
