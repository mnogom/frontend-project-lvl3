import axios from 'axios';
import _ from 'lodash';

const parseRss = (rawData) => {
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
  return { title: feedTitle, description: feedDescription, posts };
};

const getRssData = (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`;
  return axios.get(proxyUrl)
    .then((response) => {
      const feedData = parseRss(response.data.contents);

      const feed = {
        id: _.uniqueId(),
        title: feedData.title,
        description: feedData.description,
        link: url,
      };

      const posts = feedData.posts.map(({ title, description, link }) => (
          {
            id: _.uniqueId(),
            feedId: feed.id,
            title,
            description,
            link,
          }
      ));

      return { feed, posts }
    })
    .catch((error) => {
      throw error;
    });
};

export default getRssData;
