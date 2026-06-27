const express = require('express');
const { createHealthRouter } = require('./health');
const { createEmergencyRouter } = require('./emergency');

function registerRoutes() {
  const router = express.Router();

  router.use('/health', createHealthRouter());
  router.use('/emergency', createEmergencyRouter());

  return router;
}

module.exports = { registerRoutes };
