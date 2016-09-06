/// <reference types="connect-redis" />
import * as redis from "redis";
import * as store from "connect-redis";
export declare var client: redis.RedisClient;
export declare var redisStore: typeof store;
