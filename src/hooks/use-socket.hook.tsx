import useWebSocket from "react-use-websocket";
import {User} from "@/models";
import LocalStorageService from "@/utils/localstorage.service";

export const useSocket = function () {
    const user: User | null = LocalStorageService.updateUser('get');
    const socketUrl: string = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?token=${user?.token}`;
    const {lastMessage, sendMessage, readyState} = useWebSocket(socketUrl, {
        share: true,
        shouldReconnect: () => true,
        reconnectInterval: 0,
        onOpen: () => {
            console.log('WebSocket connection established.');
        },
        onClose: () => {
            console.log('WebSocket connection disconnected.');
        }
    })
    return {lastMessage, sendMessage, readyState, socketUrl}
};
