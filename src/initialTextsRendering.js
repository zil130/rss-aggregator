export default (i18n) => {
  document.querySelector('h1.title').textContent = i18n.t('initialRendering.title');
  document.querySelector('p.description').textContent = i18n.t('initialRendering.description');
  document.querySelector('label[for="url-input"]').textContent = i18n.t('initialRendering.placeholder');
  document.querySelector('p.example').textContent = i18n.t('initialRendering.example');
  document.querySelector('button.btn-add').textContent = i18n.t('initialRendering.btnAdd');
  document.querySelector('a.full-article').textContent = i18n.t('initialRendering.modalRendering.readMore');
  document.querySelector('.modal-footer > button.close').textContent = i18n.t('initialRendering.modalRendering.close');
};
