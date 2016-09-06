import * as redis from "redis";
import * as store from "connect-redis";
import { config } from "../config";
export var client = redis.createClient(config.REDISURL);
export var redisStore = store;