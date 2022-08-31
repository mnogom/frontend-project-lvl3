import * as yup from 'yup';
import { fakeRequest } from './fake-axios.js';
import appStates from './app-states.js';

const getRssSheme = (existingFeeds) => {
  const existingUrls = existingFeeds.map(({ url }) => url);
  const rssShema = yup.string()
    .required('You forget...')
    .url('Must be url')
    .notOneOf(existingUrls, 'Already added');
  return rssShema;
};

function Controller() {
  this.setModel = (model) => {
    this.model = model;
  };

  this.getModel = () => {
    if (this.model) {
      return this.model;
    }
    throw Error('Model is not defined');
  };

  this.handleValidateRssUrl = (rssUrl) => {
    const rssField = 'rssUrl';

    this.getModel().dropErrors(rssField);
    this.getModel().setAppState(appStates.submitted);
    this.getModel().setFieldRssUrl(rssUrl);

    const rssShema = getRssSheme(this.getModel().getFeeds());
    rssShema.validate(this.getModel().getFieldRssUrl())
      .then(() => {
        this.getModel().setAppState(appStates.requestedFeed);
        this.handleRequest(rssUrl);
      })
      .catch((e) => {
        this.getModel().setAppState(appStates.failedValidation);
        this.getModel().addError(rssField, e.message);
      });
  };

  this.handleRequest = (url) => {
    fakeRequest(url)
      .then(({ data }) => {
        this.getModel().setAppState(appStates.recievedResponse);
        this.getModel().setFieldRssUrl('');

        const feed = this.getModel().addFeed(data.name, url);
        const postsToAdd = data.feeds.map(({ name, description }) => (
          { feedId: feed.id, name, description }
        ));
        this.getModel().addPosts(postsToAdd);
      })
      .catch(() => {
        this.getModel().setAppState(appStates.recievedError);
        this.getModel().addError('rssUrl', 'Invalid response');
      });
  };

  this.handleShowPost = (postId) => {
    // trigger show modal
    console.log(this.getModel().getPost(postId));
  };
}

export default Controller;
