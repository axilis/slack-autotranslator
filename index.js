require('dotenv').config();

const {
  startWebApp,
  startSelfRestartingBot,
  startDatabaseCleaningService,
  createDatabase
} = require('./services');


try {
  const db = createDatabase();
  startDatabaseCleaningService(db);
  startSelfRestartingBot(db);
  startWebApp(db);

  process.on('SIGTERM', () => {
    db.close();
    console.log('Database closed!');
    process.exit(0);
  });

} catch(err) {
  console.error(err);
  process.exit(-1);
}
