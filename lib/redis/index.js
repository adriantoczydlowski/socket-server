"use strict";
var redis = require("redis");
var store = require("connect-redis");
var config_1 = require("../config");
exports.client = redis.createClient(config_1.config.REDISURL);
exports.redisStore = store;
