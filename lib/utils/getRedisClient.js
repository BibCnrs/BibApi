import redis from 'redis';
import config from 'config';
import promisify from 'es6-promisify-all';

promisify(redis.RedisClient.prototype);
promisify(redis.Multi.prototype);

export default function getRedisClient() {
    return redis.createClient(config.redis);
}
