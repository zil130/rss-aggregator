import { string } from 'yup';
import watcher, { form, inputField } from './view.js';

export default () => {
  const state = {
    feeds: [],
    error: [],
  };

  const schema = string().url('Ссылка должна быть валидным URL').notOneOf([state.feeds], 'RSS уже существует');
  const validate = (url) => schema.validate(url, { abortEarly: false });
  const watchedState = watcher(state);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    validate(inputField.value)
      .then((url) => {
        watchedState.feeds.push(url);
        watchedState.error = [];
      })
      .catch((e) => {
        watchedState.error = e.inner;
      });
  });
};
