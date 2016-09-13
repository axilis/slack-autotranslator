const TranslatorAPI = require('./translatorAPI');
const LanguageGuesser = require('./languageGuesser');

class Translator {

  constructor(settings) {
    this.settings = settings;
    this.api = new TranslatorAPI(settings.clientId, settings.clientSecret);

    if (settings.guesser) {
      this.languageGuesser = new LanguageGuesser(settings.guesser);
    }
  }

  translate(text, targetLang) {

    return this.detectLanguage(text)
      .then((sourceLang) => {
        if (sourceLang !== targetLang) {
          return this.api.translate(text, sourceLang, targetLang);
        } else {
          return text;
        }
      })
      // If it is not possible to translate, just return original
      .catch(() => {
        return text;
      });

  }

  detectLanguage(text) {

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
