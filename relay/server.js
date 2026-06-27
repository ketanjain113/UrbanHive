/**
 * UrbanHive Relay Server
 * Main entry point for Phase 2 of the UrbanHive project.
 * 
 * This relay service acts as an intermediary between the frontend and FastAPI backend.
 * It initializes the server, routes, Socket.io manager, and FastAPI polling.
 */

import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { PORT, NODE_ENV, corsOptions, socketOptions } from './config/server.js';
import healthRouter from './routes/health.js';
import testRouter from './routes/test.js';
import latestRouter from './routes/latest.js';
import emergencyRouter from './routes/emergency.js';
import { startPolling } from './services/polling.service.js';
import { initializeSocketManager } from './sockets/socketManager.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, socketOptions);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);
app.use('/test', testRouter);
app.use('/latest', latestRouter);
app.use('/emergency', emergencyRouter);

// Socket.io
initializeSocketManager(io);

// Start server
server.listen(PORT, () => {
  console.log(`UrbanHive Relay running on port ${PORT} (${NODE_ENV})`);
  
  // Start automatic polling of FastAPI backend
  startPolling();
});

export { app, server, io };
