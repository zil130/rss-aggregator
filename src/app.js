import i18next from 'i18next';
import { setLocale, string } from 'yup';
import resources from './locales/index.js';
import watcher, { form, inputField } from './view.js';

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    resources,
  });

  const state = {
    feeds: [],
    error: [],
  };
  const watchedState = watcher(state);

  setLocale({
    mixed: {
      notOneOf: i18n.t('rssNotUnique'),
    },
    string: {
      url: i18n.t('urlInvalid'),
    },
  });
  const schema = string().url().notOneOf([state.feeds]);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    schema.validate(inputField.value)
      .then((url) => {
        watchedState.feeds.push(url);
        watchedState.error = [];
      })
      .catch((e) => {
        watchedState.error = e.errors;
      });
  });
};
