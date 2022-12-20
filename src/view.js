import onChange from 'on-change';

export const form = document.querySelector('.rss-form');
export const field = document.querySelector('[aria-label="url"]');
field.focus();
const feedback = document.querySelector('.feedback');

const renderValid = (value) => {
  field.classList.add('is-invalid');
  feedback.textContent = value[0].message;
};

const renderInvalid = () => {
  field.classList.remove('is-invalid');
  feedback.textContent = '';
  form.reset();
  field.focus();
};

export default (state) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'error') {
      if (value.length) {
        renderValid(value);
      } else {
        renderInvalid();
      }
    }
  });

  return watchedState;
};
