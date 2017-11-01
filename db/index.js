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

//Set manipulation
let scanLongQueue = (locationId, userId, cursor = 0) => {
  return client.sscanAsync(`longQueue:user:${userId}`, cursor, `MATCH`, `*`, `count`, config.queue_size) //returns queue and sscan cursor
}

let getQueueInitial = (locationId, userId) => {
  return client.sdiffstoreAsync(`longQueue:user:${userId}`, `users:location:${locationId}`, `swipes:user:${userId}`) //make list of all users current user hasn't swiped on in given location
  .then((res) => {
    return scanLongQueue(LocationId, userId);
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
      return getQueueInitial(locationId, userId);
    }
  })
}

//List manipulation
let deleteQueueList = (userId) => {
  return client.del(`shortQueue:user:${userId}`);
}

let fillAndRetrieveQueueList = (locationId, userId) => {
  return addQueue(locationId, userId)
  .then((res) => {
    return client.lpushAsync(`shortQueue:user:${userId}`, res[1])
  })
  .then((res) => {
    return client.lrangeAsync(`shortQueue:user:${userId}`, 0, -1)
  })
}

let postSwipes = (userId, userId2, direction) => {
  if (direction) {
    return client.rpushAsync(`shortQueue:user:${userId}`, `user:${userId2}`)
    .then((res) => {
      return client.saddAsync(`swipes:user:${userId}`, `user:${userId2}`)
    })
  } else {
    return client.saddAsync(`swipes:user:${userId}`, `user:${userId2}`)
  }
}

module.exports = {
  addQueue,
  client,
  scanLongQueue,
  fillAndRetrieveQueueList,
  deleteQueueList,
  postSwipes
}
