const { fastApiClient, normalizeAxiosError } = require('./fastapiService');
const { logger } = require('../config/logger');

function normalizeEmergencyForwardingError(error) {
  const normalized = normalizeAxiosError(error, 'emergency activation');
  if (normalized.status === 503) {
    normalized.message = 'FastAPI backend is unreachable at http://localhost:8000';
    normalized.data = {
      detail: normalized.message,
    };
  }
  return normalized;
}

async function forwardEmergencyActivation(payload) {
  try {
    const response = await fastApiClient.post('/emergency/activate', payload);
    return response;
  } catch (error) {
    logger.warn('Emergency activation forwarding failed');
    throw normalizeEmergencyForwardingError(error);
  }
}

module.exports = {
  forwardEmergencyActivation,
};