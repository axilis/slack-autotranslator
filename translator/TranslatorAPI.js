
const axios = require('axios');


function stripBOM(string) {
  if (string.charCodeAt(0) === 0xFEFF) {
    return string.slice(1);
  }
  return string;
}


class TranslatorAPI {

  constructor(client_secret) {
    this.client_secret = client_secret;
    this.accessToken = null;
    this.accessTokenExpiration = new Date();
  }

  detect(text) {
    return this._ensureValidToken(() => {

      const params = {
        appId: this.accessToken,
        text
      };

      return axios.get('http://api.microsofttranslator.com/V2/Ajax.svc/Detect', { params })
      .then((resp) => {
        return JSON.parse(stripBOM(resp.data));
      });
    });
  }

  translate(text, from, to) {
    return this._ensureValidToken(() => {

      const params = {
        appId: this.accessToken,
        text,
        from,
        to
      };

      return axios.get('http://api.microsofttranslator.com/V2/Ajax.svc/Translate', { params })
      .then((resp) => {
        return JSON.parse(stripBOM(resp.data));
      });
    });
  }


  // Ensures that function will be executed in context that has valid token
  _ensureValidToken(next) {
    if (this.accessToken !== null && this.accessTokenValid < new Date()) {
      return next();
    }

    return this._authorize(this.client_secret)
      .then((data) => {
        const currentTime = new Date().getTime();
        const offset = (data.expires_in - 5) * 1000;
        const expirationDate = new Date(currentTime + offset);

        this.accessToken = `Bearer ${data}`;
        this.accessTokenExpiratio = expirationDate;

        return next();
      });
  }

  // Creates access token
  _authorize(client_secret) {
    return axios.request({
      url: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': client_secret
      }
    }).then((resp) => {
      return resp.data;
    }).catch((err) => {
      throw new Error(err.response.data.error_description);
    });
  }

}


module.exports = TranslatorAPI;
