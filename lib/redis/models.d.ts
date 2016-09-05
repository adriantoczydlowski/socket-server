export declare class User {
    id: number;
    name: string;
    type: any;
    constructor(id: number, name: string, type: any);
}
export declare class Chat {
    id: string;
    message: string;
    room: string;
    ts: number;
    user: User;
    constructor(message: string, room: string, user: User);
}
export declare class Room {
    id: string;
    name: string;
    constructor(id: string, name: string);
}
