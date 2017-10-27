const config = require('./config.js');
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(config.redis_port, config.redis_host);


let getQueueInitial = (locationId, userId) => { //needs promise in call

  return client.sdiffAsync(`longQueue:user:${userId}`, `users:location:${locationId}`, `swipes:user:${userId}`) //make list of all users current user hasn't swiped on in given location
  .then((res) => {
    return client.sscanAsync(`swipes:user:${userId}`, 0, 'match *', `count ${config.queue_size}`) //returns queue and sscan cursor
    .then((res) => {
      return res;
    });
  });
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
