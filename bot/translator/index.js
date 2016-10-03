const TranslatorAPI = require('./translatorAPI');
const LanguageGuesser = require('./languageGuesser');


class Translator {

  constructor(settings) {

    if (!settings.clientId) {
      throw new Error('Missing clientId argument.');
    }

    if (!settings.clientSecret) {
      throw new Error('Missing clientSecret argument.');
    }

    this.settings = settings;
    this.api = new TranslatorAPI(settings.clientId, settings.clientSecret);

    if (settings.guesser) {
      this.languageGuesser = new LanguageGuesser(settings.guesser);
    } else {
      console.log('Using language guesser could benefit API call limits.');
    }
  }

  // Attempts to translate falling back to original text
  translate(text, targetLang) {

    return this._detectLanguage(text)
      .then((sourceLang) => {
        if (sourceLang !== targetLang) {
          return this.api.translate(text, sourceLang, targetLang);
        } else {
          return text;
        }
      })
      // If it failed to translate, just return original
      .catch(() => {
        return text;
      });

  }

  _detectLanguage(text) {

    if (this.languageGuesser) {
      return this.languageGuesser.guess(text).catch(() => {
        return this.api.detect(text);
      });
    } else {
      return this.api.detect(text);
    }

  }

}


module.exports = Translator;
