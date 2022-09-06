import appStates from './app-states.js';

function View() {
  const elements = {
    formEl: document.querySelector('form'),
    postsContainer: document.getElementById('posts'),
    feedsContainer: document.getElementById('feeds'),
    requestButtonEl: document.getElementById('requestButton'),
    rssFloatEl: document.querySelector('[data-input-target="#rssUrlInput"]'),
    rssInputEl: document.getElementById('rssUrlInput'),
    rssErrorEl: document.getElementById('errorMessage'),
  };

  this.setController = (controller) => {
    this.controller = controller;
  };

  this.getController = () => {
    if (this.controller) {
      return this.controller;
    }
    throw Error('Controller is not defined');
  };

  this.renderForm = (path, value) => {
    switch (path) {
      case 'form.fields.rssUrl.errors':
        const errors = value;

        if (errors.length === 0) {
          elements.rssFloatEl.classList.remove('is-invalid');
          elements.rssInputEl.classList.remove('is-invalid');
          elements.rssErrorEl.textContent = '';
        } else {
          elements.rssFloatEl.classList.add('is-invalid');
          elements.rssInputEl.classList.add('is-invalid');
          elements.rssErrorEl.textContent = errors.join(', ');
        }
        break;
      default:
        break;
    }
  };

  this.renderState = (_path, value) => {
    const state = value;
    switch (state) {
      case appStates.filling:
      case appStates.failedValidation:
      case appStates.recievedError:
        elements.requestButtonEl.disabled = false;
        return;
      case appStates.submitted:
      case appStates.requestedFeed:
        elements.requestButtonEl.disabled = true;
        return;
      case appStates.recievedResponse:
        elements.requestButtonEl.disabled = false;
        elements.formEl.reset();
        return;
      default:
        throw Error(`Unknown state '${state}'`);
    }
  };

  this.renderData = (path, value) => {
    switch (path) {
      case 'feeds':
        const feeds = value;
        elements.feedsContainer.innerHTML = null;
        const feedsList = document.createElement('ul');
        feeds.forEach(({ id, name }) => {
          const li = document.createElement('li');
          li.id = `feed-${id}`;
          li.textContent = name;
          feedsList.append(li);
        });
        elements.feedsContainer.append(feedsList);
        return;
      case 'posts':
        const posts = value;
        elements.postsContainer.innerHTML = null;
        const postsList = document.createElement('ul');
        posts.forEach(({ name, description, id, feedId }) => {
          const li = document.createElement('li');
          const span = document.createElement('span');
          span.id = `post-${id}`;
          span.dataset.feedId = feedId;
          span.textContent = name;
          const button = document.createElement('button');
          button.classList.add('btn', 'btn-sm', 'btn-outline-primary');
          button.textContent = 'Preview';
          button.dataset.bsToggle = 'modal';
          button.dataset.bsTarget = '#postPreview';
          button.dataset.bsTitle = name;
          button.dataset.bsDescription = description;
          li.append(span, button)
          postsList.append(li);
        });
        elements.postsContainer.append(postsList);
        return;
      default:
        throw Error(`Unknown path '${path}'`);
    }
  };
}

export default View;
