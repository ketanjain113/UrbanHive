const { fetchAll, tickSimulation } = require('./fastapiService');
const { logger } = require('../config/logger');

const POLL_INTERVAL_MS = Number(process.env.FASTAPI_POLL_INTERVAL_MS || 5000);

let latestPollingSnapshot = null;
let pollingTimer = null;
let pollingInProgress = false;
const updateListeners = new Set();

function getLatestPollingSnapshot() {
  return latestPollingSnapshot;
}

function subscribeToPollingUpdates(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  updateListeners.add(listener);
  return () => updateListeners.delete(listener);
}

function notifyUpdateListeners(snapshot) {
  for (const listener of updateListeners) {
    try {
      listener(snapshot);
    } catch (error) {
      logger.error('Polling listener error', { message: error.message });
    }
  }
}

async function runPollingCycle() {
  if (pollingInProgress) {
    return;
  }

  pollingInProgress = true;

  try {
    await tickSimulation();
    const allData = await fetchAll();

    latestPollingSnapshot = {
      timestamp: new Date().toISOString(),
      data: allData,
    };

    logger.info('Simulation Updated');
    notifyUpdateListeners(latestPollingSnapshot);
  } catch (error) {
    logger.warn('Polling cycle failed');
    latestPollingSnapshot = {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: error.status || 500,
      data: latestPollingSnapshot?.data || null,
    };
  } finally {
    pollingInProgress = false;
  }
}

function startPolling() {
  if (pollingTimer) {
    return pollingTimer;
  }

  runPollingCycle();

  pollingTimer = setInterval(() => {
    runPollingCycle();
  }, POLL_INTERVAL_MS);

  return pollingTimer;
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
  pollingInProgress = false;
}

module.exports = {
  POLL_INTERVAL_MS,
  getLatestPollingSnapshot,
  subscribeToPollingUpdates,
  runPollingCycle,
  startPolling,
  stopPolling,
};