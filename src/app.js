import { string } from 'yup';
import onChange from 'on-change';

export default () => {
  const state = {
    feeds: [],
    error: [],
  };

  const form = document.querySelector('.rss-form');
  const field = document.querySelector('[aria-label="url"]');
  field.focus();
  const feedback = document.querySelector('.feedback');

  const schema = string().url('Ссылка должна быть валидным URL').notOneOf([state.feeds], 'RSS уже существует');
  const validate = (input) => schema.validate(input, { abortEarly: false });

  const watchedState = onChange(state, (path, value) => {
    if (path === 'error') {
      if (value.length) {
        field.classList.add('is-invalid');
        feedback.textContent = value[0].message;
      } else {
        field.classList.remove('is-invalid');
        feedback.textContent = '';
        form.reset();
        field.focus();
      }
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    validate(field.value)
      .then((link) => {
        state.feeds.push(link);
        watchedState.error = [];
      })
      .catch((error) => {
        watchedState.error = error.inner;
      });
  });
};
