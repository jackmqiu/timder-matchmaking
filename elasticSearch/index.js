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
      swipedUser: swipedUser

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
    type: 'matches',
    body: {
      userId1: userId1,
      userId2: userId2
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
      memoryUsage: info,
      CPU: info,
      instantaneous_ops_per_sec: info,
      instantaneous_input_kbps: info,
      instantaneous_output_kbps: info,
      keyspace_hits: info,
      keyspace_misses: info
    }
  }).then(function (resp) {
    console.log('put response', resp);
  }, function (err) {
    console.trace(err.message);
  });
}
