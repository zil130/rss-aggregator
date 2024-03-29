import { setLocale, string } from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import resources from './locales/index.js';
import parser from './parser.js';
import watcher, {
  form, inputField, posts as postList, renderTexts,
} from './view.js';

const getExistingLinks = (feeds) => feeds.map(({ url }) => url);

const normalizeUrl = (url) => {
  const res = url.trim().split('');

  while (res.slice(-1).toString() === '/') {
    res.splice(-1);
  }

  return res.join('');
};

const generateQueryString = (url) => {
  const query = new URL('https://allorigins.hexlet.app/get');
  query.searchParams.set('disableCache', 'true');
  query.searchParams.set('url', url);

  return query;
};

export default () => {
  const i18n = i18next.createInstance();
  i18n
    .init({
      lng: 'ru',
      resources,
    })
    .then(() => {
      renderTexts(i18n);

      const state = {
        lang: i18n.language,
        feeds: [],
        posts: [],
        formLocking: false,
        feedback: null,
        highlightFeedback: null,
        uiState: {
          visitedLinksIds: new Set(),
          modal: {
            postId: null,
          },
        },
      };

      setLocale({
        mixed: {
          notOneOf: 'feedback.failure.rssNotUnique',
        },

        string: {
          url: 'feedback.failure.urlInvalid',
        },
      });

      const getSchema = (existingLinks) => string().url().notOneOf(existingLinks);

      const watchedState = watcher(state, i18n);

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const schema = getSchema(getExistingLinks(watchedState.feeds));
        const url = normalizeUrl(inputField.value);

        schema.validate(url)
          .then(() => {
            watchedState.formLocking = true;
            watchedState.highlightFeedback = 'warning';
            watchedState.feedback = 'feedback.pending';

            return axios.get(generateQueryString(url));
          })
          .then((response) => {
            const xmlString = response.data.contents;
            const { feed, posts } = parser(xmlString);
            const feedId = _.uniqueId();

            watchedState.formLocking = false;
            watchedState.highlightFeedback = 'success';
            watchedState.feedback = 'feedback.success';
            watchedState.feeds.push({
              id: feedId, url, ...feed,
            });
            watchedState.posts = [
              ...posts.map((post) => ({
                id: _.uniqueId(), feedId, ...post,
              })),
              ...state.posts,
            ];
          })
          .catch((e) => {
            switch (e.message) {
              case 'feedback.failure.urlInvalid':
                watchedState.feedback = e.message;
                break;
              case 'feedback.failure.rssNotUnique':
                watchedState.feedback = e.message;
                break;
              case 'feedback.failure.notContainValidRSS':
                watchedState.feedback = e.message;
                break;
              case 'Network Error':
                watchedState.feedback = 'feedback.failure.networkError';
                break;
              default:
                watchedState.feedback = 'feedback.failure.unknownError';
            }

            watchedState.highlightFeedback = 'danger';
            watchedState.formLocking = false;
          });
      });

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

      const languageChoice = document.querySelector('.language-choice');
      languageChoice.addEventListener('click', (event) => {
        event.preventDefault();

        if (event.target.tagName === 'A') {
          watchedState.lang = event.target.id;
        }
      });

      const updatePosts = () => {
        setTimeout(() => {
          const promises = state.feeds.map(({ id, url }) => axios
            .get(generateQueryString(url))
            .then((response) => {
              const xmlString = response.data.contents;
              const { posts } = parser(xmlString);
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
          promise.finally(() => setTimeout(updatePosts, 5000));
        }, 5000);
      };

      updatePosts();
    });
};
