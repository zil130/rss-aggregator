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

const renderNewFeed = (xmlDocument) => {
  const listGroup = feeds.querySelector('.list-group');
  const listGroupItem = document.createElement('li');
  listGroupItem.classList.add('list-group-item', 'border-0', 'border-end-0');
  const title = document.createElement('h3');
  title.classList.add('h6', 'm-0');
  title.textContent = xmlDocument.querySelector('title').textContent;
  const description = document.createElement('p');
  description.classList.add('m-0', 'small', 'text-black-50');
  description.textContent = xmlDocument.querySelector('description').textContent;

  listGroup.prepend(listGroupItem);
  listGroupItem.append(title, description);
};

const renderPostsOfNewFeed = (xmlDocument) => {
  const listGroup = posts.querySelector('.list-group');
  const xmlDocumentItems = xmlDocument.querySelectorAll('item');

  const listGroupItems = Array.from(xmlDocumentItems).map((xmlDocumentItem) => {
    const listGroupItem = document.createElement('li');
    listGroupItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('href', xmlDocumentItem.querySelector('link').textContent);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = xmlDocumentItem.querySelector('title').textContent;
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.textContent = i18n.t('view');

    listGroupItem.append(link, button);

    return listGroupItem;
  });

  listGroup.prepend(...listGroupItems);
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
    }

    if (path === 'xmlDocument') {
      form.reset();
      inputField.focus();
      renderNewFeed(value);
      renderPostsOfNewFeed(value);
    }
  });

  return watchedState;
};

export { form, inputField, watcher };
