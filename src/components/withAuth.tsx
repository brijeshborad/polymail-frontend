import {useRouter} from 'next/router';
import React, {useEffect, useRef} from 'react';
import LocalStorageService from "@/utils/localstorage.service";
import {Header} from "@/components/common";
import {User} from "@/models";
import {updateLastMessage} from "@/redux/socket/action-reducer";
import {useDispatch} from "react-redux";
import {Flex} from "@chakra-ui/react";
import {useSocket} from "@/hooks/use-socket.hook";

// Multiple instances of the hook can exist simultaneously.
// This stores the timestamp of the last heartbeat for a given socket url,
// preventing other instances to send unnecessary heartbeats.
const previousHeartbeats: Record<string, number> = {};

export default function withAuth(ProtectedComponent: any) {
    return function ProtectedRoute({...props}) {
        const router = useRouter();
        const user: User | null = LocalStorageService.updateUser('get');
        // Stores the heartbeat interval.
        const heartbeatIntervalRef = useRef<number>();

        const userIsAuthenticated = user !== null;
        useEffect(() => {
            if (!userIsAuthenticated) {
                router.push('/auth/signup');
            }
        }, [userIsAuthenticated, router]);

        const {lastMessage, sendMessage, readyState, socketUrl} = useSocket();
        const dispatch = useDispatch();

        if (lastMessage) {
            const reader = new FileReader();
            reader.onload = function () {
                if (reader.result) {
                    dispatch(updateLastMessage(JSON.parse(reader.result.toString())));
                }
            }
            reader.readAsText(lastMessage.data);
        }

        // Sends a periodical heartbeat message through the websocket connection.
        useEffect(() => {
            if (readyState === 1) {
                heartbeatIntervalRef.current = window.setInterval(() => {
                    if (socketUrl) {
                        const lastHeartbeat = previousHeartbeats[socketUrl];
                        const deltaFromNow = (Date.now() - lastHeartbeat) / 1000;

                        // Send a heartbeat message if it hasn't already been sent within the last 10 seconds.
                        if (!lastHeartbeat || deltaFromNow > 10) {
                            // Send the heartbeat message and update the heartbeat history.
                            sendMessage('');
                            previousHeartbeats[socketUrl] = Date.now();
                        }
                    }
                }, 5000);
            }

            return () => {
                clearInterval(heartbeatIntervalRef.current);
            };
        }, [socketUrl, readyState, sendMessage]);

        return (
            <>
                <Flex direction={'column'} h={'100vh'}>
                    <Header/>
                    <ProtectedComponent {...props} />
                </Flex>
            </>);
    };
}
