import appStates from './app-states.js';

function View() {
  const elements = {
    formEl: document.querySelector('form'),
    postsContainer: document.getElementById('posts'),
    feedsContainer: document.getElementById('feeds'),
    requestButtonEl: document.getElementById('requestButton'),
    rssFloatEl: document.querySelector('[data-input-target="#rssUrlInput"]'),
    rssInputEl: document.getElementById('rssUrlInput'),
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
          const errorDiv = elements.rssFloatEl.nextElementSibling;
          if (errorDiv) {
            errorDiv.remove();
          }
        } else {
          elements.rssFloatEl.classList.add('is-invalid');
          elements.rssInputEl.classList.add('is-invalid');
          const errorDiv = document.createElement('div');
          errorDiv.classList.add('invalid-feedback');
          errorDiv.textContent = errors.join(', ');
          elements.rssFloatEl.after(errorDiv);
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

  const createUlElement = (items) => {
    const listEl = document.createElement('ul');
    items.forEach(({ name }) => {
      const el = document.createElement('li');
      el.textContent = name;
      listEl.append(el);
    });
    return listEl;
  };

  this.renderData = (path, value) => {
    switch (path) {
      case 'feeds':
        const feeds = value;
        elements.feedsContainer.innerHTML = null;
        const feedsList = document.createElement('ul');
        feeds.forEach(({ id, name }) => {
          const el = document.createElement('li');
          el.id = `feed-${id}`;
          el.textContent = name;
          feedsList.append(el);
        })
        elements.feedsContainer.append(feedsList);
        return;
      case 'posts':
        const posts = value;
        elements.postsContainer.innerHTML = null;
        const postsList = document.createElement('ul');
        posts.forEach(({ name, id, feedId }) => {
          const el = document.createElement('li');
          el.id = `post-${id}`;
          el.dataset.feedId = feedId;
          el.textContent = name;
          el.addEventListener('click', (event) => {
            const postId = event.target.id.replace('post-', '')
            this.getController().handleShowPost(postId);
          })
          postsList.append(el);
        });
        elements.postsContainer.append(postsList);
        return;
      default:
        throw Error(`Unknown path '${path}'`);
    }
  };
}

export default View;
