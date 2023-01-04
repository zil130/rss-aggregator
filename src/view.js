import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index.js';

const i18n = i18next.createInstance();
i18n.init({
  lng: 'ru',
  resources,
});

const form = document.querySelector('.rss-form');
const inputField = document.querySelector('[aria-label="url"]');
inputField.focus();
const feedback = document.querySelector('.feedback');
const feeds = document.querySelector('.feeds');
const posts = document.querySelector('.posts');

const renderInvalidFeedback = () => {
  inputField.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
};

const renderValidFeedback = () => {
  inputField.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
};

const renderCardTitle = (title, block) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t(title);
  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  block.append(card);
  card.append(cardBody, listGroup);
  cardBody.append(cardTitle);
};

const renderNewFeed = (feed) => {
  const { title, description } = feed;
  const listGroup = feeds.querySelector('.list-group');
  const listGroupItem = document.createElement('li');
  listGroupItem.classList.add('list-group-item', 'border-0', 'border-end-0');
  const feedTitle = document.createElement('h3');
  feedTitle.classList.add('h6', 'm-0');
  feedTitle.textContent = title;
  const feedDescription = document.createElement('p');
  feedDescription.classList.add('m-0', 'small', 'text-black-50');
  feedDescription.textContent = description;

  listGroup.prepend(listGroupItem);
  listGroupItem.append(feedTitle, feedDescription);
};

const renderNewPosts = (newPosts) => {
  const listGroup = posts.querySelector('.list-group');
  listGroup.innerHTML = '';

  const listGroupItems = newPosts.map((post) => {
    const { id, link, title } = post;
    const listGroupItem = document.createElement('li');
    listGroupItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.setAttribute('href', link);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.dataset.id = id;
    a.textContent = title;
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.dataset.id = id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18n.t('view');

    listGroupItem.append(a, button);

    return listGroupItem;
  });

  listGroup.append(...listGroupItems);
};

const watcher = (state) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'feedback') {
      feedback.textContent = value;
    }

    if (path === 'rssUploaded') {
      if (value) {
        renderValidFeedback();
      } else {
        renderInvalidFeedback();
      }
    }

    if (path === 'feeds') {
      if (value.length === 1) {
        renderCardTitle('feeds', feeds);
        renderCardTitle('posts', posts);
      }

      const feed = value.at(-1);
      form.reset();
      inputField.focus();
      renderNewFeed(feed);
    }

    if (path === 'posts') {
      renderNewPosts(value);
    }
  });

  return watchedState;
};

export { form, inputField, watcher };
