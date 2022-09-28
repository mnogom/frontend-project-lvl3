const isEqualPosts = (post1, post2, fields = ['title', 'description', 'link']) => {
  for (const field of fields) {
    if (post1[field] !== post2[field]) {
      return false;
    }
  }
  return true;
};

const isPostInList = (post, postList, fields) => {
  for (const currentPost of postList) {
    if (isEqualPosts(post, currentPost, fields)) {
      return true;
    }
  }
  return false;
};

export {
  isPostInList,
};
