import onChange from 'on-change';

export const form = document.querySelector('.rss-form');
export const inputField = document.querySelector('[aria-label="url"]');
inputField.focus();
const feedback = document.querySelector('.feedback');

const renderInvalid = (value) => {
  inputField.classList.add('is-invalid');
  feedback.textContent = value;
};

const renderValid = () => {
  inputField.classList.remove('is-invalid');
  feedback.textContent = '';
  form.reset();
  inputField.focus();
};

export default (state) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'error') {
      if (value.length) {
        renderInvalid(value);
      } else {
        renderValid();
      }
    }
  });

  return watchedState;
};
