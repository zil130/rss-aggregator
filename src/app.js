import i18next from 'i18next';
import { setLocale, string } from 'yup';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import parser from './parser.js';
import { form, inputField, watcher } from './view.js';
import normalizeUrl from './normalizeUrl.js';

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    resources,
  });

  const state = {
    feeds: [],
    posts: [],
    xmlDocument: '',

    getUrls() {
      return this.feeds.map(({ url }) => url);
    },

    addPosts(xmlDocument) {
      const xmlDocumentItems = xmlDocument.querySelectorAll('item');

      return Array.from(xmlDocumentItems).map((xmlDocumentItem) => {
        const id = _.uniqueId();
        const feedId = this.feeds.at(-1).id;
        const link = xmlDocumentItem.querySelector('link').textContent.trim();
        const title = xmlDocumentItem.querySelector('title').textContent.trim();

        return {
          id, feedId, link, title,
        };
      });
    },
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
  const getSchema = (existingLinks) => string().url().notOneOf(existingLinks);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const schema = getSchema(watchedState.getUrls());
    schema.validate(normalizeUrl(inputField.value))
      .then((url) => {
        axios
          .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
          .then((response) => {
            const xmlString = response.data.contents;
            const xmlDocument = parser(xmlString);

            if (xmlDocument.querySelector('rss')) {
              const title = xmlDocument.querySelector('title').textContent.trim();
              const description = xmlDocument.querySelector('description').textContent.trim();

              watchedState.rssUploaded = true;
              watchedState.feeds.push({
                id: _.uniqueId(), url, title, description,
              });
              watchedState.posts = [...watchedState.addPosts(xmlDocument), ...state.posts];
              watchedState.feedback = [i18n.t('textSuccess')];
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
