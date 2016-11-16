const TranslatorAPI = require('./TranslatorAPI');
const LanguageGuesser = require('./LanguageGuesser');


class Translator {

  constructor(settings) {
    if (!settings.credentials) {
      throw new Error('Missing API credentials.');
    }

    this.api = new TranslatorAPI(settings.credentials);

    if (settings.guesser) {
      this.languageGuesser = new LanguageGuesser(settings.guesser);
    } else {
      console.log('Using language guesser can prevent part of API calls.');
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
    if (this.guesser) {
      return this.guesser.detect(text).catch(() => {
        return this.api.detect(text);
      });
    } else {
      return this.api.detect(text);
    }
  }

}


module.exports = Translator;
