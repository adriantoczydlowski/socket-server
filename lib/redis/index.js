"use strict";
var redis = require("redis");
var config_1 = require("../config");
exports.client = redis.createClient(config_1.config.PORT, config_1.config.REDISURL);
