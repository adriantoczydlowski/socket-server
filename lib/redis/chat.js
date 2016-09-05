"use strict";
var index_1 = require("./index");
var q = require("q");
var models_1 = require("./models");
exports.addUser = function (user, name, type) {
    index_1.client.multi()
        .hset('user:' + user, 'name', name)
        .hset('user:' + user, 'type', type)
        .zadd('users', Date.now(), user)
        .exec();
};
exports.addRoom = function (room) {
    if (room !== '') {
        index_1.client.zadd('rooms:', Date.now(), room);
    }
};
exports.getRooms = function (cb) {
    index_1.client.zrevrangebyscore('rooms', '+inf', '-inf', function (err, data) {
        return cb(data);
    });
};
exports.addChat = function (chat) {
    index_1.client.multi()
        .zadd('rooms:' + chat.room + ':chats', Date.now(), JSON.stringify(chat))
        .zadd('users', Date.now(), chat.user.id)
        .zadd('rooms', Date.now(), chat.room)
        .exec();
};
exports.getChat = function (room, cb) {
    index_1.client.zrange('rooms:' + room + ':chats', 0, -1, function (err, chats) {
        cb(chats);
    });
};
exports.addUserToRoom = function (user, room) {
    index_1.client.multi()
        .zadd('rooms:' + room, Date.now(), user)
        .zadd('users', Date.now(), user)
        .zadd('rooms', Date.now(), room)
        .set('user:' + user + ':room', room)
        .exec();
};
exports.removeUserFromRoom = function (user, room) {
    index_1.client.mutli()
        .zrem('rooms:' + room, user)
        .del('user:' + user + ':room')
        .exec();
};
exports.getUsersinRoom = function (room) {
    return q.Promise(function (resolve, reject, notify) {
        index_1.client.zrange('rooms:' + room, 0, -1, function (err, data) {
            var users = [];
            var loopsleft = data.length;
            data.forEach(function (u) {
                index_1.client.hgetall('user:' + u, function (err, userHash) {
                    users.push(new models_1.User(u, userHash.name, userHash.type));
                    loopsleft--;
                    if (loopsleft === 0) {
                        resolve(users);
                    }
                });
            });
        });
    });
};
