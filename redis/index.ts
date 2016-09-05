import * as redis from "redis";
import { config } from "../config";
export var client = redis.createClient(config.PORT, config.REDISURL);