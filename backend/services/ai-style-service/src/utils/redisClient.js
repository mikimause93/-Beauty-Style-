const Redis = require('ioredis');

let connection = null;

function getRedisConnection() {
  if (!connection) {
    connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}

module.exports = { getRedisConnection };
