const steem = require('steem');
const request = require('request-promise');
const MongoClient = require('mongodb').MongoClient;

const mongoUrl = 'mongodb://127.0.0.1:27017/utopy';

// const categories = ['ideas', 'sub-projects', 'development', 'bug-hunting',
//   'translations', 'graphics', 'analysis', 'social', 'tutorials', 'video-tutorials', 'copywriting'];

const limit = process.env.LIMIT || 40;
const skip = process.env.SKIP || 0;
const section = process.env.SECTION || 'all';
const sortBy = process.env.SORT_BY || 'created';
const filterBy = process.env.FILTER_BY ||'any';
const type = process.env.TYPE || 'all';

const delay = process.env.DELAY || 60000 * 60;
const wait = process.env.WAIT || 30;
const categories = process.env.CATEGORIES || [];

let lastVote = Date.now();
let voteDelay = 0;

async function saveVote(permlink) {
  try {
    const db = await MongoClient.connect(mongoUrl);
    const collection = db.collection('votes');
    const vote = await collection.insert({ permlink });
    db.close();
    return vote;
  } catch (err) {
    console.log(err);
  }
}

async function removeVote(permlink) {
  try {
    const db = await MongoClient.connect(mongoUrl);
    const collection = db.collection('votes');
    const vote = await collection.remove({ permlink });
    db.close();
    return vote;
  } catch (err) {
    console.log(err);
  }
}

async function alreadyVoted(permlink) {
  try {
    const db = await MongoClient.connect(mongoUrl);
    const collection = db.collection('votes');
    const vote = await collection.findOne({ permlink });
    db.close();
    console.log(vote)
    if(vote != null) {
      return true
    }
    return false;
  } catch (err) {
    console.log(err);
  }
}

async function vote(post) {
  await saveVote(post.permlink);
  if(lastVote - Date.now() <= 3000) {
    voteDelay += 4000;
  } else {
    voteDelay = 0;
  }
  setTimeout(() => {
    lastVote = Date.now();
    steem.broadcast.vote(process.env.POSTING_KEY, process.env.ACCOUNT, post.author, post.permlink, 100, (err, result) => {
      if(err) {
        console.log('ERROR!');
        removeVote(post.permlink);
        console.log(err);
      } else {
        console.log('Voted ' + post.permlink);
        console.log(result);
      }
    });
  }, voteDelay);
};

async function run() {
  const posts = JSON.parse(
    await request.get(`https://api.utopian.io/api/posts/?limit=${limit}&skip=${skip}&section=${section}&sortBy=${sortBy}&filterBy=${filterBy}&type=${type}`)
  );

  posts.results.forEach(async post => {
    if(Date.now() >= new Date(post.created).getTime() + (wait * 1000 * 60)) {
      if(categories.includes(post.json_metadata.type) || categories.length === 0) {
        if(post.author !== process.env.ACCOUNT) {
          const voted = await alreadyVoted(post.permlink);
          console.log(voted);
          if(!voted) {
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
