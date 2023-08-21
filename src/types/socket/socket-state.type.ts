export declare type InitialSocketType = {
    newMessage: SocketMessageType | null,
}

export declare type SocketMessageType = {
    userId: string,
    name: string,
    data?: any
}
