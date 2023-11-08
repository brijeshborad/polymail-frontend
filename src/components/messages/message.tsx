import styles from "@/styles/Inbox.module.css";
import {
    Box, createStandaloneToast,
    Flex,
    Heading, Text,
} from "@chakra-ui/react";
import {StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {Message as MessageModel} from "@/models";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import dynamic from "next/dynamic";
import {InboxLoader} from "@/components/loader-screen/inbox-loader";
import {globalEventService, keyNavigationService, messageService, threadService} from "@/services";
import {Toaster} from "../common";
import {debounce, generateToasterId} from "@/utils/common.functions";
import {MuteIcon} from "@/icons";
// import {clearDebounce, debounce} from "@/utils/common.functions";

const SelectedThreads = dynamic(() => import('@/components/threads/selected-threads').then((mod) => mod.default));
const MessagesHeader = dynamic(() => import('@/components/messages/messages-header').then(mod => mod.MessagesHeader));
const MessageBox = dynamic(() => import('@/components/messages/message-box').then(mod => mod.MessageBox));
const MessageReplyBox = dynamic(() => import('@/components/messages/message-reply-box').then(mod => mod.MessageReplyBox));
const ComposeBox = dynamic(() => import('@/components/inbox/compose-box').then(mod => mod.ComposeBox));
const {toast} = createStandaloneToast()
let previousToastId: string = '';

export function Message({isProjectView = false}: { isProjectView?: boolean }) {
    const messagesWrapperRef = React.useRef<HTMLDivElement | null | any>(null);
    const {
        attachmentUrl,
        showMessageBox: isShowingMessageBox
    } = useSelector((state: StateType) => state.messages);
    const {
        selectedThread,
        isLoading: threadLoading,
        isThreadFocused,
        tabValue, multiSelection
    } = useSelector((state: StateType) => state.threads);
    const {target, messageIndex} = useSelector((state: StateType) => state.keyNavigation)
    const {isLoading: accountLoading} = useSelector((state: StateType) => state.accounts);
    const {isLoading: organizationLoading} = useSelector((state: StateType) => state.organizations);
    const {isLoading: usersProfilePictureLoading} = useSelector((state: StateType) => state.users);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {isLoading: projectsLoading} = useSelector((state: StateType) => state.projects);
    const {isLoading: summaryLoading, syncingEmails, isComposing} = useSelector((state: StateType) => state.commonApis);
    const [isLoaderShow, setIsLoaderShow] = useState<boolean>(false);
    const [showScrollBar, setShowScrollBar] = useState<boolean>(false);

    // const handleScroll = useCallback(() => {
    //     // const container = messagesWrapperRef.current;
    //     // const scrollHeight = container?.scrollHeight;
    //     // const containerHeight = container?.clientHeight;
    //     // const scrollBottom = scrollHeight - containerHeight - messagesWrapperRef.current.scrollTop;
    //     // if (scrollBottom < 2) {
    //     //     clearDebounce('REPLY_BOX_SCROLL');
    //     //     debounce(() => {
    //     //         messagesWrapperRef.current.focus();
    //     //         globalEventService.fireEvent({data: {body: null}, type: 'replybox.show'});
    //     //     }, 10, 'REPLY_BOX_SCROLL')
    //     // }
    // }, []);

    useEffect(() => {
        if (!threadLoading && !accountLoading && !organizationLoading && !usersProfilePictureLoading && !projectsLoading && !summaryLoading && !syncingEmails) {
            setIsLoaderShow(false)
        } else {
            setIsLoaderShow(true)
        }
    }, [threadLoading, accountLoading, organizationLoading, usersProfilePictureLoading, projectsLoading, summaryLoading, syncingEmails])

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

    useEffect(() => {
        if (attachmentUrl) {
            const link: HTMLAnchorElement = document.createElement('a');
            link.href = attachmentUrl.url!;
            link.setAttribute('download', '');
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            document.body.appendChild(link);
            link.click();
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            messageService.setMessageState({attachmentUrl: null})
        }
    }, [attachmentUrl])

    useEffect(() => {
        // if (target === 'thread') {
        //     const topPos = ((messageIndex || 0)) * 95
        //
        //     setTimeout(() => {
        //         if (messagesWrapperRef && messagesWrapperRef.current && messagesWrapperRef.current.scrollTop) {
        //             messagesWrapperRef.current.scrollTo({
        //                 top: topPos,
        //                 behavior: 'smooth'
        //             })
        //         }
        //     }, 1200)
        // }
    }, [target, messageIndex])

    useEffect(() => {
        const handleShortcutKeyPress = (e: KeyboardEvent | any) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key == ',' || e.key == '<')) {
                e.preventDefault();
                navigator.clipboard.writeText(window.location.toString())
                if (previousToastId) {
                    toast.close(previousToastId);
                }
                previousToastId = generateToasterId();
                Toaster({
                    id: previousToastId,
                    type: 'success',
                    title: 'Thread URL has been copied to clipboard.',
                    desc: 'Paste this wherever you please'
                })
            }
        };
        window.addEventListener('keydown', handleShortcutKeyPress);
        return () => {
            window.removeEventListener('keydown', handleShortcutKeyPress);
        };
    }, []);

    const handleScroll = useCallback(() => {
        setShowScrollBar(true);
        debounce(() => setShowScrollBar(false), 500, 'MESSAGE_LIST_SCROLLBAR');
    }, [])

    const hideAndShowReplyBox = (type: string = '', messageData: MessageModel) => {
        globalEventService.fireEvent({data: messageData, type: 'draft.currentMessage'})
        setTimeout(() => {
            globalEventService.fireEvent({type: 'draft.updateType', data: {type, messageData}})
        }, 100)
    }

    function showBlankPage() {
        return (
            <Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'}
                  height={'100%'}>
                <Heading as='h3' size='md' color={'rgba(0, 0, 0, 0.2)'}>Enjoy the beauty of white space.</Heading>
            </Flex>
        )
    }

    function showLoader() {
        return (
            <Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'}
                  height={'100%'}>
                {!syncingEmails && <Flex direction={'column'} gap={2} flex={1} w={'100%'}>
                    <SkeletonLoader skeletonLength={1} height={'100%'}/>
                </Flex>}
                {syncingEmails && <InboxLoader loaderPercentage={syncingEmails}/>}
            </Flex>
        );
    }

    function showMessageBox() {
        return (
            <Box
                className={`${styles.mailBox} ${isThreadFocused ? styles.mailBoxFocused : ''}`}
                height={'calc(100vh - 157px)'} overflow={'hidden'} borderRadius={'15px'}
                onClick={() => {
                    if (!isThreadFocused) {
                        setThreadFocus(true);
                        keyNavigationService.setKeyNavigationState({
                            action: 'RIGHT',
                            target: 'thread'
                        })
                    }
                }}>
                {isLoaderShow && showLoader()}
                {!isLoaderShow && showMessage()}
            </Box>
        )
    }

    function getMuteStatus() {
        if (selectedThread && selectedThread.mute) {
            return <Flex align={'center'} px={'20px'} pt={'20px'} position={'sticky'} top={0}>
                <MuteIcon color={'#67074A'}/>
                <Text fontSize={'13px'} color={'#67074A'} mt={'1px'}>
                    This conversation has been muted. You will not receive notifications for new messages.
                </Text>
            </Flex>
        }
        return null
    }

    function showMessage() {
        return (
            <>
                {!selectedThread && showBlankPage()}
                {selectedThread && <Flex flexDir={'column'} height={'100%'}>
                    <>
                        {/*    onScroll={() => handleScroll()}*/}
                        {/*    onWheel={(event) => {*/}
                        {/*    if (event.deltaY > 0) {*/}
                        {/*        handleScroll()*/}
                        {/*    }*/}
                        {/*}}*/}
                        <MessagesHeader/>
                        {getMuteStatus()}
                        {isShowingMessageBox &&
                        <Flex ref={messagesWrapperRef} onScroll={handleScroll} padding={'20px'} gap={5} direction={'column'} flex={1}
                              overflowY={'scroll'} overflowX={'hidden'} className={`${styles.messageListscrollbar} ${showScrollBar ? styles.messageScrollBar : ''}`}>
                            <Flex gap={2} direction={'column'} height={'100%'}>
                                <div className={styles.mailBoxMailList}>
                                    <MessageBox hideAndShowReplyBox={hideAndShowReplyBox}/>
                                </div>
                                <MessageReplyBox
                                    isProjectView={isProjectView}
                                    hideAndShowReplyBox={hideAndShowReplyBox}/>
                            </Flex>
                        </Flex>}
                    </>
                </Flex>
                }
            </>
        )
    }

    return (
        <>
            {multiSelection && multiSelection.length > 0 ? <SelectedThreads/> :
                <>
                    {!isComposing && showMessageBox()}
                    {isComposing && <ComposeBox tabValue={tabValue} isProjectView={isProjectView}/>}
                </>
            }
        </>
    )
}
