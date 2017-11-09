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

let getRandomUsersFromSet = (userId, photoCount, numberToFetch) => {
  return client.srandmemberAsync(`longQueue:user:${userId}:photoCount:${photoCount}`, numberToFetch)
}
//Set manipulation
let scanLongQueue = (locationId, userId) => {
  console.log('arguments at scanLongQueue: ', locationId, userId);
  let queue = [];
  return getUserProfile('user:' + userId)
  .then((userProfile) => {
    console.log('userProfile', userProfile);
    return Promise.all([
       getRandomUsersFromSet(userProfile.userId, 0, Math.floor(parseFloat(userProfile.preferenceFor0Photos) * 50)),//returns queue and sscan cursor
       getRandomUsersFromSet(userProfile.userId, 1, Math.floor(parseFloat(userProfile.preferenceFor1Photos) * 50)),
       getRandomUsersFromSet(userProfile.userId, 2, Math.floor(parseFloat(userProfile.preferenceFor2Photos) * 50)),
       getRandomUsersFromSet(userProfile.userId, 3, Math.floor(parseFloat(userProfile.preferenceFor3Photos) * 50)),
       getRandomUsersFromSet(userProfile.userId, 4, Math.floor(parseFloat(userProfile.preferenceFor4Photos) * 50))
    ])
  })
}

let createSetDifference = (locationId, userId, photoCount) => {
  return client.sdiffstoreAsync(`longQueue:user:${userId}:photoCount:${photoCount}`, `users:location:${locationId}:photoCount:${photoCount}`, `swipes:user:${userId}`)
}

let getQueueInitial = (locationId, userId) => {
  console.log('arguments at getQueueInitial for sdiffstoreAsync: ', locationId, userId);
  return Promise.all([
    createSetDifference(locationId, userId, 0), //make list of all users current user hasn't swiped on in given location
    createSetDifference(locationId, userId, 1),
    createSetDifference(locationId, userId, 2),
    createSetDifference(locationId, userId, 3),
    createSetDifference(locationId, userId, 4)
  ])
  .then((res) => {
    console.log('response of promise.all sdiffstoreAsync', res);
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
    console.log('array of fillAndRetrieveQueueList', res);
    return Promise.all([
      client.lpushAsync(`shortQueue:user:${userId}`, res[0][1]),
      client.lpushAsync(`shortQueue:user:${userId}`, res[1][1]),
      client.lpushAsync(`shortQueue:user:${userId}`, res[2][1]),
      client.lpushAsync(`shortQueue:user:${userId}`, res[3][1]),
      client.lpushAsync(`shortQueue:user:${userId}`, res[4][1])
    ])
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
