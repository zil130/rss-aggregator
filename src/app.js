import { setLocale, string } from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parser from './parser.js';
import {
  form, inputField, watcher,
} from './view.js';
import normalizeUrl from './normalizeUrl.js';

export default () => {
  const state = {
    feeds: [],
    posts: [],
    lang: 'ru',
    uiState: {
      visitedLinks: [],
    },
  };

  const getExistingLinks = (feeds) => feeds.map(({ url }) => url);

  const watchedState = watcher(state);

  setLocale({
    mixed: {
      notOneOf: 'feedback.failure.rssNotUnique',
    },

    string: {
      url: 'feedback.failure.urlInvalid',
    },
  });

  const getSchema = (existingLinks) => string().url().notOneOf(existingLinks);

  const updatePosts = () => {
    setTimeout(() => {
      const promises = state.feeds.map(({ id, url }) => axios
        .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
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

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const schema = getSchema(getExistingLinks(watchedState.feeds));
    schema.validate(normalizeUrl(inputField.value))
      .then((url) => {
        watchedState.formLocking = true;
        watchedState.feedback = 'feedback.pending';
        axios
          .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
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

  const languageChoice = document.querySelector('.language-choice');
  languageChoice.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target.tagName === 'A') {
      watchedState.lang = event.target.id;
    }
  });
};
