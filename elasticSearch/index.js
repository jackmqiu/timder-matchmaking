var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

let indexSwipe = (swipingUser, swipedUser, swipeDirection) => {
  client.index({
    index: 'timder',
    type: 'swipes',
    body: {

      swipeDirection: swipeDirection,
      swipingUser: swipingUser,
      swipedUser: swipedUser,
      timeStamp: new Date().toISOString()

    }
  }).then(function (resp) {
    console.log('put response', resp);
  }, function (err) {
    console.trace(err.message);
  });
}

let indexMatch = (userId1, userId2) => {
  client.index({
    index: 'timder',
    type: 'match',
    body: {
      userId1: userId1,
      userId2: userId2,
      timeStamp: new Date().toISOString()
    }
  }).then(function (resp) {
    console.log('put response', resp);
  }, function (err) {
    console.trace(err.message);
  });
}

let indexInfo = (info) => {

  client.index({
    index: 'timder',
    type: 'databaseInfo',
    body: {
      [`${info[0]}`]: parseInt(info[1]),
      timeStamp: new Date().toISOString()
    }
  }).then(function (resp) {
    console.log('put response', resp);
  }, function (err) {
    console.trace(err.message);
  });
}

module.exports = {
  client,
  indexInfo,
  indexMatch,
  indexSwipe
}
