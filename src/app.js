import onChange from 'on-change';

import * as yup from 'yup';
import _ from 'lodash';
import appStates from './app-states.js';
import getRssData from './utils/rss-client.js';
import { fakeUrls } from './snippets/fake-axios.js';
import { isPostInList } from './utils/comparator.js';


const getRssSheme = (existingUrls) => {
  const rssShema = yup.string()
    .required('You forget...')
    .url('Must be url')
    .notOneOf(existingUrls, 'Already added');
  return rssShema;
};

const elements = {
  formEl: document.querySelector('form'),
  postsContainer: document.getElementById('posts'),
  feedsContainer: document.getElementById('feeds'),
  requestButtonEl: document.getElementById('requestButton'),
  rssFloatEl: document.querySelector('[data-input-target="#rssUrlInput"]'),
  rssInputEl: document.getElementById('rssUrlInput'),
  rssErrorEl: document.getElementById('errorMessage'),
  modalPostPreviewTitle: document.querySelector('#modalPostPreview .modal-title'),
  modalPostPreviewBody: document.querySelector('#modalPostPreview .modal-body p'),
  modalPostGoTo: document.querySelector('#modalPostPreview a'),
};

const app = () => {
  const state = onChange(
    {
      appState: appStates.filling,
      data: {
        feeds: [],
        posts: [],
        viewedPosts: [],
        activePost: null,
      },
      formState: {
        rssUrl: {
          value: '',
          error: '',
        },
      },
    },
    (path, value) => {
      switch (path) {
        case 'appState':
          switch (value) {
            case appStates.submitted:
            case appStates.requestedFeed:
              elements.requestButtonEl.disabled = true;
              elements.rssInputEl.focus();
              break;
            case appStates.failedValidation:
            case appStates.recievedResponse:
            case appStates.recievedError:
              elements.requestButtonEl.disabled = false;
              break;
            default:
              break;
          }
          return;

        case 'data.feeds':
          {
            elements.feedsContainer.innerHTML = null;
            const feedsUl = document.createElement('ul');
            state.data.feeds.forEach(({ title, description }) => {
              const feedLi = document.createElement('li');
              const feedH3 = document.createElement('h5');
              feedH3.textContent = title;
              const feedSpan = document.createElement('span');
              feedSpan.classList.add('text-muted');
              feedSpan.textContent = description;
              feedLi.append(feedH3, feedSpan);
              feedsUl.append(feedLi);
            });
            elements.feedsContainer.append(feedsUl);
          }
          break;

        case 'data.viewedPosts':
        case 'data.posts':
          {
            elements.postsContainer.innerHTML = null;
            const postsUl = document.createElement('ul');
            state.data.posts.forEach(({ id, title, link }) => {
              const postLi = document.createElement('li');
              postLi.classList.add('d-flex', 'justify-content-between', 'mt-2');

              const postA = document.createElement('a');
              postA.textContent = title;
              postA.href = link;
              postA.target = '_blank';
              postA.dataset.postId = id;

              const readButton = document.createElement('button');
              readButton.textContent = 'Preview';
              readButton.dataset.bsToggle = 'modal';
              readButton.dataset.bsTarget = '#modalPostPreview';
              readButton.dataset.postId = id;

              if (state.data.viewedPosts.includes(id)) {
                postA.classList.add('link-secondary');
                readButton.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'ms-2');
              } else {
                postA.classList.add('link-primary');
                readButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'ms-2');
              }

              [postA, readButton].forEach((el) => {
                el.addEventListener(
                  'click',
                  (event) => {
                    state.data.viewedPosts = _.union(state.data.viewedPosts, [event.target.dataset.postId]);
                  }
                );
              });

              readButton.addEventListener(
                'click',
                (event) => {
                  state.data.activePost = state.data.posts.find(({ id }) => id === event.target.dataset.postId);
                },
              );

              postLi.append(postA, readButton);
              postsUl.append(postLi);
            });
            elements.postsContainer.append(postsUl);
          }
          break;

        case 'data.activePost':
          elements.modalPostPreviewTitle.textContent = state.data.activePost.title;
          elements.modalPostPreviewBody.textContent = state.data.activePost.description;
          elements.modalPostGoTo.href = state.data.activePost.link;
          break;

        case 'formState.rssUrl.error':
          if (value === '') {
            elements.rssFloatEl.classList.remove('is-invalid');
            elements.rssInputEl.classList.remove('is-invalid');
            elements.rssErrorEl.textContent = '';
          } else {
            elements.rssFloatEl.classList.add('is-invalid');
            elements.rssInputEl.classList.add('is-invalid');
            elements.rssErrorEl.textContent = value;
          }
          break;

        default:
          break;
      }
    },
  );

  const form = elements.formEl;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    state.appState = appStates.submitted;

    state.formState.rssUrl.error = '';
    const formData = new FormData(event.target);
    const rssUrl = formData.get('rssUrl');
    const rssShema = getRssSheme(state.data.feeds.map(({ link }) => link));

    rssShema.validate(rssUrl)
      .then(() => {
        state.appState = appStates.requestedFeed;
        getRssData(rssUrl).then((feed) => {
          const newFeed = { ...feed, id: _.uniqueId() };
          state.data.feeds.push(newFeed);
          feed.posts.forEach((post) => state.data.posts.push({ ...post, id: _.uniqueId(), feedId: newFeed.id }));
          form.reset();
          state.appState = appStates.recievedResponse;
        });
      })
      .catch((error) => {
        state.appState = state.recivedError;
        state.formState.rssUrl.error = error.message;
      });
  });

  const autoUpdate = () => {
    setTimeout(() => {
      if (state.data.feeds.length !== 0) {
        state.data.feeds.forEach(({ id: feedId, link }) => {
          console.log(state.data.feeds)
          getRssData(link).then(({ posts }) => {
            const newPosts = [];
            posts.forEach((post) => {
              if (!isPostInList(post, state.data.posts)) {
                newPosts.push({ ...post, id: _.uniqueId(), feedId });
              }
            });
            state.data.posts.push(...newPosts);
          }).catch(console.log);
        })
      }
      autoUpdate();
    }, 5000)
  };
  autoUpdate();

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
