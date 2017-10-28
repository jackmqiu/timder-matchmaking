const config = require('./config.js');
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(config.redis_port, config.redis_host);

const basePreference = {
  weight_id: 9991214,
  user_id: 9991214,
  photo_count_weight: {
    0: 0.25,
    1: 0.5,
    2: 0.75,
    3: 0.25
  }
};

let getQueue = (locationId, userId) => {

  //look for weights
  addQueueInitial()
  .then()
  client.lpush()
}

let addQueue = (locationId, userId) => { //needs promise in call
  console.log('gettingQueue at db index', `longQueue:user:${userId}`, `users:location:${locationId}`);
  return client.existsAsync(`longQueue:user:${userId}`)
  .then((res) => {
    console.log('exists', res)
    if (res) {
      return scanQueue(locationId, userId);
    } else {
      return client.sdiffstoreAsync(`longQueue:user:${userId}`, `users:location:${locationId}`, `swipes:user:${userId}`); //make list of all users current user hasn't swiped on in given location
    }
  })
  .then((res) => {
    console.log(`longQueue:user:${userId}`, `\n${res} users in set`);
    console.log(`longQueue:user:${userId}`, `0`);
    return scanQueue(locationId, userId);
  })

}

let scanQueue = (locationId, userId, cursor) => {
  return client.sscanAsync(`longQueue:user:${userId}`, `0`);//, `match *`), `count ${config.queue_size}`) //returns queue and sscan cursor
  // .then((res) => {
  //   return res;
  // });
}

module.exports = {
  addQueue,
  getQueue,
  client
}
