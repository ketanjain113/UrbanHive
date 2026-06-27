/**
 * Health check route.
 * Provides endpoints to verify the relay and FastAPI backend are running.
 */

import express from 'express';
import { isFastAPIConnected } from '../services/fastapi.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const fastAPIConnected = await isFastAPIConnected();
    
    res.status(200).json({
      relay: 'ok',
      fastapi: fastAPIConnected ? 'connected' : 'disconnected',
      service: 'UrbanHive Relay',
      version: '1.0.0',
    });
  } catch (error) {
    console.error(`Health check error: ${error.message}`);
    res.status(500).json({
      relay: 'error',
      fastapi: 'unknown',
      error: error.message,
    });
  }
});

export default router;
