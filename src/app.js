import { string } from 'yup';
import watcher, { form, field } from './view.js';

export default () => {
  const state = {
    feeds: [],
    error: [],
  };

  const schema = string().url('Ссылка должна быть валидным URL').notOneOf([state.feeds], 'RSS уже существует');
  const validate = (input) => schema.validate(input, { abortEarly: false });

  const watchedState = watcher(state);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    validate(field.value)
      .then((link) => {
        watchedState.feeds.push(link);
        watchedState.error = [];
      })
      .catch((error) => {
        watchedState.error = error.inner;
      });
  });
};
