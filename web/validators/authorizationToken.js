
const crypto = require('crypto');

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

class TokenValidator {

  constructor(key, algorithm = 'aes-256-ctr') {
    this.algorithm = algorithm;
    this.key = key;
  }

  generateToken() {
    const time = String((new Date()).getTime());
    const random = sha256(time);
    return [this._encrypt(time, random), random];
  }

  validateToken(token, random) {
    const time = new Date(parseInt(this._decrypt(token, random)));
    const hourAgo = new Date((new Date()).getTime() - 3600 * 1000);
    return time > hourAgo;
  }

  _encrypt(text, random){
    const cipher = crypto.createCipher(this.algorithm, random + this.key);
    const crypted = cipher.update(text, 'utf8', 'hex');
    return crypted + cipher.final('hex');
  }

  _decrypt(text, random){
    var decipher = crypto.createDecipher(this.algorithm, random + this.key);
    var decrypted = decipher.update(text, 'hex', 'utf8');
    return decrypted + decipher.final('utf8');
  }

}

module.exports = {
  TokenValidator
};
