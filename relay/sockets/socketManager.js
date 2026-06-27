/**
 * Socket Manager
 * Handles all Socket.io client connections and city state broadcasts.
 */

import { getLatestCityState } from '../services/cache.service.js';

const UPDATE_EVENT = 'urbanhive:update';

let io = null;

/**
 * Initialize Socket.io connection handlers.
 * @param {import('socket.io').Server} socketServer - Socket.io server instance
 */
export function initializeSocketManager(socketServer) {
  io = socketServer;

  io.on('connection', (socket) => {
    console.log('Client Connected');

    emitLatestCityState(socket);

    socket.on('disconnect', () => {
      console.log('Client Disconnected');
    });
  });
}

/**
 * Broadcast the latest city state to every connected client.
 * @param {Object|null} latestCityState - The latest city state from FastAPI
 */
export function broadcastCityState(latestCityState) {
  if (!io || !latestCityState) {
    return;
  }

  io.emit(UPDATE_EVENT, latestCityState);
  logBroadcast(latestCityState, io.sockets.sockets.size);
}

/**
 * Send cached city state to a newly connected client.
 * No data is emitted if polling has not populated the cache yet.
 * @param {import('socket.io').Socket} socket - Connected client socket
 */
function emitLatestCityState(socket) {
  const latestCityState = getLatestCityState();

  if (!latestCityState) {
    return;
  }

  socket.emit(UPDATE_EVENT, latestCityState);
  logBroadcast(latestCityState, 1);
}

function logBroadcast(latestCityState, clientCount) {
  const tickNumber = latestCityState.tick || 'unknown';
  console.log(`Broadcasting Tick ${tickNumber} to ${clientCount} clients`);
}
