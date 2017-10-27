const config = require('./config.js');
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(config.redis_port, config.redis_host);
//const client = bluebird.promisifyAll(redis.createClient(config.redis_port, config.redis_host));


let getQueueInitial = (locationId, userId, cb) => { //needs promise in call
  console.log('gettingQueue at db index', `longQueue:user:${userId}`, `users:location:${locationId}`);
  // client.sdiffstore(`longQueue:user:${userId}`, `users:location:${locationId}`, `swipes:user:${userId}`, (err, res) => {
  //   if (err) {
  //     console.log('err', err);
  //   } else {
  //     console.log(`longQueue:user:${userId}`, `\n${res} users in set`);
  //     //return client.sscanAsync(`swipes:user:${userId}`, 0, 'match *', `count ${config.queue_size}`);
  //   }
  // })
  return client.sdiffstoreAsync(`longQueue:user:${userId}`, `users:location:${locationId}`, `swipes:user:${userId}`) //make list of all users current user hasn't swiped on in given location
  .then((res) => {
    console.log(`longQueue:user:${userId}`, `\n${res} users in set`);
    console.log(`longQueue:user:${userId}`, `0`, `match *`, `count ${config.queue_size}`);
    client.sscan(`longQueue:user:${userId}`, [`0`, `MATCH *`, `COUNT ${config.queue_size}`], (err, res) => {
      if (err) {
        console.log('err', err);
      } else {
        console.log(`longQueue:user:${userId}`, `\n${res} users in set`);
        cb(null, res);
      }
    }); //returns queue and sscan cursor
  })
  // .then((res) => {
  //   return res;
  // });
}

let getQueue = (locationId, userId, cursor) => {
  return client.sscanAsync(`swipes:user:${userId}`, cursor, 'match *', `count ${config.queue_size}`) //returns queue and sscan cursor
  .then((res) => {
    return res;
  });
}

module.exports = {
  getQueueInitial,
  getQueue
}
