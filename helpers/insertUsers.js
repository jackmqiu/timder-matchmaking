const generator = require('./generator.js');
const db = require('../db');
const redis = require('redis');

let submitNewUser = (n) => {

  let newUser = generator.generateNewUserArray(n);
  db.client.hmsetAsync(`user:${n}`, newUser)
  .then((res) => {
    console.log('Successful inject:', res, n);
    db.client.saddAsync(`users:location:${newUser[3]}:photoCount:${newUser[5]}`, `user:${n}`)
    .then((res) => {
      console.log(`users:location:${newUser[1]}`);
    })
    db.client.saddAsync(`swipes:user:${n}`, 'user:1') //everyone swiped on user 1 at time of user creation
    .then((res) => {
      console.log(`swipes:user:${n}`);
    })
    if (n > 0) {
      submitNewUser(n - 1);
    }

  })



}

submitNewUser(10000000);
