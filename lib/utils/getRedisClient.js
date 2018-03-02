import redis from 'redis';
import config from 'config';
import { promisifyAll } from 'bluebird';

promisifyAll(redis.RedisClient.prototype);
promisifyAll(redis.Multi.prototype);

export default function getRedisClient() {
    return redis.createClient(config.redis);
}
