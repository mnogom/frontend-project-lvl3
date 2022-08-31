import * as _ from 'lodash';

const fakeUrls = {
  ya: 'https://yandex.ru',
  ho: 'https://hoohle.xyz',
};

const fakeRequest = (url) => new Promise((resolve, reject) => setTimeout(() => {
  if (url === fakeUrls.ho) {
    reject({ error: 404 });
  }
  resolve({
    data: {
      name: `some real name ${_.uniqueId()}`,
      feeds: [
        { name: 'qwe', description: 'Q W E' },
        { name: 'rty', description: 'R T Y' },
        { name: 'uio', description: 'U I O' },
        { name: 'asd', description: 'A S D' },
        { name: 'fgh', description: 'F G H' },
        { name: 'jkl', description: 'J K L' },
        { name: 'zxc', description: 'Z X C' },
      ],
    },
  });
}, 500));

export {
  fakeUrls,
  fakeRequest,
};
