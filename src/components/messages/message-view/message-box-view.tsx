import {Box, Button} from "@chakra-ui/react";
import {ArrowBackIcon} from "@chakra-ui/icons";
import {keyNavigationService, threadService} from "@/services";
import styles from "@/styles/Inbox.module.css";
import React, {useCallback, useEffect} from "react";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {MessageBoxContent} from "@/components/messages/message-view/message-box-content";

    export function MessageBoxView({isProjectView = false}: { isProjectView?: boolean }) {
    const {isThreadFocused, selectedThread} = useSelector((state: StateType) => state.threads);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);

    const setThreadFocus = useCallback((focused: boolean) => {
        if (selectedThread) {
            threadService.toggleThreadFocused(focused);
            threadService.makeThreadAsRead(selectedThread);
        }
    }, [selectedThread])

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setThreadFocus(true)
        }
    }, [incomingEvent, setThreadFocus]);

    return (
        <>
            {/*<Button className={'backToThread'} minW={'1px'} variant='outline' border={'1px solid #E5E7EB'}*/}
            {/*        fontSize={'13px'} fontWeight={500} letterSpacing={'-0.13px'} borderRadius={'50px'} width={'36px'}*/}
            {/*        height={'36px'} backgroundColor={'#FFFFFF'} alignItems={'center'} justifyContent={'center'}*/}
            {/*        leftIcon={<ArrowBackIcon/>} onClick={() => threadService.setSelectedThread(null)}>*/}
            {/*    /!*Back To Threads*!/*/}
            {/*</Button>*/}
            <Box
                className={`${styles.mailBox} ${isThreadFocused ? styles.mailBoxFocused : ''}`}
                overflow={'hidden'} borderRadius={'15px'}
                onClick={() => {
                    if (!isThreadFocused) {
                        setThreadFocus(true);
                        keyNavigationService.setKeyNavigationState({
                            action: 'RIGHT',
                            target: 'thread'
                        })
                    }
                }}>
                <MessageBoxContent isProjectView={isProjectView}/>
            </Box>
        </>
    )
}
