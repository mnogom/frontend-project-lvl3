import onChange from "on-change";
import * as _ from 'lodash';

const appStates = {
  filling: 'filling',
  validating: 'validating',
  requested: 'requested',
  recievedResponse: 'recieved-response',
  recievedError: 'recieved-error',
}

const elements = {
  formEl: document.querySelector('form'),
  postsContainer: document.getElementById('posts'),
  feedsContainer: document.getElementById('feeds'),
  requestButtonEl: document.getElementById('requestButton'),
  rssInputEl: document.getElementById('rssUrlInput'),
}

const render = (appState, objectName) => {

}

const processHandle = (path, value) => {
  switch (path === '') {
    case appStates.filling:
      return;
    case appStates.validating:
      return;
    case appStates.requested:
      return;
    case appStates.recievedResponse:
      return;
    case appStates.recievedError:
      return;
    default:
      return;
  }
}

const app = (config = {}) => {

  const state = onChange({
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
  }, processHandle);

  const handlers = {
    handleSubmit: (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      state.form.fields.rssUrl.value = formData.get('rssUrl');
    },
  }

  const input = document.getElementById('rssUrlInput');
  input.focus();

  elements.formEl.addEventListener('submit', (event) => handlers.handleSubmit(event));

  document.querySelectorAll('[data-type="rssUrlExample"]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      elements.rssInputEl.value = event.target.textContent.trim();
    })
  });
};

export default app;


// const renderPosts = (posts) => {
//   if (posts.length === 0) {
//     return;
//   }
  
//   const postsHeader = document.createElement('h1');
//   postsHeader.textContent = 'Posts'
//   elements.postsContainer.append(postsHeader);

//   const postsList = document.createElement('ul');
//   posts.forEach(({ name }) => {
//     const postEl = document.createElement('li');
//     postEl.textContent = name;
//     postsList.append(postEl);
//   });
//   elements.postsContainer.append(postsList);
// };

// const renderFeeds = (feeds) => {
//   if (feeds.length === 0) {
//     return;
//   }
  
//   const feedsHeader = document.createElement('h1');
//   feedsHeader.textContent = 'Feeds';
//   elements.feedsContainer.append(feedsHeader);

//   const postsList = document.createElement('ul');
//   posts.forEach(({ name }) => {
//     const postEl = document.createElement('li');
//     postEl.textContent = name;
//     postsList.append(postEl);
//   });
//   elements.postsContainer.append(postsList);
// }

// switch (objectName) {
//   case 'posts':
//     renderPosts(appState.posts);
//     break;
//   case 'feeds':
//     renderFeeds(appState.feeds);
//     break;
//   default:
//     break;
// }