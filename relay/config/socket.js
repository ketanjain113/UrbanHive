const { logger } = require('./logger');

function createSocketHandlers(io, getLatestPollingSnapshot, subscribeToPollingUpdates) {
  const emitLatestSnapshot = (socket, snapshot) => {
    if (!snapshot) {
      return;
    }

    socket.emit('urbanhive:update', snapshot);
  };

  if (typeof subscribeToPollingUpdates === 'function') {
    subscribeToPollingUpdates((snapshot) => {
      io.emit('urbanhive:update', snapshot);
    });
  }

  io.on('connection', (socket) => {
    logger.info('Client Connected');

    emitLatestSnapshot(socket, typeof getLatestPollingSnapshot === 'function' ? getLatestPollingSnapshot() : null);

    socket.on('disconnect', () => {
      logger.info('Client Disconnected');
    });
  });
}

module.exports = { createSocketHandlers };
