const { getRelayHealth } = require('./healthService');
const { FASTAPI_BASE_URL, fastApiClient, tickSimulation, fetchAll } = require('./fastapiService');
const { forwardEmergencyActivation } = require('./emergencyService');
const {
  POLL_INTERVAL_MS,
  getLatestPollingSnapshot,
  subscribeToPollingUpdates,
  runPollingCycle,
  startPolling,
  stopPolling,
} = require('./pollingService');

module.exports = {
  getRelayHealth,
  FASTAPI_BASE_URL,
  fastApiClient,
  tickSimulation,
  fetchAll,
  forwardEmergencyActivation,
  POLL_INTERVAL_MS,
  getLatestPollingSnapshot,
  subscribeToPollingUpdates,
  runPollingCycle,
  startPolling,
  stopPolling,
};
