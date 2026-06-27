/**
 * Latest City State Route
 * Provides access to the most recently cached city state from FastAPI.
 */

import express from 'express';
import { getLatestCityState } from '../services/cache.service.js';

const router = express.Router();

/**
 * GET /latest
 * Returns the latest cached city state.
 * Returns 503 if no data has been cached yet.
 */
router.get('/', (req, res) => {
  const cityState = getLatestCityState();

  if (!cityState) {
    return res.status(503).json({
      error: 'City state not available yet',
    });
  }

  res.status(200).json(cityState);
});

export default router;
