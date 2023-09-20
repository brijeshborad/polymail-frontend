import {useCallback, useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getProfilePicture} from "@/redux/users/action-reducer";
import {updateLastMessage, updateSendFunction} from "@/redux/socket/action-reducer";
import {debounce} from "@/utils/common.functions";
import {User} from "@/models";
import LocalStorageService from "@/utils/localstorage.service";
import {StateType} from "@/types";
import useWebSocket from "react-use-websocket";
import {getSummary} from "@/redux/common-apis/action-reducer";

// Multiple instances of the hook can exist simultaneously.
// This stores the timestamp of the last heartbeat for a given socket url,
// preventing other instances to send unnecessary heartbeats.
const previousHeartbeats: Record<string, number> = {};

// Multiple instances of the hook can exist simultaneously.
// preventing other instances to update the same event twice.
let toRemoveDuplicateSocketEvents: string = '';

export function CommonApiComponents() {
    const dispatch = useDispatch();
    const user: User | null = LocalStorageService.updateUser('get');
    const socketUrl: string = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?token=${user?.token}`;
    const {userDetails} = useSelector((state: StateType) => state.users);
    // Stores the heartbeat interval.
    const heartbeatIntervalRef = useRef<number>();

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
        window.addEventListener("beforeunload", alertUser);
        return () => {
            (window as any).isListenerAdded = false
            window.removeEventListener("beforeunload", alertUser);
        };
    }, [alertUser]);

    useEffect(() => {
        if (lastMessage) {
            const reader = new FileReader();
            reader.onload = function () {
                if (reader.result) {
                    // Multiple instances of the hook can exist simultaneously.
                    // preventing other instances to update the same event twice.
                    if (toRemoveDuplicateSocketEvents !== reader.result.toString()) {
                        toRemoveDuplicateSocketEvents = reader.result.toString();
                        dispatch(updateLastMessage(JSON.parse(reader.result.toString())));
                        // Clear the instance once the spamming is done.
                        debounce(() => {
                            toRemoveDuplicateSocketEvents = '';
                        }, 2000);
                    }
                }
            }
            reader.readAsText(lastMessage.data);
        }
    }, [dispatch, lastMessage])

    // Sends a periodical heartbeat message through the websocket connection.
    useEffect(() => {
        if (readyState === 1) {
            dispatch(updateSendFunction(sendJsonMessage));
            heartbeatIntervalRef.current = window.setInterval(() => {
                if (socketUrl) {
                    const lastHeartbeat = previousHeartbeats[socketUrl];
                    const deltaFromNow = (Date.now() - lastHeartbeat) / 1000;

                    // Send a heartbeat message if it hasn't already been sent within the last 10 seconds.
                    if (!lastHeartbeat || deltaFromNow > 10) {
                        // Send the heartbeat message and update the heartbeat history.
                        sendJsonMessage({});
                        previousHeartbeats[socketUrl] = Date.now();
                    }
                }
            }, 5000);
        }

        return () => {
            clearInterval(heartbeatIntervalRef.current);
        };
    }, [socketUrl, readyState, sendJsonMessage]);

    const getAllCommonApis = useCallback(() => {
        dispatch(getSummary({}));
        dispatch(getProfilePicture({}));
    }, [dispatch]);

    useEffect(() => {
        getAllCommonApis();
    }, [getAllCommonApis]);

    return null
}
