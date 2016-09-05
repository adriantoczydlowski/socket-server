export class User {
  constructor(public id: number, 
              public name: string, 
              public type: any) {
  }
}

export class Chat {
  id: string;
  message: string;
  room: string;
  ts: number;
  user: User;
  constructor(message: string, 
              room: string, 
              user: User) {
    this.id = user.id + (new Date).getTime().toString();
    this.message = message;
    this.room = room;
    this.ts = (new Date).getTime();
    this.user = user;
  }
}

export class Room {
  id: string;
  name: string;
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

