import onChange from 'on-change';

import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import appStates from './app-states.js';
import { fakeUrls } from './snippets/fake-axios.js';
import parseRss from './rss-parser.js';

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
            case appStates.recievedResponse:
              elements.requestButtonEl.disabled = true;
              elements.rssInputEl.focus();
              break;
            case appStates.failedValidation:
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
            value.forEach(({ title, description }) => {
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

        case 'data.posts':
          {
            elements.postsContainer.innerHTML = null;
            const postsUl = document.createElement('ul');
            value.forEach(({ id, title, link }) => {
              const postLi = document.createElement('li');
              postLi.classList.add('d-flex', 'justify-content-between', 'mt-2');

              const postA = document.createElement('a');
              postA.classList.add('link-primary');
              postA.textContent = title;
              postA.href = link;
              postA.target = '_blank';
              postA.dataset.postId = id;

              const readButton = document.createElement('button');
              readButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'ms-2');
              readButton.textContent = 'Preview';
              readButton.dataset.bsToggle = 'modal';
              readButton.dataset.bsTarget = '#modalPostPreview';
              readButton.dataset.postId = id;

              [postA, readButton].forEach((el) => {
                el.addEventListener(
                  'click',
                  () => { state.data.posts.find(({ id: postId }) => postId === id).readed = true; },
                );
              });

              readButton.addEventListener(
                'click',
                () => {
                  state.data.posts.find(({ id: postId }) => postId === id).previewed = true;
                },
              );

              postLi.append(postA, readButton);
              postsUl.append(postLi);
            });
            elements.postsContainer.append(postsUl);
          }
          break;

        case path.match(/data.posts.[0-9]*.readed/)?.input:
          {
            const index = parseInt(path.slice(11, -7), 10);
            const { id } = state.data.posts[index];
            document.querySelector(`a[data-post-id="${id}"]`).classList.add('link-secondary');
            document.querySelector(`button[data-post-id="${id}"]`).classList.remove('btn-outline-primary');
            document.querySelector(`button[data-post-id="${id}"]`).classList.add('btn-outline-secondary');
          }
          break;

        case path.match(/data.posts.[0-9]*.previewed/)?.input:
          {
            const index = parseInt(path.slice(11, -7), 10);
            const post = state.data.posts[index];
            elements.modalPostPreviewTitle.textContent = post.title;
            elements.modalPostPreviewBody.textContent = post.description;
            elements.modalPostGoTo.href = post.link;
          }
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

  const form = document.querySelector('form');
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
        const url = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(rssUrl)}`;
        axios.get(url)
          .then((response) => {
            const feedData = parseRss(response.data.contents);

            const feedId = _.uniqueId();
            state.data.feeds.push({
              id: feedId,
              title: feedData.title,
              description: feedData.description,
              link: rssUrl,
            });

            state.data.posts.push(
              ...feedData.posts.map(({ title, description, link }) => (
                {
                  id: _.uniqueId(),
                  feedId,
                  title,
                  description,
                  link,
                  readed: false,
                  previewed: false,
                }
              )),
            );

            form.reset();
            state.appState = appStates.recievedResponse;
          })
          .catch((error) => {
            console.log(error);
            state.appState = appStates.recievedError;
            state.formState.rssUrl.error = 'Invalid response';
          });
      })
      .catch((error) => {
        state.appState = state.recivedError;
        state.formState.rssUrl.error = error.message;
      });
  });

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
