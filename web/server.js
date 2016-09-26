#!/usr/bin/env node

const app = require('./app');
const debug = require('debug')('slack-autotranslator:server');
const https = require('https');
const http = require('http');
const fs = require('fs');

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server;


function createServer() {
  if (process.env.PRODUCTION.toLowerCase() === 'true') {
    const options = {
      key: fs.readFileSync(process.env.SSL_KEY),
      cert: fs.readFileSync(process.env.SSL_CERT)
    };

    if (process.env.SSL_CA) {
      options.ca = fs.readFileSync(process.env.SSL_CA);
    }

    return https.createServer(options, app);
  } else {
    return http.createServer(app);
  }
}

function startServer() {
  const server = createServer();
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
  return server;
}

server = startServer();

// Restart server every few days to ensure SSL certificates are up to date
const INTERVAL = 1000 * 60 * 60 * 24 * 3; // every 3 days
setInterval(function() {
  server.close(function() {
    server = startServer();
  });

}, INTERVAL);

/**
 * Listen on provided port, on all network interfaces.
 */

module.exports = app;


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    console.error(bind + ' requires elevated privileges');
    process.exit(1);
    break;
  case 'EADDRINUSE':
    console.error(bind + ' is already in use');
    process.exit(1);
    break;
  default:
    throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
