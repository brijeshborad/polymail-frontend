import {useCallback, useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getProfilePicture} from "@/redux/users/action-reducer";
import {debounce} from "@/utils/common.functions";
import {User} from "@/models";
import LocalStorageService from "@/utils/localstorage.service";
import {StateType} from "@/types";
import useWebSocket from "react-use-websocket";
import {getSummary} from "@/redux/common-apis/action-reducer";
import {ACCOUNT_MAIL_INIT_SYNC_TIMEOUT} from "@/utils/constants";
import {getAllAccount} from "@/redux/accounts/action-reducer";
import {commonService, socketService} from "@/services";

// Multiple instances of the hook can exist simultaneously.
// This stores the timestamp of the last heartbeat for a given socket url,
// preventing other instances to send unnecessary heartbeats.
const previousHeartbeats: Record<string, number> = {};

// Multiple instances of the hook can exist simultaneously.
// preventing other instances to update the same event twice.
let toRemoveDuplicateSocketEvents: string = '';

let loaderPercentage = 10;

let interVal: any = null;

export function CommonApiComponents() {
    const dispatch = useDispatch();
    const user: User | null = LocalStorageService.updateUser('get');
    const socketUrl: string = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?token=${user?.token}`;
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    // Stores the heartbeat interval.
    const heartbeatIntervalRef = useRef<number>();

    const {lastMessage, sendJsonMessage, readyState} = useWebSocket(socketUrl, {
        share: true,
        shouldReconnect: () => true,
        reconnectInterval: 0,
        reconnectAttempts: 1000000000000000,
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
        interVal = setInterval(() => {
            commonService.updateUserOnlineStatusOnInterval();
        }, 1000 * 10);
        return () => {
            clearInterval(interVal);
        };
    }, [alertUser, dispatch]);

    useEffect(() => {
        if (lastMessage) {
            const reader = new FileReader();
            reader.onload = function () {
                if (reader.result) {
                    // Multiple instances of the hook can exist simultaneously.
                    // preventing other instances to update the same event twice.
                    if (toRemoveDuplicateSocketEvents !== reader.result.toString()) {
                        toRemoveDuplicateSocketEvents = reader.result.toString();
                        let parsedData: any = JSON.parse(reader.result.toString())
                        commonService.updateUserOnlineStatusWithSocketEvent(parsedData);
                        socketService.updateSocketMessage(parsedData);
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
            socketService.updateSocketMessageFunction(sendJsonMessage);
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
    }, [socketUrl, readyState, sendJsonMessage, dispatch]);

    useEffect(() => {
        if (selectedAccount) {
            if (!selectedAccount?.syncHistory?.mailInitSynced) {
                commonService.updateEmailSyncPercentage(loaderPercentage);
                debounce(() => {
                    if (loaderPercentage < 100) {
                        loaderPercentage += 10;
                    }
                    dispatch(getAllAccount({}));
                }, ACCOUNT_MAIL_INIT_SYNC_TIMEOUT)
            } else {
                if (selectedAccount.syncHistory?.mailInitSynced) {
                    loaderPercentage = 0;
                    commonService.updateEmailSyncPercentage(null);
                }
            }
        }
    }, [dispatch, selectedAccount])

    const getAllCommonApis = useCallback(() => {
        dispatch(getSummary({}));
        dispatch(getProfilePicture({}));
    }, [dispatch]);

    useEffect(() => {
        getAllCommonApis();
    }, [getAllCommonApis]);

    return null
}
