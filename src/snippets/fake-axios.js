// import * as _ from 'lodash';

const fakeUrls = {
  ya: 'https://yandex.ru',
  ho: 'https://hoohle.xyz',
  rss1: 'https://ru.hexlet.io/lessons.rss',
  rss2: 'http://www.edu.ru/news/it-v-obrazovanii/feed.rss',
};

// const fakeRequest = (url) => new Promise((resolve, reject) => setTimeout(() => {
//   if (url === fakeUrls.ho) {
//     reject({ error: 404 });
//   }
//   resolve({
//     data: {
//       name: `some real name ${_.uniqueId()}`,
//       posts: [
//         { name: 'sdjkhs hsda jsdhajsd ash jdhasd djsh asjdhas jdlh asldkjhd ajshd jlaksjhdajs hdalksdh akjsdhasj dashdb ashd basdhk bahskd bas hadskb asdh a', description: 'Q W E', url: 'https://qwe.qwe' },
//         { name: 'rty', description: 'R T Y', url: 'https://rty.rty' },
//         { name: 'uio', description: 'U I O', url: 'https://uio.uio' },
//         { name: 'asd', description: 'A S D', url: 'https://asd.asd' },
//         { name: 'fgh', description: 'F G H', url: 'https://fgh.fgh' },
//         { name: 'jkl', description: 'J K L', url: 'https://jkl.jkl' },
//         { name: 'zxc', description: 'Z X C', url: 'https://zxc.zxc' },
//       ],
//     },
//   });
// }, 500));
const fakeRequest = () => {};

export {
  fakeUrls,
  fakeRequest,
};
