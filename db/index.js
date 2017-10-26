const config = require('./config.js');
const app = require('express');
const redis = require('redis');

var client = redis.createClient(config.redis_port, config.redis_host);

app.get('/queue/:userId', () => {
  client.
})
