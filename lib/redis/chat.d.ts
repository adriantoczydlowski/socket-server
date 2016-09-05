/// <reference types="q" />
import * as q from "q";
export declare var addUser: (user: string, name: string, type: string) => void;
export declare var addRoom: (room: string) => void;
export declare var getRooms: (cb: any) => void;
export declare var addChat: (chat: any) => void;
export declare var getChat: (room: string, cb: any) => void;
export declare var addUserToRoom: (user: string, room: string) => void;
export declare var removeUserFromRoom: (user: string, room: string) => void;
export declare var getUsersinRoom: (room: string) => q.Promise<{}>;
