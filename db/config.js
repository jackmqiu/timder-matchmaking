module.exports = {
  redis_host: 'redis',
  redis_port: 6379,
  queue_size: 100
}

/* Things tried for docker
0.0.0.0
16379
0.0.0.0
6379
127.0.0.1
16379
127.0.0.1
6379
http://localhost:16379
timder-redis
16379
redis
6379
(with and without timder-redis container stopped)
*/
