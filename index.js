require('dotenv').config();

const {
  startWebServer,
  startSelfRestartingBot,
  startDatabaseCleaningService,
  createDatabase
} = require('./services');


try {
  const db = createDatabase();
  startDatabaseCleaningService(db);
  startSelfRestartingBot(db);
  startWebServer(db);

  process.on('SIGTERM', function () {
    db.close();
    process.exit(0);
  });
  
} catch(err) {
  console.error(err);
  process.exit(-1);
}
