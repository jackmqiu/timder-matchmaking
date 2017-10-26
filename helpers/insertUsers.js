const generator = require('./generator.js');
const config = require('./config.js');

const redis = require('redis');

var client = redis.createClient(config.redis_port, config.redis_host);

let submitNewUser = (n) => {

  let newUser = generator.generateNewUserArray();
  client.hmset(`users:${n}`, newUser,
  (err, res) => {
    if (err) {
      console.error('Insert error:', err);
    } else {
      console.log('Successful inject:', res, n);
      client.sadd(`users:location:${newUser[1]}`, `users:${n}`, () => {console.log(`users:location:${newUser[1]}`);});
      client.sadd(`swipes:user:${n}`, 1, () => {console.log(`swipes:user:${n}`);}); //everyone swiped on user 1 at time of user creation
      if (n > 0) {
        submitNewUser(n - 1);
      }
    }
  });

}

submitNewUser(10000000);
