/**
 * Test Routes
 * Temporary routes for testing FastAPI backend connectivity.
 * These routes demonstrate the relay's ability to forward requests to FastAPI.
 */

import express from 'express';
import { healthCheck, getCityState, tickSimulation } from '../services/fastapi.service.js';

const router = express.Router();

/**
 * GET /test/backend
 * Calls FastAPI health endpoint and returns its response.
 */
router.get('/backend', async (req, res) => {
  try {
    const healthData = await healthCheck();
    res.status(200).json(healthData);
  } catch (error) {
    res.status(503).json({
      error: 'FastAPI backend unavailable',
      details: error.message,
    });
  }
});

/**
 * GET /test/all
 * Calls FastAPI /all endpoint and returns the complete city state.
 */
router.get('/all', async (req, res) => {
  try {
    const cityState = await getCityState();
    res.status(200).json(cityState);
  } catch (error) {
    res.status(503).json({
      error: 'Failed to fetch city state',
      details: error.message,
    });
  }
});

/**
 * POST /test/tick
 * Calls FastAPI /simulate/tick endpoint to advance simulation.
 */
router.post('/tick', async (req, res) => {
  try {
    const updatedSimulation = await tickSimulation();
    res.status(200).json(updatedSimulation);
  } catch (error) {
    res.status(503).json({
      error: 'Failed to advance simulation',
      details: error.message,
    });
  }
});

export default router;
