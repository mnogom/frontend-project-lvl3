import onChange  from "on-change";
import * as yup from 'yup';

const appStates = {
  filling: 'filling',
  submitted: 'submitted',
  failedValidation: 'failed-validation',
  requested: 'requested',
  recievedResponse: 'recieved-response',
  recievedError: 'recieved-error',
}

const rssShema = yup.string().required().email();

function View() {
  this.setController = (controller) => this.controller = controller;

  this.render = (path, value) => {};
}

function Model(config = {}) {
  this.setView = (view) => this.view = view;

  this.sendToRender = (path, value) => console.log(path, value);

  this.state = onChange({
    feeds: [],
    posts: [],
    ...config,
    appState: appStates.filling,
    form: {
      fields: {
        rssUrl: {
          value: '',
          isValid: true,
          errors: [],
        },
      },
    },
  }, this.sendToRender);

  this.setAppState = (newAppState) => this.state.appState = newAppState;
  this.setRssUrl = (rssUrl) => this.state.form.fields.rssUrl.value = rssUrl;
  this.getRssUrl = () => this.state.form.fields.rssUrl.value;
}

function Controller() {
  this.setModel = (model) => this.model = model;

  this.handleValidate = (rssUrl) => {
    this.model.setAppState(appStates.submitted);
    this.model.setRssUrl(rssUrl);
    console.log(this.model.getRssUrl());

    rssShema.isValid(this.model.state.form.fields.rssUrl.value).then(console.log).catch(console.log)
  };
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
    controller.handleValidate(rssUrl);
  });

  const dbgBtn = document.createElement('button');
  dbgBtn.textContent = 'dbg';
  dbgBtn.addEventListener('click', () => console.log(model.state.appState));
  document.body.append(dbgBtn);
}

export default app;
