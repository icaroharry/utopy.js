const steem = require('steem');
const request = require('request-promise');

// const categories = ['ideas', 'sub-projects', 'development', 'bug-hunting',
//   'translations', 'graphics', 'analysis', 'social', 'tutorials', 'video-tutorials', 'copywriting'];

const limit = 20;
const skip = 0;
const section = 'all';
const sortBy = 'created';
const filterBy = 'any';
const type = 'all';

const delay = 20000;
const wait = 30;
const categories = []; //['development', 'sub-projects', 'social'];

const alreadyVoted = [];

function vote(post) {
  steem.broadcast.vote(process.env.POSTING_KEY, process.env.ACCOUNT, post.author, post.permlink, 100, (err, result) => {
    if(err) {
      console.log('ERROR!')
      console.log(err);
    } else {
      console.log('Voted ' + post.permlink);
      console.log(result);
    }
  });
  alreadyVoted.push(post.permlink);
}

async function run() {
  const posts = JSON.parse(
    await request.get(`https://api.utopian.io/api/posts/?limit=${limit}&skip=${skip}&section=${section}&sortBy=${sortBy}&filterBy=${filterBy}&type=${type}`)
  );

  posts.results.forEach(post => {
    if(Date.now() >= new Date(post.created).getTime() + (wait * 1000 * 60)) {
      if(categories.includes(post.json_metadata.type) || categories.length === 0) {
        if(post.author !== process.env.ACCOUNT) {
          if(!alreadyVoted.includes(post.permlink)) {
            vote(post);
          }
        }
      }
    }
  });

  setInterval(() => {
    run();
  }, delay);
}

run();
