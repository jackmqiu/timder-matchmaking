const generator = require('./generator.jsx');
const config = require('./config.jsx');

const redis = require('redis');

var client = redis.createClient(config.redis_port, config.redis_host);

let submitNewUser = (n) => {

  let newUser = generator.generateNewUserArray();
  client.hmset(`users:${n}`, newUser,
  (err, res) => {
    if (err) {
      console.error('Insert error:', err);
    } else {
      console.log('Successful inject:', res);
      if (n > 0) {
        submitNewUser(n - 1);
      }
    }
  });

}

submitNewUser(10000000);
