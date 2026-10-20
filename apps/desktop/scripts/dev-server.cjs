'use strict';

const net = require('node:net');

async function choosePort(preferredPorts = [3000, 3001, 3002, 3003]) {
  for (const port of preferredPorts) {
    const available = await new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.listen(port, '127.0.0.1', () => server.close(() => resolve(true)));
    });
    if (available) return port;
  }
  throw new Error('No available port found for the SharpMind web development server.');
}

module.exports = { choosePort };
