import { client } from "./index";
import * as q from "q";
import { User, Chat, Room } from "./models";

export var addUser = (user: string, name: string, type: string) => {
  client.multi()
    .hset('user:' + user, 'name', name)
    .hset('user:' + user, 'type', type)
    .zadd('users', Date.now(), user)
    .exec();
};

export var addRoom = (room: string) => {
  if (room !== '') {
    client.zadd('rooms:', Date.now(), room);
  }
};

export var getRooms = (cb: any) => {
  client.zrevrangebyscore('rooms', '+inf', '-inf', (err: any, data: any) => {
    return cb(data);
  });
};

export var addChat = (chat: any) => {
  client.multi()
    .zadd('rooms:' + chat.room + ':chats', Date.now(), JSON.stringify(chat))
    .zadd('users', Date.now(), chat.user.id)
    .zadd('rooms', Date.now(), chat.room)
    .exec();
};

export var getChat = (room: string, cb: any) => {
  client.zrange('rooms:' + room + ':chats', 0, -1, (err: any, chats: any) => {
    cb(chats);
  });
};

export var addUserToRoom = (user: string, room: string) => {
  client.multi()
    .zadd('rooms:' + room, Date.now(), user)
    .zadd('users', Date.now(), user)
    .zadd('rooms', Date.now(), room)
    .set('user:' + user + ':room', room)
    .exec();
};

export var removeUserFromRoom = (user: string, room: string) => {
  client.mutli()
    .zrem('rooms:' + room, user)
    .del('user:' + user + ':room')
    .exec();
};

export var getUsersinRoom = (room: string) => {
  return q.Promise((resolve: any, reject: any, notify: any) => {
    client.zrange('rooms:' + room, 0, -1, (err: any, data: any) => {
      var users: User[] = [];
      var loopsleft = data.length;
      data.forEach((u: any) => {
        client.hgetall('user:' + u, (err: any, userHash: any) => {
          users.push(new User(u, userHash.name, userHash.type));
          loopsleft--;
          if (loopsleft === 0) {
            resolve(users);
          }
        });
      });
    });
  });
};