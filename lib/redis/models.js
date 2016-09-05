"use strict";
var User = (function () {
    function User(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
    return User;
}());
exports.User = User;
var Chat = (function () {
    function Chat(message, room, user) {
        this.id = user.id + (new Date).getTime().toString();
        this.message = message;
        this.room = room;
        this.ts = (new Date).getTime();
        this.user = user;
    }
    return Chat;
}());
exports.Chat = Chat;
var Room = (function () {
    function Room(id, name) {
        this.id = id;
        this.name = name;
    }
    return Room;
}());
exports.Room = Room;
