import Model from './snippets/model.js';
import View from './snippets/view.js';
import Controller from './snippets/controller.js';
import { fakeUrls } from './snippets/fake-axios.js';

const app = () => {
  const model = new Model();
  const view = new View();
  const controller = new Controller();

  controller.setModel(model);
  model.setView(view);
  view.setController(controller);

  const form = document.querySelector('form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const rssUrl = formData.get('rssUrl');
    controller.handleValidateRssUrl(rssUrl);
  });

  const modal = document.getElementById('postPreview');
  modal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;
    const title = button.dataset.bsTitle;
    const description = button.dataset.bsDescription;

    document.querySelector('#postPreview .modal-title').textContent = title;
    document.querySelector('#postPreview .modal-body p').textContent = description;
  })

  // --- auto-fillers ---
  Object.entries(fakeUrls).forEach(([name, url]) => {
    const button = document.createElement('button');
    button.addEventListener('click', () => {
      document.querySelector('#rssUrlInput').value = url;
    });
    button.textContent = name;
    document.body.append(button);
  });
  // --------------------

  form.querySelector('input[name="rssUrl"]').focus();
};

export default app;
