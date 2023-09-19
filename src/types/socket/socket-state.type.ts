import {SendJsonMessage} from "react-use-websocket/src/lib/types";

export declare type InitialSocketType = {
    newMessage: SocketMessageType | null,
    sendJsonMessage: SendJsonMessage | null,
}

export declare type SocketMessageType = {
    userId: string,
    name: string,
    data?: any
}
