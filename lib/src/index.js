"use strict";
var drg_json_1 = require("../data/drg.json");
var config_1 = require("../config");
var index_1 = require('../redis/index');
var cors = require("cors");
require("es6-shim");
var express = require("express");
var expressSession = require("express-session");
var cookieParser = require("cookie-parser");
require("rxjs/add/observable/fromEvent");
require("rxjs/add/observable/interval");
require("rxjs/add/operator/map");
require("rxjs/add/operator/mergeMap");
require("rxjs/add/operator/partition");
require("rxjs/add/operator/share");
var Observable_1 = require("rxjs/Observable");
var Subject_1 = require("rxjs/Subject");
var ws_1 = require("ws");
var e = require('express');
var cookie = require('cookie');
var test = require('cookie-parser');
var c = cookieParser();
var RedisStore = require("connect-redis")(expressSession);
var sessionStore = new RedisStore({
    host: config_1.config.REDISURL
});
var session = expressSession({
    store: sessionStore,
    secret: "some secret",
    resave: true,
    saveUninitialized: true
});
var app = express();
app.use(cors());
app.use(c);
app.use(session);
var searchDrgs = function (query) {
    query.ms_drg = query.ms_drg ? parseInt(query.ms_drg, 10) : undefined;
    query.mdc = query.mdc ? parseInt(query.mdc, 10) : undefined;
    return function (drg) {
        if (query.ms_drg) {
            return drg.ms_drg === query.ms_drg;
        }
        return drg.mdc === query.mdc;
    };
};
app.get("/drgs", function (req, res) {
    if (!req.query.ms_drg && !req.query.mdc) {
        return res.json([]);
    }
    res.json(drg_json_1.drgs.filter(searchDrgs(req.query)));
});
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.warn("Drg Server app listening at http://%s:%s", host, port);
});
var createRxSocket = function (connection) {
    var messages = Observable_1.Observable.fromEvent(connection, "message", function (message) { return JSON.parse(message); });
    var messageObserver = {
        next: function (message) {
            if (connection.readyState === 1) {
                connection.send(JSON.stringify(message));
            }
        }
    };
    connection.on("close", function () {
        if (connection.streams) {
            connection.streams.forEach(function (s) { return s.unsubscribe(); });
        }
    });
    return Subject_1.Subject.create(messages, messageObserver);
};
var createRxServer = function (options) {
    return new Observable_1.Observable(function (serverObserver) {
        console.warn("started server...", options);
        var wss = new ws_1.Server(options);
        wss.on("connection", function (connection) {
            var cookies = cookie.parse(connection.upgradeReq.headers.cookie);
            console.log('ccokiie', cookies["connect.sid"]);
            var sid = test.signedCookie(cookies["connect.sid"], "some secret");
            console.log('sid', sid);
            index_1.client.get(cookies["connect.sid"], function (err, sess) {
                console.log('err', err);
                console.log('session', sess);
            });
            index_1.client.on("subscribe", function (channel, count) {
                console.log("Subscribed to " + channel + ". Now subscribed to " + count + " channel(s).");
            });
            index_1.client.on("message", function (channel, message) {
                console.log("Message from channel " + channel + ": " + message);
            });
            index_1.client.subscribe("analytics");
            return serverObserver.next(connection);
        });
        return function () {
            wss.close();
        };
    }).share();
};
var socketServer = createRxServer({ port: 8081 });
var connections = socketServer.map(createRxSocket);
var messageEvents$ = connections.flatMap(function (connection) {
    return connection.map(function (message) { return ({ connection: connection, message: message }); });
});
var _a = messageEvents$.partition(function (_a) {
    var type = _a.message.type;
    return type === "sub";
}), subs = _a[0], unsubs = _a[1];
subs.subscribe(function (_a) {
    var connection = _a.connection, symbol = _a.message.symbol;
    var source = Observable_1.Observable.interval(500).map(function () { return ({
        symbol: symbol,
        readmission: Math.random() * 100,
        timestamp: Date.now()
    }); });
    connection.streams = connection.streams || {};
    connection.streams[symbol] = source.subscribe(connection);
});
unsubs.subscribe(function (_a) {
    var connection = _a.connection, symbol = _a.message.symbol;
    if (connection.streams) {
        connection.streams[symbol].unsubscribe();
    }
});
