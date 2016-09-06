
// import { createServer } from "http";
import { drgs } from "../data/drg.json";
import { config } from "../config";
import { client, redisStore } from '../redis/index';
import * as cors from "cors";
import "es6-shim";
import * as express from "express";
import * as expressSession from "express-session";
import * as cookieParser from "cookie-parser";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/interval";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/partition";
import "rxjs/add/operator/share";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Server } from "ws";
let e = require('express');
var cookie = require('cookie');
var test = require('cookie-parser');
let c = cookieParser();
let RedisStore = require("connect-redis")(expressSession);
let sessionStore = new RedisStore({
  host: config.REDISURL
  
});
let session = expressSession({
  store: sessionStore,
  secret: "some secret",
  resave: true,
  saveUninitialized: true
});
let app = express();
app.use(cors());
app.use(c);
app.use(session);

const searchDrgs = (query: any) => {
  query.ms_drg = query.ms_drg ? parseInt(query.ms_drg, 10) : undefined;
  query.mdc = query.mdc ? parseInt(query.mdc, 10) : undefined;

  return (drg: any) => {
    // prefer ms_drg
    if (query.ms_drg) {
      return drg.ms_drg === query.ms_drg;
    }
    return drg.mdc === query.mdc;
  };
};

app.get("/drgs", (req: any, res: any) => {
  if (!req.query.ms_drg && !req.query.mdc) {
    return res.json([]);
  }
  res.json(drgs.filter(searchDrgs(req.query)));
});

let server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.warn("Drg Server app listening at http://%s:%s", host, port);
});

// creates a new server socket Subject
const createRxSocket = (connection: any) => {
  let messages = Observable.fromEvent(connection, "message", (message: any) => JSON.parse(message));
  let messageObserver: any = {
    next(message: any) {
      if (connection.readyState === 1) {
        connection.send(JSON.stringify(message));
      }
     },
  };
  connection.on("close", () => {
    if (connection.streams) {
      connection.streams.forEach((s: any) => s.unsubscribe());
    }
  });
  return Subject.create(messages, messageObserver);
};

// creates an instance of the websocket server;
const createRxServer = (options: any) => {
  return new Observable((serverObserver: any) => {
    console.warn("started server...", options);
    let wss = new Server(options);
    wss.on("connection", (connection: any) => {
       var cookies = cookie.parse(connection.upgradeReq.headers.cookie);
       console.log('ccokiie', cookies["connect.sid"]);
       var sid = test.signedCookie(cookies["connect.sid"], "some secret");
       console.log('sid', sid);
       client.get(cookies["connect.sid"], function(err: any, sess: any) {
          console.log('err', err);
          console.log('session', sess);
      });
      client.on("subscribe", function(channel: any, count: any) {
          console.log("Subscribed to " + channel + ". Now subscribed to " + count + " channel(s).");
      });

      client.on("message", function(channel: any, message: any) {
          console.log("Message from channel " + channel + ": " + message);
      });

      client.subscribe("analytics");

      return serverObserver.next(connection);
    });
    return () => {
      wss.close();
    };
  }).share();
};

const socketServer = createRxServer({port: 8081});
const connections = socketServer.map(createRxSocket);

let messageEvents$ = connections.flatMap((connection: any) => 
  connection.map((message: any) => ({connection, message})
));

let [subs, unsubs] = messageEvents$.partition(({ message: {type} }: any) => type === "sub");

subs.subscribe(({ connection, message: {symbol} }: any) => {
  let source = Observable.interval(500).map(() => ({
    symbol,
    readmission: Math.random() * 100,
    timestamp: Date.now(),
  }));
  connection.streams = connection.streams || {};
  connection.streams[symbol] = source.subscribe(connection);
});

unsubs.subscribe(({ connection, message: {symbol} }: any) => {
  if (connection.streams) {
    connection.streams[symbol].unsubscribe();
  }
});
