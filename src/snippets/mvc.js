import onChange  from "on-change";
import * as yup from 'yup';
import * as _ from 'lodash';

const fakeUrl = {
  ya: 'https://yandex.ru',
  ho: 'https://hoohle.xyz',
};
const fakeRequest = (url) => new Promise((resolve, reject) => setTimeout(() => {
  if (url === fakeUrl.ya) {
    return resolve({
      data: {
        name: 'yandex',
        feeds: [
          {name: 'qwe', description: 'Q W E'},
          {name: 'rty', description: 'R T Y'},
          {name: 'uio', description: 'U I O'},
          {name: 'asd', description: 'A S D'},
          {name: 'fgh', description: 'F G H'},
          {name: 'jkl', description: 'J K L'},
          {name: 'zxc', description: 'Z X C'},
        ],
      }
    })
  }
  return reject({error: 404})
}, 2000));

const appStates = {
  filling: 'filling',
  submitted: 'submitted',
  failedValidation: 'failed-validation',
  requestedFeed: 'requested-feed',
  recievedResponse: 'recieved-response',
  recievedError: 'recieved-error',
}

const getRssSheme = (existingFeeds) => {
  const existingUrls = existingFeeds.map(({ url }) => url);
  const rssShema = yup.string()
    .required('You forget...')
    .url('Must be url')
    .notOneOf(existingUrls, 'Already added');
  return rssShema;
}

function View() {
  const elements = {
    formEl: document.querySelector('form'),
    postsContainer: document.getElementById('posts'),
    feedsContainer: document.getElementById('feeds'),
    requestButtonEl: document.getElementById('requestButton'),
    rssFloatEl: document.querySelector('[data-input-target="#rssUrlInput"]'),
    rssInputEl: document.getElementById('rssUrlInput'),
  }

  this.setController = (controller) => this.controller = controller;

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
          return;
        } else {
          elements.rssFloatEl.classList.add('is-invalid');
          elements.rssInputEl.classList.add('is-invalid');
          const errorDiv = document.createElement('div');
          errorDiv.classList.add('invalid-feedback');
          errorDiv.textContent = errors.join(', ');
          elements.rssFloatEl.after(errorDiv);
          return;
        }
      default:
        return;
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
        throw Error(`Unknown state '${state}'`)
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
  }

  this.renderData = (path, value) => {
    switch (path) {
      case 'feeds':
        const feeds = value;
        elements.feedsContainer.innerHTML = '';
        const feedsList = createUlElement(feeds);
        elements.feedsContainer.append(feedsList);
        return;
      case 'posts':
        const posts = value;
        elements.postsContainer.innerHTML = '';
        const postsList = createUlElement(posts);
        elements.postsContainer.append(postsList);
        return;
      default:
        throw Error(`Unknown path '${path}'`)
    }
  }
}

function Model() {
  this.setView = (view) => this.view = view;

  const sendToStateRender = (_path, value) => this.view ? this.view.renderState(_path, value) : () => {};
  this.appState = onChange({
    state: appStates.filling,
  }, sendToStateRender);

  this.setAppState = (newAppState) => this.appState.state = newAppState;

  const sendToDataRended = (path, value) => this.view ? this.view.renderData(path, value) : () => {};
  this.state = onChange({
    feeds: [],
    posts: [],
  }, sendToDataRended);

  this.getFeeds = () => this.state.feeds;
  this.addFeed = (name, url) => {
    const feed = {id: _.uniqueId(), name, url, active: false};
    this.state.feeds.push(feed);
    return feed;
  };
  this.addPosts = (listPosts) => {
    const posts = listPosts.map(({ name, description, feedId }) => {
      return { id: _.uniqueId(), name, description, feedId }
    })
    this.state.posts.push(...posts);
    return posts;
  };

  const sendToFormRender = (path, value) => this.view ? this.view.renderForm(path, value) : () => {};
  this.formState = onChange({
    form: {
      fields: {
        rssUrl: {
          value: '',
          isValid: true,
          errors: [],
        },
      },
    },
  }, sendToFormRender);


  this.setFormRssUrl = (rssUrl) => this.formState.form.fields.rssUrl.value = rssUrl;
  this.getFormRssUrl = () => this.formState.form.fields.rssUrl.value;
  this.addError = (field, message) => this.formState.form.fields[field].errors.push(message);
  this.dropErrors = (field) => this.formState.form.fields[field].errors = [];
}

function Controller() {
  this.setModel = (model) => this.model = model;

  this.handleValidateRssUrl = (rssUrl) => {
    const rssField = 'rssUrl';

    this.model.dropErrors(rssField);
    this.model.setAppState(appStates.submitted);
    this.model.setFormRssUrl(rssUrl);

    const rssShema = getRssSheme(this.model.getFeeds());
    rssShema.validate(this.model.getFormRssUrl())
      .then(() => {
        this.model.setAppState(appStates.requestedFeed);
        this.handleRequest(rssUrl)
      })
      .catch((e) => {
        this.model.setAppState(appStates.failedValidation);
        this.model.addError(rssField, e.message);
      })
  };

  this.handleRequest = (url) => {
    fakeRequest(url)
      .then(({ data }) => {
        this.model.setAppState(appStates.recievedResponse);
        const feed = this.model.addFeed(data.name, url);
        const postsToAdd = data.feeds.map(({ name, description }) => {
          return { feedId: feed.id, name, description}
        })
        this.model.addPosts(postsToAdd)
      })
      .catch(() => {
        this.model.setAppState(appStates.recievedError);
        this.model.addError('rssUrl', 'Invalid response');
      })
  }
}

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

  const yandex = document.createElement('button');
  yandex.textContent = 'ya';
  yandex.addEventListener('click', () => document.querySelector('#rssUrlInput').value = fakeUrl.ya);
  document.body.append(yandex);

  const hoohle = document.createElement('button');
  hoohle.textContent = 'ho';
  hoohle.addEventListener('click', () => document.querySelector('#rssUrlInput').value = fakeUrl.ho);
  document.body.append(hoohle);
}

export default app;
