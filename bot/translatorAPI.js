const axios = require('axios');
const qs = require('querystring');


function stripBOM(string) {
  if (string.charCodeAt(0) === 0xFEFF) {
    return string.slice(1);
  }
  return string;
}


class TranslatorAPI {

  constructor(client_id, client_secret) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.accessToken = null;
    this.accessTokenExpiration = new Date();
  }

  // Ensures that function will be executed in context that has valid token
  _ensureValidToken(next) {

    if (this.accessToken !== null && this.accessTokenValid < new Date()) {
      return next();
    }

    return this._authorize(this.client_id, this.client_secret)
      .then((data) => {
        const currentTime = new Date().getTime();
        const offset = (data.expires_in - 5) * 1000;
        const expirationDate = new Date(currentTime + offset);

        this.accessToken = `Bearer ${data.access_token}`;
        this.accessTokenExpiratio = expirationDate;

        return next();
      });

  }

  // Creates access token
  _authorize(client_id, client_secret) {

    return axios.request({
      url: 'https://datamarket.accesscontrol.windows.net/v2/OAuth2-13',
      method: 'POST',
      data: qs.stringify({
        client_id: client_id,
        client_secret: client_secret,
        scope: 'http://api.microsofttranslator.com',
        grant_type: 'client_credentials'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then((resp) => {
      return resp.data;
    }).catch((err) => {
      throw new Error(err.response.data.error_description);
    });

  }

  detect(text) {

    return this._ensureValidToken(() => {
      return axios.get('http://api.microsofttranslator.com/V2/Ajax.svc/Detect', {
        params: {
          appId: this.accessToken,
          text
        }
      })
      .then((resp) => {
        return JSON.parse(stripBOM(resp.data));
      });
    });

  }

  translate(text, from, to) {

    return this._ensureValidToken(() => {
      return axios.get('http://api.microsofttranslator.com/V2/Ajax.svc/Translate', {
        params: {
          appId: this.accessToken,
          text,
          from,
          to
        }
      })
      .then((resp) => {
        return resp.data;
      });
    });

  }

}

module.exports = TranslatorAPI;
