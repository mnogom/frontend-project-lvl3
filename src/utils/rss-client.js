import axios from 'axios';
import _ from 'lodash';

const parseRss = (rawData, feedUrl) => {
  const dom = new window.DOMParser().parseFromString(rawData, 'text/xml');
  const feedTitle = dom.querySelector('channel title').textContent;
  const feedDescription = dom.querySelector('channel description').textContent;
  const posts = [];
  dom.querySelectorAll('item').forEach((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    posts.push({ title: postTitle, description: postDescription, link });
  });
  return { link: feedUrl, title: feedTitle, description: feedDescription, posts };
};

const getRssData = (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`;
  return axios.get(proxyUrl)
    .then((response) => {
      const feed = parseRss(response.data.contents, url);
      return feed;
    })
    .catch((error) => {
      throw error;
    });
};

export default getRssData;
