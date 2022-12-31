import i18next from 'i18next';
import { setLocale, string } from 'yup';
import axios from 'axios';
import resources from './locales/index.js';
import parser from './parser.js';
import { form, inputField, watcher } from './view.js';

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    resources,
  });

  const state = {
    feeds: [],
    xmlDocument: '',
  };
  const watchedState = watcher(state);

  setLocale({
    mixed: {
      notOneOf: i18n.t('textDanger.rssNotUnique'),
    },

    string: {
      url: i18n.t('textDanger.urlInvalid'),
    },
  });
  const schema = string().url().notOneOf([state.feeds]);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    schema.validate(inputField.value)
      .then((url) => {
        axios
          .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
          .then((response) => {
            const xmlString = response.data.contents;
            const xmlDocument = parser(xmlString);

            if (xmlDocument.querySelector('rss')) {
              watchedState.rssUploaded = true;
              watchedState.feeds.push(url);
              watchedState.feedback = [i18n.t('textSuccess')];
              watchedState.xmlDocument = xmlDocument;
            } else {
              watchedState.rssUploaded = false;
              watchedState.feedback = [i18n.t('textDanger.notContainValidRSS')];
            }
          })
          .catch((e) => {
            const message = (e.message === 'Network Error') ? 'textDanger.networkError' : 'textDanger.unknownError';
            watchedState.feedback = [i18n.t(message)];
            watchedState.rssUploaded = false;
          });
      })
      .catch((e) => {
        watchedState.rssUploaded = false;
        watchedState.feedback = [e.errors[0]];
      });
  });
};
