const steem = require('steem');
const request = require('request');

request({
  method: 'GET',
  uri: 'https://api.utopian.io/api/posts/?limit=1&skip=0&section=all&sortBy=created&filterBy=any&type=all'
}, (error, response, body) => {
  console.log(JSON.parse(body));
});

// steem.broadcast.vote(process.env.POSTING_KEY, process.env.ACCOUNT, 'guifaquetti', 'who-am-i-quem-sou-eu', 50, function(err, result) {
//   console.log(err, result);
// });
