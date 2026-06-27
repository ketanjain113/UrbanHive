/**
 * Emergency Routes
 * Receives emergency activation requests from the frontend and forwards them to FastAPI.
 */

import express from 'express';
import { activateEmergency } from '../services/emergency.service.js';

const router = express.Router();

/**
 * POST /emergency/activate
 * Forwards emergency activation requests to FastAPI.
 */
router.post('/activate', async (req, res) => {
  console.log('Emergency activation requested');

  try {
    const response = await activateEmergency(req.body);
    console.log('Emergency corridor activated');
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(503).json({
      error: 'Emergency activation failed',
      details: error.message,
    });
  }
});

export default router;
