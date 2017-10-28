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


let scanLongQueue = (locationId, userId, cursor) => {
  return client.sscanAsync(`longQueue:user:${userId}`, `0`, `MATCH`, `*`, `count`, config.queue_size) //returns queue and sscan cursor
}

let fillQueueList = (locationId, userId, cursor, limit) => {
  addQueue(locationId, userId, cursor)
  .then((res) => {
    client.lpushAsync(`shortQueue:user:${userId}`, res[1])
    .then((res) => {
      if (limit < 0) {
        return 1;
      } else {
        console.log('filling Queue', limit);
        return fillQueueList(locationId, userId, res[0], limit - 10);
      }
    })
  })
}

let getQueue = (locationId, userId) => {

  //look for weights
  fillQueueList(locationId, userId, 0, 100)
  .then((res) => {
    console.log('queue filled', `shortQueue:user:${userId}`);

  })
}

let addQueue = (locationId, userId) => { //needs promise in call
  console.log('gettingQueue at db index', `longQueue:user:${userId}`, `users:location:${locationId}`);
  return client.existsAsync(`longQueue:user:${userId}`)
  .then((res) => {
    console.log('exists', res)
    if (res) {
      return scanLongQueue(locationId, userId);
    } else {
      return client.sdiffstoreAsync(`longQueue:user:${userId}`, `users:location:${locationId}`, `swipes:user:${userId}`); //make list of all users current user hasn't swiped on in given location
    }
  })
  .then((res) => {
    console.log(`longQueue:user:${userId}`, `\n${res} users in set`);
    console.log(`longQueue:user:${userId}`, `0`);
    return scanLongQueue(locationId, userId);
  })

}



module.exports = {
  addQueue,
  getQueue,
  client,
  scanLongQueue
}
