const axios = require('axios');
const generator = require('./generator');
const apiURL = 'http://localhost:3000';
const db = require('../db');
const elastic = require('../elasticSearch');
//randomomly generate users
//Users asynchronously
//loop through users

//request queue
//give each an arbitrary setTimeout for when to logon

let swipeCity = (nPerBatch, timePerBatch, totalUsers, nBatches) => {
  setInterval(() => {
    outputToElastic();
  }, 1000);
  for (var i = 0; i < nBatches; i++) {
    setTimeout(() => {
      swipeBatch(nPerBatch, timePerBatch, totalUsers);
    }, timePerBatch * i);
  }
}

let outputToElastic = () => {
  db.getDatabaseInfo('memory')
  .then((info) => {
    elastic.indexInfo(info.split('\r\n')[1].split(':'));
  })
  db.getDatabaseInfo('cpu')
  .then((info) => {
    elastic.indexInfo(info.split('\r\n')[1].split(':'));
  })
  db.getDatabaseInfo('stats')
  .then((info) => {
    elastic.indexInfo(info.split('\r\n')[2].split(':'));
  })
}

let swipeBatch = (nPerBatch, timePerBatch, totalUsers) => {
  for (var i = 0; i < nPerBatch; i++) {
    setTimeout(() => {
      getUserProf(totalUsers - Math.floor(Math.random() * nPerBatch))
      .then((res) => {
        console.log('userProfile at startUserSessions, promise of getUserProf', res.data);
        getQueue(res.data)
        .then((queue) => {
          console.log('queue at swipeCity before conductSwipes', queue.data, res.data);
          conductSwipes(queue.data, res.data, false)
        })
        getMatchQueue(res.data)
        .then((matchQueue) => {
          console.log('matchQueue at swipeCity', matchQueue.data, res.data);
          conductSwipes(matchQueue.data, res.data, true)
        })
      })
      .catch((err) => {
        console.log('err at swipeCity', err);
      })
    }, Math.floor(Math.random() * timePerBatch))
  }

}

let getUserProf = (userId) => {
  //console.log('userId[0] at getUserProf', userId[0]);
  if (userId[0] === 'u') {
    return axios.get(`${apiURL}/getUser/${userId}`)
  } else {
    return axios.get(`${apiURL}/getUser/user:${userId}`)
  }

}

let getQueue = (userProfile) => {
  console.log('getQueue userProfile:', userProfile);
  return axios.get(`${apiURL}/getQueue/${generator.generateLocation()}/${userProfile['userId']}`) //request queue
}

let getMatchQueue = (userProfile) => {
  console.log('getMatchQueue userProfile', userProfile);
  return axios.get(`${apiURL}/getMatchQueue/${userProfile['userId']}`)
}

let sendSwipes = (direction, swipingUser, swipedUser, match) => {
  return axios.post(`${apiURL}/swipe/${swipingUser}/${swipedUser}/${direction}/${match}`)
}

let conductSwipes = (queue, userProfile, potentialMatches) => {
  for (var i = 0; i < queue.length; i++) {
    if (queue[i][5] !== 'u') {
      getUserProf(queue[i])
      .then((swipeProfile) => {
        if (Math.random() < userProfile[`preferenceFor${swipeProfile.data['photoCount']}Photos`]) {
          if (potentialMatches) {
            sendSwipes(1, userProfile['userId'], swipeProfile.data['userId'], 1);
          } else {
            sendSwipes(1, userProfile['userId'], swipeProfile.data['userId'], 0);
          }
        } else {
          sendSwipes(0, userProfile['userId'], swipeProfile.data['userId'], 0);
        }
      })
    }
  }
}

swipeCity(100, 60000, 10000000, 10);
