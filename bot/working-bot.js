
const Bot = require('slackbots');

const PING_INTERVAL = 1000; // ms
const PING_TIMEOUT = 4000; // ms

/**
  * Reimplementation of connect to enable proper connection error handling.
  */
class WorkingBot extends Bot {

  // Override connect to figure out when connection breaks
  connect() {
    super.connect();

    let id = 0;
    let lastResponse = new Date();

    // Capture pong responses
    this.ws.on('message', function(resp) {
      if (JSON.parse(resp).type == 'pong') {
        lastResponse = new Date();
      }
    });

    // Send ping requests periodicallly
    const interval = setInterval(() => {

      const state = this.ws.readyState;
      if (state === this.ws.CLOSING || state === this.ws.CLOSED) {
        // Prevent further calling of this instance of bot
        return clearInterval(interval);
      }

      // If connection timeouts
      const elapsedTime = new Date() - lastResponse;
      if (elapsedTime > PING_TIMEOUT) {
        console.error(`Connection timeout, last response is ${ elapsedTime / 1000 }s old!`);
        return this.ws.close();
      }

      // Otherwise determine whether connection is open and send ping
      if (state === this.ws.OPEN) {
        this.ws.send(JSON.stringify({
          id: `ping_${id++}`,
          type: 'ping'
        }), (error) => {
          // Capture connection error
          if (error) {
            console.error(error);
            this.ws.close();
          }
        });

      }

    }, PING_INTERVAL);
  }

}

module.exports = WorkingBot;
