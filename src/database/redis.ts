
import Redis from 'ioredis';
import { config } from '../config/config';

export const redis = new Redis({
  host: config.redisHost,
  port: config.redisPort,
});
