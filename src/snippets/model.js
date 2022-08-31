import * as _ from 'lodash';
import onChange from 'on-change';
import appStates from './app-states.js';

function Model() {
  this.setView = (view) => {
    this.view = view;
  };

  this.getView = () => {
    if (this.view) {
      return this.view;
    }
    throw Error('View is not defined');
  };
  
  this.appState = onChange({
    state: appStates.filling,
  }, (_path, value) => this.getView().renderState(_path, value));

  this.setAppState = (newAppState) => {
    this.appState.state = newAppState;
  };
  
  this.data = onChange({
    feeds: [],
    posts: [],
  }, (path, value) => this.getView().renderData(path, value));

  this.getFeeds = () => this.data.feeds;
  
  this.addFeed = (name, url) => {
    const feed = {
      id: _.uniqueId(), name, url, active: false,
    };
    this.data.feeds.push(feed);
    return feed;
  };

  this.getPosts = () => this.data.posts;

  this.getPost = (postId) => this.getPosts().find(({ id }) => id === postId);
  
  this.addPosts = (listPosts) => {
    const posts = listPosts.map(({ name, description, feedId }) => ({
      id: _.uniqueId(), name, description, feedId,
    }));
    this.data.posts.push(...posts);
    return posts;
  };
  
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
  }, (path, value) => this.getView().renderForm(path, value));

  this.setFieldRssUrl = (rssUrl) => {
    this.formState.form.fields.rssUrl.value = rssUrl;
  };

  this.getFieldRssUrl = () => this.formState.form.fields.rssUrl.value;
  
  this.addError = (field, message) => {
    this.formState.form.fields[field].errors.push(message);
  };
  
  this.dropErrors = (field) => {
    this.formState.form.fields[field].errors = [];
  };
}

export default Model;
