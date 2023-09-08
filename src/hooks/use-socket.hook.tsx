import useWebSocket from "react-use-websocket";
import {User} from "@/models";
import LocalStorageService from "@/utils/localstorage.service";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {useCallback, useEffect, useState} from "react";

export const useSocket = function () {
    const user: User | null = LocalStorageService.updateUser('get');
    const socketUrl: string = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?token=${user?.token}`;
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {lastMessage, sendJsonMessage, readyState} = useWebSocket(socketUrl, {
        share: true,
        shouldReconnect: () => true,
        reconnectInterval: 0,
        onOpen: () => {
            console.log('WebSocket connection established.');
        },
        onClose: () => {
            sendJsonMessage({
                "userId": userDetails?.id,
                "name": "SearchCancel",
            })
            console.log('WebSocket connection disconnected.');
        }
    })
    const [socketMessage, setSocketMessage] = useState<string | any>(null);
    const alertUser = useCallback(() => {
        if (!(window as any).isListenerAdded) {
            (window as any).isListenerAdded = true
            sendJsonMessage({
                "userId": userDetails?.id,
                "name": "SearchCancel",
            })
        }
    }, [sendJsonMessage, userDetails?.id]);

    useEffect(() => {
        if (lastMessage) {
            setSocketMessage(lastMessage);
        }
    }, [lastMessage, setSocketMessage])

    useEffect(() => {
        window.addEventListener("beforeunload", alertUser);
        return () => {
            (window as any).isListenerAdded = false
            window.removeEventListener("beforeunload", alertUser);
        };
    }, [alertUser]);
    return {socketMessage, sendJsonMessage, readyState, socketUrl}
};
