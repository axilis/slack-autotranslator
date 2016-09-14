const fs = require('fs');
const path = require('path');

const sqlite3 = require('sqlite3').verbose();
const Promise = require('bluebird');


class Database {

  constructor(dbPath) {
    if (!fs.existsSync(dbPath)) {
      throw new Error('Invalid database dbPath!');
    }
    this.db = new sqlite3.Database(path.resolve(dbPath, 'data.db'));
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


  getRecentMessages(channel, limit) {
    const q = Promise.promisify(this.db.all, { context: this.db });
    return q(
      'SELECT * FROM messages WHERE channel = ? ORDER BY ts DESC LIMIT ?',
      [ channel, limit ]
    ).then((rows) => rows.sort((a, b) => a.ts - b.ts ));
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

  clearOld(channel) {
    const now = (new Date()).getTime();
    const dayAgo = new Date(now - 3600 * 1000 * 24);

    this.db.run(
      'DELETE FROM messages WHERE channel = ? AND ts < ?',
      [ channel, dayAgo.getTime() / 1000 ]
    );
  }

}

module.exports = Database;
