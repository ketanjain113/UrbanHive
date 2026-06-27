/**
 * Emergency Service
 * Handles emergency request forwarding to the FastAPI backend.
 */

import { fastAPIClient } from '../config/fastapi.js';

/**
 * Forward an emergency activation request to FastAPI.
 * @param {Object} payload - Emergency activation payload from the frontend
 * @returns {Promise<import('axios').AxiosResponse>} FastAPI response
 */
export async function activateEmergency(payload) {
  return fastAPIClient.post('/emergency/activate', payload, {
    validateStatus: () => true,
  });
}
