import styles from "@/styles/Inbox.module.css";
import {
    Box,
    Flex,
    Heading,
} from "@chakra-ui/react";
import {StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    getMessageAttachments,
    getMessageParts
} from "@/redux/messages/action-reducer";
import {Message as MessageModel} from "@/models";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import dynamic from "next/dynamic";
import {getCacheMessages, setCacheMessages} from "@/utils/cache.functions";
import {InboxLoader} from "@/components/loader-screen/inbox-loader";
import {globalEventService, keyNavigationService, messageService, threadService} from "@/services";
import { Toaster } from "../common";

const MessagesHeader = dynamic(() => import('@/components/messages/messages-header').then(mod => mod.MessagesHeader));
const MessageBox = dynamic(() => import('@/components/messages/message-box').then(mod => mod.MessageBox));
const MessageReplyBox = dynamic(() => import('@/components/messages/message-reply-box').then(mod => mod.MessageReplyBox));
const ComposeBox = dynamic(() => import('@/components/inbox/compose-box').then(mod => mod.ComposeBox));

let preventOpen: boolean = false;

export function Message({isProjectView = false}: { isProjectView?: boolean }) {
    const messagesWrapperRef = React.useRef<HTMLDivElement | null | any>(null);

    const [index, setIndex] = useState<number | null>(null);
    const [replyTypeName, setReplyTypeName] = useState<string>('Reply');
    const [inboxMessages, setInboxMessages] = useState<MessageModel[]>([]);
    const {
        messages,
        messagePart,
        selectedMessage,
        attachmentUrl,
        messageAttachments,
        showMessageBox: isShowingMessageBox
    } = useSelector((state: StateType) => state.messages);
    const {
        selectedThread,
        isLoading: threadLoading,
        isThreadFocused,
        tabValue
    } = useSelector((state: StateType) => state.threads);
    const {target, messageIndex} = useSelector((state: StateType) => state.keyNavigation)
    const {isLoading: accountLoading} = useSelector((state: StateType) => state.accounts);
    const {isLoading: organizationLoading} = useSelector((state: StateType) => state.organizations);
    const {isLoading: usersProfilePictureLoading} = useSelector((state: StateType) => state.users);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {isLoading: projectsLoading} = useSelector((state: StateType) => state.projects);
    const {isLoading: summaryLoading, syncingEmails, isComposing} = useSelector((state: StateType) => state.commonApis);
    const [isLoaderShow, setIsLoaderShow] = useState<boolean>(false);
    const [emailPart, setEmailPart] = useState<string>("");

    const dispatch = useDispatch();

    useEffect(() => {
        if (!threadLoading && !accountLoading && !organizationLoading && !usersProfilePictureLoading && !projectsLoading && !summaryLoading && !syncingEmails) {
            setIsLoaderShow(false)
        } else {
            setIsLoaderShow(true)
        }
    }, [threadLoading, accountLoading, organizationLoading, usersProfilePictureLoading, projectsLoading, summaryLoading, syncingEmails])

    useEffect(() => {
        if (selectedThread && selectedThread?.id) {
            setIndex(null);
            globalEventService.fireEvent({data: null, type: 'draft.currentMessage'})
            globalEventService.fireEvent({data: {type: 'reply'}, type: 'draft.updateType'})
            messageService.setMessages(selectedThread.messages || []);
        }
    }, [dispatch, selectedThread])

    useEffect(() => {
        if (messages && messages.length > 0) {
            // remove draft messages and set index to last inbox message
            const currentInboxMessages: MessageModel[] = messages.filter((msg: MessageModel) => !(msg.mailboxes || []).includes('DRAFT'));
            setInboxMessages([...currentInboxMessages]);
            if (preventOpen) {
                preventOpen = false;
            } else {
                setIndex(currentInboxMessages.length - 1);
            }
            globalEventService.fireEvent({data: currentInboxMessages[currentInboxMessages.length - 1], type: 'draft.currentMessage'})
        }
    }, [messages, dispatch])

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

    const cacheMessage = useCallback((body: Object | any) => {
        if (index === null) {
            return;
        }
        let messageId = inboxMessages[index]?.id;
        if (messageId) {
            let cacheMessages = getCacheMessages();
            setCacheMessages({
                ...cacheMessages,
                [messageId]: {
                    ...cacheMessages[messageId],
                    ...body
                }
            })
        }
    }, [inboxMessages, index])

    useEffect(() => {
        if (index !== null && inboxMessages && inboxMessages.length > 0) {
            if (inboxMessages[index]) {
                messageService.setSelectedMessage(inboxMessages[index]);
                // We already set index to last inbox message
                let cacheMessages: any = getCacheMessages();
                if (cacheMessages[inboxMessages[index].id!] && cacheMessages[inboxMessages[index].id!].data) {
                    messageService.setMessageBody({data: cacheMessages[inboxMessages[index].id!].data})
                } else {
                    dispatch(getMessageParts({body: {id: inboxMessages[index].id!}}));
                }
                if (cacheMessages[inboxMessages[index].id!] && cacheMessages[inboxMessages[index].id!].attachments) {
                    messageService.setMessageAttachments(cacheMessages[inboxMessages[index].id!].attachments)
                } else {
                    dispatch(getMessageAttachments({body: {id: inboxMessages[index].id!}}));
                }

            }
        }
    }, [dispatch, index, inboxMessages])

    useEffect(() => {
        if (messagePart && messagePart.data) {
            cacheMessage({data: messagePart.data});
            let decoded = Buffer.from(messagePart.data || '', 'base64').toString();
            let addTargetBlank = decoded.replace(/<a/g, '<a target="_blank"');
            const blob = new Blob([addTargetBlank], {type: "text/html"});
            const blobUrl = window.URL.createObjectURL(blob);
            setEmailPart(blobUrl);
        } else {
            cacheMessage({data: ''});
            setEmailPart('')
        }
    }, [cacheMessage, messagePart])

    useEffect(() => {
        // convert blob url to image url
        if (messageAttachments && messageAttachments.length) {
            cacheMessage({attachments: messageAttachments});
        } else {
            cacheMessage({attachments: []});
        }
    }, [cacheMessage, messageAttachments])

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
        if (target === 'thread') {
            const topPos = ((messageIndex || 0)) * 95

            setTimeout(() => {
                if (messagesWrapperRef && messagesWrapperRef.current && messagesWrapperRef.current.scrollTop) {
                    messagesWrapperRef.current.scrollTo({
                        top: topPos,
                        behavior: 'smooth'
                    })
                }
            }, 1200)
        }
    }, [target, messageIndex])

    useEffect(() => {
        const handleShortcutKeyPress = (e: KeyboardEvent | any) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key == ',') {
                e.preventDefault();
                navigator.clipboard.writeText(window.location.toString())
                Toaster({
                  type: 'success',
                  title: 'Thread url copied',
                  desc: window.location.toString().substring(0,40) + '...'
                })
            }
        };
        window.addEventListener('keydown', handleShortcutKeyPress);
        return () => {
            window.removeEventListener('keydown', handleShortcutKeyPress);
        };
    }, []);


    const hideAndShowReplyBox = (type: string = '', messageData: MessageModel) => {
        if (type === 'reply') {
            setReplyTypeName('Reply')
        } else if (type === 'reply-all') {
            setReplyTypeName('Reply All')
        } else {
            setReplyTypeName('Forward')
        }
        globalEventService.fireEvent({data: messageData, type: 'draft.currentMessage'})
        setTimeout(() => {
            globalEventService.fireEvent({type: 'draft.updateType', data: {type, messageData, emailParts: (messagePart?.data || '')}})
        }, 100)
    }

    const handleRowClick = (index: any) => {
        setIndex(index);
        const selectedMessageIndex = (messages || []).filter(msg => !(msg.mailboxes || []).includes('DRAFT')).findIndex(msg => msg.id === selectedMessage?.id)

        if (selectedMessageIndex === index) {
            // Clicking on an already expanded row, so close it
            messageService.setSelectedMessage(null)
            setIndex(null)
        } else {
            // Clicking on a new row, expand it
            const targetMessage = (messages || [])[index]
            messageService.setSelectedMessage(targetMessage)
        }
    };

    function showBlankPage() {
        return (
            <Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'}
                  height={'100%'}>
                <Heading as='h3' size='md'>Click on a thread from list to view messages!</Heading>
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
                height={'calc(100vh - 165px)'} overflow={'hidden'} borderRadius={'15px'}
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

    function showMessage() {
        return (
            <>
                {!selectedThread && showBlankPage()}
                {selectedThread && isShowingMessageBox && <Flex flexDir={'column'} height={'100%'}>
                    <>
                        <MessagesHeader inboxMessages={inboxMessages} index={index}
                                        headerType={'inbox'}/>

                        <Flex ref={messagesWrapperRef} padding={'20px'} gap={5} direction={'column'} flex={1}
                              overflowY={'scroll'} overflowX={'hidden'}>
                            <Flex gap={2} direction={'column'} height={'100%'}>
                                <div className={styles.mailBoxMailList}>
                                    {inboxMessages && !!inboxMessages.length && inboxMessages.map((item: any, inboxIndex: number) => (
                                        <div key={inboxIndex}>
                                            <MessageBox
                                                preventSelectingMessage={() => preventOpen = true}
                                                item={item} emailPart={emailPart}
                                                messageAttachments={messageAttachments}
                                                hideAndShowReplyBox={hideAndShowReplyBox}
                                                onClick={() => handleRowClick(inboxIndex)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <MessageReplyBox
                                    isProjectView={isProjectView}
                                    hideAndShowReplyBox={hideAndShowReplyBox} replyTypeName={replyTypeName}/>
                            </Flex>
                        </Flex>
                    </>
                </Flex>
                }
            </>
        )
    }

    return (
        <>
            {!isComposing && showMessageBox()}
            {isComposing && <ComposeBox tabValue={tabValue} isProjectView={isProjectView}/>}
        </>
    )
}
