import onChange from 'on-change';
import {
  feedback, feeds, posts, formInteraction, renderFeedback, renderInvalidFeedback,
  renderValidFeedback, renderCardTitle, renderNewFeed, renderNewPosts, renderModal,
  highlightVisitedLink, renderTexts, changeLang,
} from './renders.js';

export default (state) => {
  const watchedState = onChange(state, (path, value, prevValue) => {
    if (path === 'formLocking') {
      formInteraction(value);
    }

    if (path === 'feedback') {
      feedback.textContent = renderFeedback(state.i18n, value);
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
