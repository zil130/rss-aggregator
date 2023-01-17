import { setLocale, string } from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import resources from './locales/index.js';
import parser from './parser.js';
import watcher from './view.js';
import normalizeUrl from './normalizeUrl.js';
import getExistingLinks from './getExistingLinks.js';
import generateQueryString from './generateQueryString.js';
import {
  form, inputField, posts as postList, renderTexts,
} from './renders.js';

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    resources,
  });

  const state = {
    feeds: [],
    posts: [],
    lang: 'ru',
    i18n,
    uiState: {
      visitedLinksIds: new Set(),
      modal: {
        postId: null,
      },
    },
  };

  renderTexts(i18n);

  setLocale({
    mixed: {
      notOneOf: 'feedback.failure.rssNotUnique',
    },

    string: {
      url: 'feedback.failure.urlInvalid',
    },
  });

  const getSchema = (existingLinks) => string().url().notOneOf(existingLinks);

  const watchedState = watcher(state);

  const trackPostViews = () => {
    postList.addEventListener('click', (event) => {
      const { tagName } = event.target;
      const { id } = event.target.dataset;
      if (tagName === 'A' || tagName === 'BUTTON') {
        watchedState.uiState.visitedLinksIds.add(id);
      }

      if (tagName === 'BUTTON') {
        watchedState.uiState.modal.postId = id;
      }
    });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const schema = getSchema(getExistingLinks(watchedState.feeds));
    schema.validate(normalizeUrl(inputField.value))
      .then((url) => {
        watchedState.formLocking = true;
        watchedState.feedback = 'feedback.pending';
        axios
          .get(generateQueryString(url))
          .then((response) => {
            const xmlString = response.data.contents;
            return parser(xmlString);
          })
          .then(({ feed, posts }) => {
            watchedState.formLocking = false;
            watchedState.rssUploaded = [true];
            watchedState.feedback = 'feedback.success';
            watchedState.feeds.push({
              id: _.uniqueId(), url, ...feed,
            });
            watchedState.posts = [
              ...posts.map((post) => ({
                id: _.uniqueId(), feedId: state.feeds.at(-1).id, ...post,
              })),
              ...state.posts,
            ];
            trackPostViews();
          })
          .catch((e) => {
            switch (e.message) {
              case 'feedback.failure.notContainValidRSS':
                watchedState.feedback = e.message;
                break;
              case 'Network Error':
                watchedState.feedback = 'feedback.failure.networkError';
                break;
              default:
                watchedState.feedback = 'feedback.failure.unknownError';
            }
            watchedState.rssUploaded = [false];
            watchedState.formLocking = false;
          });
      })
      .catch((e) => {
        watchedState.rssUploaded = [false];
        watchedState.feedback = e.errors;
      });
  });

  const updatePosts = () => {
    setTimeout(() => {
      const promises = state.feeds.map(({ id, url }) => axios
        .get(generateQueryString(url))
        .then((response) => {
          const xmlString = response.data.contents;
          return parser(xmlString);
        })
        .then(({ posts }) => {
          const newPostsOfCurrentFeed = posts
            .filter(({ link }) => {
              const existingPosts = state.posts
                .filter((post) => post.feedId === id)
                .map((post) => post.link);

              return !existingPosts.includes(link);
            })
            .map((post) => ({
              id: _.uniqueId(), feedId: id, ...post,
            }));

          if (newPostsOfCurrentFeed.length) {
            watchedState.posts = [...newPostsOfCurrentFeed, ...state.posts];
          }
        }));

      const promise = Promise.all(promises);
      promise
        .then(() => setTimeout(updatePosts, 5000))
        .catch(() => setTimeout(updatePosts, 5000));
    }, 5000);
  };

  updatePosts();

  const languageChoice = document.querySelector('.language-choice');
  languageChoice.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target.tagName === 'A') {
      watchedState.lang = event.target.id;
    }
  });
};
