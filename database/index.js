const fs = require('fs');
const path = require('path');

const sqlite3 = require('sqlite3').verbose();
const Promise = require('bluebird');

const TIME_SPAN = 10;

class Database {

  constructor(dbPath, storagePeriod) {
    try {
      fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch(err) {
      throw new Error(`Invalid database ${dbPath}`);
    }
    this.db = new sqlite3.Database(path.resolve(dbPath));
    this.storagePeriod = storagePeriod;
    this._initializeDatabase();
  }

  close() {
    this.db.close();
  }

  _initializeDatabase() {

    const get = Promise.promisify(this.db.get, { context: this.db });
    const run = Promise.promisify(this.db.run, { context: this.db });

    get('SELECT * FROM messages LIMIT 1')
      .catch(() => {
        return run(`
          CREATE TABLE messages(channel TEXT, user TEXT, name TEXT, color TEXT, text TEXT, translation TEXT, ts REAL);
          CREATE INDEX messageIndex ON messages(channel, ts);
        `);
      });

  }

  storeMessage(message) {
    this.db.run(
      'INSERT INTO messages VALUES(?, ?, ?, ?, ?, ?, ?)',
      [message.channel, message.user, message.name, message.color, message.text, message.translation, message.ts]
    );
  }

  deleteMessage(channel, message) {
    this.db.run(
      'DELETE FROM messages WHERE channel = ? AND user = ? AND ts = ?',
      [channel, message.user, message.ts]
    );
  }


  _filterByGroupingLast(messages, limit) {
    let lastAuthor = null;
    const selected = [];

    let entry;
    let counter = 0;

    for (const message of messages) {
	
      if (message.user != lastAuthor || parseInt(entry.ts, 10) - parseInt(message.ts, 10) > TIME_SPAN * 60) {
        counter += 1;
        lastAuthor = message.user;
        entry = message;

        if (counter > limit) {
          break;
        }

        selected.push(entry);
      } else {
        // Append row to last message
        entry.translation = message.translation + '\n' + entry.translation;
      }

    }
    return selected;
  }

  getRecentMessages(channel, limit) {
    const q = Promise.promisify(this.db.all, { context: this.db });
    return q(
      'SELECT * FROM messages WHERE channel = ? ORDER BY ts DESC LIMIT ?',
      [ channel, limit * 7 ]
      // TODO: Better fetching of records
      // This constant is to ensure enough rows gets fetched so when
      // combined they end up as given number of messages.
      // This wouldn't work when messages on average have more than 7 pieces,
      // but in all cases we observed that doesn't occour.
      // Should be improved in future but for prototype it is fine.
    )
    .then((rows) => { return this._filterByGroupingLast(rows, limit); })
    .then((rows) => rows.sort((a, b) => a.ts - b.ts ));
  }

  getAllMessages(channel) {
    const q = Promise.promisify(this.db.all, { context: this.db });
    return q(
      'SELECT * FROM messages WHERE channel = ? ORDER BY ts ASC',
      [ channel ]
    );
  }

  clearMessages(channel, from) {
    this.db.run(
      'DELETE FROM messages WHERE channel = ? AND ts > ?',
      [ channel, from.getTime() / 1000 ]
    );
  }

  clearOld() {
    const now = (new Date()).getTime();
    const dayAgo = new Date(now - 3600 * 1000 * this.storagePeriod);

    this.db.run(
      'DELETE FROM messages WHERE ts < ?',
      [ dayAgo.getTime() / 1000 ]
    );
  }

}

module.exports = Database;
