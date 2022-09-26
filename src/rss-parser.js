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

export default parseRss;
