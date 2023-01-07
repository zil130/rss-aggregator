import { setLocale, string } from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parser from './parser.js';
import { i18n, form, inputField, watcher } from './view.js';
import normalizeUrl from './normalizeUrl.js';

export default () => {
  const state = {
    feeds: [],
    posts: [],
    uiState: {
      visitedLinks: [],
    },

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
        const description = xmlDocumentItem.querySelector('description').textContent.trim();

        return {
          id, feedId, link, title, description,
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

  const updatePosts = () => {
    setTimeout(() => {
      const promises = state.feeds.map(({ id, url }) => axios
        .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
        .then((response) => {
          const xmlString = response.data.contents;
          const xmlDocument = parser(xmlString);

          if (xmlDocument.querySelector('rss')) {
            const xmlDocumentItems = xmlDocument.querySelectorAll('item');

            const newPostsOfCurrentFeed = Array.from(xmlDocumentItems)
              .map((xmlDocumentItem) => {
                const link = xmlDocumentItem.querySelector('link').textContent.trim();
                const title = xmlDocumentItem.querySelector('title').textContent.trim();
                const description = xmlDocumentItem.querySelector('description').textContent.trim();

                return { link, title, description };
              })
              .filter(({ link }) => {
                const existingPosts = state.posts
                  .filter((post) => post.feedId === id)
                  .map((post) => post.link);

                return !existingPosts.includes(link);
              })
              .map(({ link, title, description }) => ({
                id: _.uniqueId(), feedId: id, link, title, description,
              }));

            if (newPostsOfCurrentFeed.length) {
              watchedState.posts = [...newPostsOfCurrentFeed, ...state.posts];
            }
          }
        }));

      const promise = Promise.all(promises);
      promise.then(() => setTimeout(updatePosts, 5000));
    }, 5000);
  };

  updatePosts();

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
