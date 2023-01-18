import onChange from 'on-change';

const form = document.querySelector('.rss-form');
const inputField = form.querySelector('input');
const btnSubmit = form.querySelector('button');
const feedback = document.querySelector('.feedback');
const feeds = document.querySelector('.feeds');
const posts = document.querySelector('.posts');

const showFeedback = (i18n, text) => i18n.t(text);

const formInteraction = (status) => {
  if (status) {
    inputField.disabled = true;
    btnSubmit.disabled = true;
  } else {
    inputField.disabled = false;
    btnSubmit.disabled = false;
  }
};

const highlightFeedback = (color) => {
  if (color === 'danger') {
    inputField.classList.add('is-invalid');
  } else {
    inputField.classList.remove('is-invalid');
  }

  feedback.classList.forEach((name) => {
    if (name.substring(0, 5) === 'text-') {
      feedback.classList.remove(name);
    }
  });

  feedback.classList.add(`text-${color}`);
};

const renderCardTitle = (title, block, i18n) => {
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
  form.reset();
  inputField.focus();
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

const renderNewPosts = (visitedLinksIds, newPosts, i18n) => {
  const listGroup = posts.querySelector('.list-group');
  listGroup.innerHTML = '';

  const listGroupItems = newPosts.map((post) => {
    const { id, link, title } = post;
    const listGroupItem = document.createElement('li');
    listGroupItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.className = visitedLinksIds.has(id) ? 'fw-normal link-secondary' : 'fw-bold';
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

const renderModal = (id, statePosts) => {
  const post = statePosts.find((statePost) => statePost.id === id);
  const modalTitle = document.querySelector('.modal-title');
  modalTitle.textContent = post.title;
  const modalBody = document.querySelector('.modal-body');
  modalBody.textContent = post.description;
  const readBtn = document.querySelector('.full-article');
  readBtn.setAttribute('href', post.link);
};

const highlightVisitedLink = (id) => {
  const link = document.querySelector(`a[data-id="${id}"]`);
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal', 'link-secondary');
};

const renderTexts = (i18n, fb) => {
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

const changeLang = (oldLang, newLang, i18n) => {
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

export default (state) => {
  const watchedState = onChange(state, (path, value, prevValue) => {
    if (path === 'formLocking') {
      formInteraction(value);
    }

    if (path === 'feedback') {
      feedback.textContent = showFeedback(state.i18n, value);
    }

    if (path === 'highlightFeedback') {
      highlightFeedback(value);
    }

    if (path === 'feeds') {
      if (value.length === 1) {
        renderCardTitle('feeds', feeds, state.i18n);
        renderCardTitle('posts', posts, state.i18n);
      }

      const feed = value.at(-1);
      renderNewFeed(feed);
    }

    if (path === 'posts') {
      const { visitedLinksIds } = state.uiState;
      renderNewPosts(visitedLinksIds, value, state.i18n);
    }

    if (path === 'uiState.visitedLinksIds') {
      highlightVisitedLink([...value].at(-1));
    }

    if (path === 'uiState.modal.postId') {
      renderModal(value, state.posts);
    }

    if (path === 'lang') {
      changeLang(prevValue, value, state.i18n);
      renderTexts(state.i18n, state.feedback);
    }
  });

  return watchedState;
};

export {
  form, inputField, posts, renderTexts,
};
