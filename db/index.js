const config = require('./config.js');
const redis = require('redis');
const bluebird = require('bluebird');
const elastic = require('../elasticSearch');
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

let getDatabaseInfo = (category) => {
  return client.infoAsync(category)
}
//Set manipulation
let scanLongQueue = (locationId, userId) => {
  console.log('arguments at scanLongQueue: ', locationId, userId);
  return client.srandmemberAsync(`longQueue:user:${userId}`, config.queue_size) //returns queue and sscan cursor
}

let getQueueInitial = (locationId, userId) => {
  console.log('arguments at getQueueInitial for sdiffstoreAsync: ', locationId, userId);
  return client.sdiffstoreAsync(`longQueue:user:${userId}`, `users:location:${locationId}`, `swipes:user:${userId}`) //make list of all users current user hasn't swiped on in given location
  .then((res) => {
    console.log('response of sdiffstoreAsync', res);
    return scanLongQueue(locationId, userId);
  })
  .catch((err) => {
    console.log('err at getQueueInitial db', err);
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
  .catch((err) => {
    console.log('err at addQueue db', err);
  })
}

//List manipulation
let deleteQueueList = (userId) => {
  return client.del(`shortQueue:user:${userId}`);
}

let deleteMatchQueue = (userId) => {
  return client.del(`matchQueue:user:${userId}`);
}

let retrieveMatchList = (userId) => {
  return client.lrangeAsync(`matchQueue:user:${userId}`, 0, -1)
}

let fillAndRetrieveQueueList = (locationId, userId) => {
  return addQueue(locationId, userId)
  .then((res) => {
    return client.lpushAsync(`shortQueue:user:${userId}`, res[1])
  })
  .then((res) => {
    return client.lrangeAsync(`shortQueue:user:${userId}`, 0, -1)
  })
  .catch((err) => {
    console.log('err at fillAndRetrieveQueueList db', err);
  })
}

let postSwipes = (userId, userId2, direction, match) => { //add match logic
  elastic.indexSwipe(userId, userId2, direction);
  if (direction) {
    if (match === 1) {
      elastic.indexMatch(userId, userId2);// pass match to elastic
      client.rpushAsync(`matches:user:${userId}`, `user:${userId2}`) //add matches to both users
      client.rpushAsync(`matches:user:${userId2}`, `user:${userId}`)
      return client.saddAsync(`swipes:user:${userId}`, `user:${userId2}`)
    } else {
      return client.rpushAsync(`matchQueue:user:${userId2}`, `user:${userId}`)
      .then((res) => {
        return client.saddAsync(`swipes:user:${userId}`, `user:${userId2}`)
      })
      .catch((err) => {
        console.log('err at postSwipes db', err);
      })
    }
  } else {
    return client.saddAsync(`swipes:user:${userId}`, `user:${userId2}`)
  }
}

let getUserProfile = (userString) => {
  return client.hgetallAsync(userString)
}

module.exports = {
  addQueue,
  client,
  scanLongQueue,
  fillAndRetrieveQueueList,
  deleteQueueList,
  deleteMatchQueue,
  postSwipes,
  getUserProfile,
  retrieveMatchList,
  getDatabaseInfo
}
