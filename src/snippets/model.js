import * as _ from 'lodash';
import onChange  from "on-change";
import appStates from './app-states.js';

function Model() {
  this.setView = (view) => this.view = view;
  this.getView = () => {
    if (this.view) {
      return this.view;
    }
    throw Error ('View is not defined');
  }

  const sendToStateRender = (_path, value) => this.getView().renderState(_path, value);
  this.appState = onChange({
    state: appStates.filling,
  }, sendToStateRender);

  this.setAppState = (newAppState) => this.appState.state = newAppState;

  const sendToDataRended = (path, value) => this.getView().renderData(path, value);
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

  const sendToFormRender = (path, value) => this.getView().renderForm(path, value);
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

export default Model;