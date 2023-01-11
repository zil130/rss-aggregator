import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index.js';

const i18n = i18next.createInstance();
i18n.init({
  lng: 'ru',
  resources,
});

const form = document.querySelector('.rss-form');
const inputField = form.querySelector('input');
const btnSubmit = form.querySelector('button');
inputField.focus();
const feedback = document.querySelector('.feedback');
const feeds = document.querySelector('.feeds');
const posts = document.querySelector('.posts');

const formInteraction = (status) => {
  if (status) {
    inputField.disabled = true;
    btnSubmit.disabled = true;
    inputField.classList.remove('is-invalid');
    feedback.classList.remove('text-danger', 'text-success');
    feedback.classList.add('text-warning');
  } else {
    inputField.disabled = false;
    btnSubmit.disabled = false;
  }
};

const renderInvalidFeedback = () => {
  inputField.classList.add('is-invalid');
  feedback.classList.remove('text-success', 'text-warning');
  feedback.classList.add('text-danger');
};

const renderValidFeedback = () => {
  inputField.classList.remove('is-invalid');
  feedback.classList.remove('text-danger', 'text-warning');
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

const renderNewPosts = (visitedLinks, newPosts) => {
  const listGroup = posts.querySelector('.list-group');
  listGroup.innerHTML = '';

  const listGroupItems = newPosts.map((post) => {
    const { id, link, title } = post;
    const listGroupItem = document.createElement('li');
    listGroupItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.className = visitedLinks.includes(id) ? 'fw-normal link-secondary' : 'fw-bold';
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

const renderModal = (visitedLinks, statePosts) => {
  const btns = document.querySelectorAll('[data-bs-target="#modal"]');

  btns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const { id } = btn.dataset;
      const post = statePosts.find((statePost) => statePost.id === id);
      const a = document.querySelector(`a[data-id="${id}"]`);
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal', 'link-secondary');
      const modalTitle = document.querySelector('.modal-title');
      modalTitle.textContent = post.title;
      const modalBody = document.querySelector('.modal-body');
      modalBody.textContent = post.description;
      const readBtn = document.querySelector('.full-article');
      readBtn.setAttribute('href', post.link);

      if (!visitedLinks.includes(id)) {
        visitedLinks.push(id);
      }
    });
  });
};

const changeVisitedLinks = (visitedLinks) => {
  const postsList = document.querySelector('.posts');
  const links = postsList.querySelectorAll('a');

  links.forEach((link) => {
    link.addEventListener('click', () => {
      const { id } = link.dataset;
      link.classList.remove('fw-bold');
      link.classList.add('fw-normal', 'link-secondary');

      if (!visitedLinks.includes(id)) {
        visitedLinks.push(id);
      }
    });
  });
};

const renderTexts = (fb) => {
  document.querySelector('h1.title').textContent = i18n.t('title');
  document.querySelector('p.description').textContent = i18n.t('description');
  document.querySelector('label[for="url-input"]').textContent = i18n.t('placeholder');
  document.querySelector('p.example').textContent = i18n.t('example');
  document.querySelector('button.btn-add').textContent = i18n.t('btnAdd');
  document.querySelector('a.full-article').textContent = i18n.t('modal.readMore');
  document.querySelector('.modal-footer > button.close').textContent = i18n.t('modal.close');
  document.querySelector('.feedback').textContent = i18n.t(fb);
  if (document.querySelector('.feeds h2')) {
    document.querySelector('.feeds h2').textContent = i18n.t('feeds');
  }
  if (document.querySelector('.posts h2')) {
    document.querySelector('.posts h2').textContent = i18n.t('posts');
  }
  if (document.querySelectorAll('.posts button')) {
    document.querySelectorAll('.posts button').forEach((btn) => {
      btn.textContent = i18n.t('view');
    });
  }
};

const changeLang = (oldLang, newLang) => {
  const dropdownMenuButton = document.querySelector('#dropdownMenuButton1');
  dropdownMenuButton.textContent = newLang;
  const target = document.querySelector(`#${newLang}`);
  target.classList.add('disabled');
  target.setAttribute('tabindex', '-1');
  target.setAttribute('aria-disabled', 'true');
  const prevTarget = document.querySelector(`#${oldLang}`);
  prevTarget.classList.remove('disabled');
  prevTarget.removeAttribute('tabindex');
  prevTarget.removeAttribute('aria-disabled');

  i18n.changeLanguage(newLang);
};

const watcher = (state) => {
  const watchedState = onChange(state, (path, value, prevValue) => {
    if (path === 'formLocking') {
      formInteraction(value);
    }

    if (path === 'feedback') {
      feedback.textContent = i18n.t(value);
    }

    if (path === 'rssUploaded') {
      if (value[0]) {
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
      const { visitedLinks } = state.uiState;
      renderNewPosts(visitedLinks, value);
      renderModal(visitedLinks, value);
      changeVisitedLinks(visitedLinks);
    }

    if (path === 'lang') {
      changeLang(prevValue, value);
      renderTexts(state.feedback);
    }
  });

  return watchedState;
};

renderTexts();

export {
  form, inputField, watcher,
};
