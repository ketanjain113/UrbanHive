const axios = require('axios');
const { logger } = require('../config/logger');

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';
const FASTAPI_TIMEOUT_MS = Number(process.env.FASTAPI_TIMEOUT_MS || 5000);

const fastApiClient = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: FASTAPI_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

function normalizeAxiosError(error, operation) {
  if (error.response) {
    const status = error.response.status;
    const detail = error.response.data?.detail || error.response.data?.message || 'FastAPI request failed';

    const normalizedError = new Error(`${operation} failed with status ${status}: ${detail}`);
    normalizedError.status = status;
    normalizedError.data = error.response.data;
    return normalizedError;
  }

  if (error.request) {
    const normalizedError = new Error(`${operation} failed: FastAPI backend is unreachable at ${FASTAPI_BASE_URL}`);
    normalizedError.status = 503;
    return normalizedError;
  }

  const normalizedError = new Error(`${operation} failed: ${error.message}`);
  normalizedError.status = 500;
  return normalizedError;
}

function withFastApiErrorHandling(operationName, requestFn) {
  return requestFn().catch((error) => {
    logger.warn(`${operationName} failed`);
    throw normalizeAxiosError(error, operationName);
  });
}

async function tickSimulation() {
  return withFastApiErrorHandling('tickSimulation', async () => {
    const response = await fastApiClient.post('/simulate/tick');
    return response.data;
  });
}

async function fetchAll() {
  return withFastApiErrorHandling('fetchAll', async () => {
    const response = await fastApiClient.get('/all');
    return response.data;
  });
}

module.exports = {
  FASTAPI_BASE_URL,
  fastApiClient,
  normalizeAxiosError,
  tickSimulation,
  fetchAll,
};
