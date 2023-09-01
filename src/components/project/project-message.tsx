import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {Box, Button, Flex, Heading, Text} from "@chakra-ui/react";
import {CloseIcon} from "@chakra-ui/icons";
import {Time} from "@/components/common";
import {
    DownloadIcon,
    ForwardIcon,
    ReplyIcon,
} from "@/icons";
import Image from "next/image";
import {StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    getAttachmentDownloadUrl,
    getMessageAttachments,
    getMessageParts,
    updateMessageState
} from "@/redux/messages/action-reducer";
import {Message as MessageModel, MessageDraft, MessagePart, MessageAttachments} from "@/models";
import {MessagesHeader} from "@/components/inbox/messages/messages-header";
import {updateDraftState} from "@/redux/draft/action-reducer";
import {ProjectReplyBox} from "@/components/project/project-reply-box";

export function ProjectMessage() {
    const [messageContent, setMessageContent] = useState<MessageModel>();
    const [index, setIndex] = useState<number | null>(null);
    const [emailPart, setEmailPart] = useState<string>("");
    const [hideAndShowReplyBox, setHideAndShowReplyBox] = useState<boolean>(false);
    const [replyType, setReplyType] = useState<string>('');
    const [messageSenders, setMessageSenders] = useState<string[]>([]);
    const [inboxMessages, setInboxMessages] = useState<MessageModel[]>([]);
    const {
        messages,
        messagePart,
        isCompose,
        isLoading,
        message,
        messageAttachments,
        selectedMessage,
        attachmentUrl
    } = useSelector((state: StateType) => state.messages);
    const {selectedThread} = useSelector((state: StateType) => state.threads);
    const [cacheMessages, setCacheMessages] = useState<{ [key: string]: { body: MessagePart, attachments: MessageAttachments[] } }>({});

    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedThread && selectedThread?.id) {
            setIndex(null);
            setHideAndShowReplyBox(false);
            dispatch(updateMessageState({messages: selectedThread.messages}));
        }
    }, [dispatch, selectedThread])

    useEffect(() => {
        if (messages && messages.length > 0) {
            // remove draft messages and set index to last inbox message
            const inboxMessages: MessageModel[] = messages.filter((msg: MessageModel) => !(msg.mailboxes || []).includes('DRAFT'));
            setInboxMessages(inboxMessages);
            const draftMessage = messages.findLast((msg: MessageModel) => (msg.mailboxes || []).includes('DRAFT'));
            if (draftMessage) {
                dispatch(updateDraftState({draft: draftMessage as MessageDraft}));
            }
            setIndex(val => !val ? inboxMessages.length - 1 : val);
        }
    }, [messages, dispatch])


    const cacheMessage = useCallback((body: Object | any) => {
        if (index !== null && inboxMessages && inboxMessages[index]) {
            setCacheMessages(prev => ({
                ...prev,
                [inboxMessages[index].id]: {
                    ...prev[inboxMessages[index].id],
                    ...body
                }
            }))
        }
    }, [index, inboxMessages])


    useEffect(() => {
        if (messagePart && messagePart.data) {
            cacheMessage({body: messagePart});
            let decoded = Buffer.from(messagePart.data || '', 'base64').toString('ascii');
            const blob = new Blob([decoded], {type: "text/html"});
            const blobUrl = window.URL.createObjectURL(blob);
            setEmailPart(blobUrl);
        } else {
            cacheMessage({body: {data: ''}});
            setEmailPart('')
        }
    }, [messagePart, cacheMessage])

    useEffect(() => {
        // convert blob url to image url
        if (messageAttachments && messageAttachments.length) {
            cacheMessage({attachments: messageAttachments});
        } else {
            cacheMessage({attachments: []});
        }
    }, [messageAttachments, cacheMessage])

    useEffect(() => {
        if (index !== null && inboxMessages && inboxMessages.length > 0) {
            if (inboxMessages[index]) {
                setMessageContent(inboxMessages[index]);
                setMessageSenders([inboxMessages[index].from, ...(inboxMessages[index].cc || [])].filter(t => t))
                dispatch(updateMessageState({selectedMessage: inboxMessages[index]}));
                // We already set index to last inbox message
                if (cacheMessages[inboxMessages[index].id] && cacheMessages[inboxMessages[index].id].body) {
                    dispatch(updateMessageState({messagePart: cacheMessages[inboxMessages[index].id].body}));
                } else {
                    dispatch(getMessageParts({id: inboxMessages[index].id}));
                }
                if (cacheMessages[inboxMessages[index].id] && cacheMessages[inboxMessages[index].id].attachments) {
                    dispatch(updateMessageState({messageAttachments: cacheMessages[inboxMessages[index].id].attachments}));
                } else {
                    dispatch(getMessageAttachments({id: inboxMessages[index].id}));
                }

            }
        }
    }, [dispatch, index, inboxMessages])

    useEffect(() => {
        if (message) {
            setMessageContent(message);
        }
    }, [message])

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
            dispatch(updateMessageState({attachmentUrl: null}));
        }
    }, [dispatch, attachmentUrl])


    const showPreNextMessage = (type: string) => {
        if (type === 'up') {
            if (index && index > 0) {
                setIndex(prevState => prevState ? (prevState - 1) : null);
            }
        } else if (type === 'down') {
            if (inboxMessages && inboxMessages.length - 1 !== index) {
                setIndex(prevState => prevState || prevState === 0 ? (prevState + 1) : 0);
            }
        }
    }

    const closeCompose = () => {
        setHideAndShowReplyBox(false)
        setReplyType('');
        dispatch(updateMessageState({isCompose: false}));
    }


    const hideAndShowReplayBox = (type: string = '') => {
        setReplyType(type);
        setHideAndShowReplyBox(!hideAndShowReplyBox);
    }

    const downloadImage = (item: MessageAttachments) => {
        if (selectedMessage && selectedMessage.id) {
            dispatch(getAttachmentDownloadUrl({id: selectedMessage.id, attachment: item.id}));
        }
    }

    return (
        <Box className={styles.mailBox}>
            {!selectedThread && !isCompose &&
            <Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'}
                  height={'100%'}>
                <Heading as='h3' size='md'>Click on a thread from list to view messages!</Heading>
            </Flex>}
            {selectedThread && !isCompose &&
            <Flex justifyContent={'space-between'} flexDir={'column'} height={'100%'}>
                {!hideAndShowReplyBox &&
                <>
                    <MessagesHeader inboxMessages={inboxMessages} index={index} closeCompose={closeCompose}
                                    showPreNextMessage={showPreNextMessage} herderType={'projects'}/>
                    {messageContent &&
                    <Flex alignItems={'center'} padding={'10px 20px'}>
                        <Image src={'/image/user.png'} alt={''} width={50} height={50}/>
                        <Flex flexDir={'column'} marginLeft={'5'} width={'100%'}>
                            <Heading as='h4' size='md'>{messageContent?.subject || '(no subject)'}</Heading>
                            <Flex justifyContent={'space-between'} align={'center'}>
                                {messageSenders && messageSenders.length > 0 &&
                                <Text fontSize='sm'>
                                    {messageSenders[0]} {messageSenders.length - 1 > 0 && `and ${messageSenders.length - 1} others`}
                                </Text>
                                }
                                <div className={styles2.receiveTime}>
                                    <Time time={messageContent?.created || ''} isShowFullTime={true}/>
                                </div>
                            </Flex>
                        </Flex>
                    </Flex>
                    }
                    <div className={`${styles.mailBodyContent} ${styles.projectMailBodyContent}`}>
                        {(!isLoading && emailPart) && <iframe src={emailPart} className={styles.mailBody}/>}
                    </div>
                    {messageAttachments && !!messageAttachments.length && messageAttachments?.map((item: MessageAttachments, i: number) => (
                        <div className={styles.mailBodyAttachments} key={i}>
                            <Flex align={'center'} key={i} className={styles.attachmentsFile}>
                                {item.filename}
                                <div className={`${styles.closeIcon} ${styles.downloadIcon}`}
                                     onClick={() => downloadImage(item)}>
                                    <DownloadIcon/>
                                </div>
                            </Flex>
                        </div>
                    ))}
                    <Flex align={'center'} padding={'10px 20px'}>
                        <Button className={styles.hideButton} variant='outline'
                                onClick={() => hideAndShowReplayBox('reply')}>
                            <ReplyIcon/> Reply
                        </Button>
                        <Button className={styles.hideButton} variant='outline'
                                onClick={() => hideAndShowReplayBox('reply-all')}>
                            <ReplyIcon/> Reply All
                        </Button>
                        <Button className={styles.forwardButton} variant='outline'
                                onClick={() => hideAndShowReplayBox('forward')}>
                            <ForwardIcon/> Forward
                        </Button>
                    </Flex>
                </>
                }

                {hideAndShowReplyBox && <div className={styles.replayBox}>
                    <Flex justifyContent={'space-between'} flexDir={'column'} height={'100%'}>
                        <div className={styles.mailBoxFLex}>
                            <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                                  borderBottom={'1px solid rgba(8, 22, 47, 0.1)'} padding={'12px 20px'}>
                                <Flex alignItems={'center'} gap={2}>
                                    <div className={styles.closeIcon} onClick={() => closeCompose()}>
                                        <CloseIcon/>
                                    </div>
                                </Flex>
                            </Flex>
                        </div>

                        <ProjectReplyBox replyType={replyType} emailPart={(messagePart?.data || '')} onClose={closeCompose}/>
                    </Flex>
                </div>}
            </Flex>
            }

            {isCompose &&
            <div className={styles.composeReplyBox}>
                <Flex justifyContent={'space-between'} flexDir={'column'} height={'100%'}>
                    <div className={styles.mailBoxFLex}>
                        <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                              borderBottom={'1px solid rgba(8, 22, 47, 0.1)'} padding={'12px 20px'}>
                            <Flex alignItems={'center'} gap={2}>
                                <div className={styles.closeIcon} onClick={() => closeCompose()}>
                                    <CloseIcon/>
                                </div>
                            </Flex>
                        </Flex>
                    </div>

                    <ProjectReplyBox onClose={closeCompose}/>
                </Flex>
            </div>}
        </Box>
    )
}
