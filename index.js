const steem = require('steem');
const request = require('request-promise');

const limit = 3;
const skip = 0;
const section = ['tutorials', 'development'];
const sortBy = 'created';
const filterBy = 'any';
const type = 'all';

function run() {
  setInterval(async () => {
    const posts = JSON.parse(
      await request.get(`https://api.utopian.io/api/posts/?limit=${limit}&skip=${skip}&section=${section}&sortBy=${sortBy}&filterBy=${filterBy}&type=${type}`)
    );
    console.log(posts);
  }, 1000);
}

run()
// steem.broadcast.vote(process.env.POSTING_KEY, process.env.ACCOUNT, 'guifaquetti', 'who-am-i-quem-sou-eu', 50, function(err, result) {
//   console.log(err, result);
// });
