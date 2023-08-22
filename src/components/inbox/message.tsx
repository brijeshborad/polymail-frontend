import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {Box, Button, Flex, Heading, Text, Tooltip} from "@chakra-ui/react";
import {CheckIcon, ChevronDownIcon, ChevronUpIcon, CloseIcon, WarningIcon} from "@chakra-ui/icons";
import {Time} from "@/components/common";
import {
    ArchiveIcon,
    FolderIcon,
    ForwardIcon,
    ReplyIcon,
    StarIcon,
    TimeSnoozeIcon,
    TrashIcon,
    BlueStarIcon
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
import {ReplyBox} from "@/components/inbox/reply-box";
import {updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {Message as MessageModel, MessageDraft, MessagePart, Thread, MessageAttachments} from "@/models";

export function Message() {
    const [messageContent, setMessageContent] = useState<MessageModel>();
    const [index, setIndex] = useState<number | null>(null);
    const [emailPart, setEmailPart] = useState<string>("");
    const [emailAttachments, setEmailAttachments] = useState<MessageAttachments[]>([]);
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
        attachmentUrl,
        selectedMessage
    } = useSelector((state: StateType) => state.messages);
    const {selectedThread, threads} = useSelector((state: StateType) => state.threads);
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
                dispatch(updateMessageState({draft: draftMessage as MessageDraft}));
            }
            setIndex(val => !val ? inboxMessages.length - 1 : val);
        }
    }, [messages, dispatch])


    const cacheMessage = useCallback((body: Object | any) => {
        if (index !== null && messages && messages[index]) {
            setCacheMessages(prev => ({
                ...prev,
                [messages[index].id]: {
                    ...prev[messages[index].id],
                    ...body
                }
            }))
        }
    }, [index, messages])


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
            setEmailAttachments((prevState) => (prevState || []).concat(messageAttachments));
        } else {
            cacheMessage({attachments: []});
            setEmailAttachments([])
        }
    }, [messageAttachments, cacheMessage])


    useEffect(() => {
        if (index !== null && inboxMessages && inboxMessages.length > 0) {
            if (inboxMessages[index]) {
                setMessageContent(inboxMessages[index]);
                setMessageSenders([inboxMessages[index].from, ...(inboxMessages[index].cc || [])])
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
    }, [cacheMessages, dispatch, index, inboxMessages])


    useEffect(() => {
        if (message) {
            setMessageContent(message);
        }
    }, [message])


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


    const onClose = () => {
        setHideAndShowReplyBox(false)
        if (replyType.length) {
            dispatch(updateThreadState({selectedThread: selectedThread}));
        } else {
            dispatch(updateThreadState({selectedThread: null}));
        }
        setReplyType('')
        dispatch(updateMessageState({isCompose: false}));
    }


    const updateMailBox = (messageBox: string) => {
        if (selectedThread && selectedThread.id) {
            if (messageBox) {
                let currentThreads = [...threads || []] as Thread[];
                let threadData = {...(selectedThread) || {}} as Thread;
                let index1 = currentThreads.findIndex((item: Thread) => item.id === threadData?.id);

                let body = {
                    mailboxes: ['']
                };
                let data = selectedThread.mailboxes || [];
                if (selectedThread.mailboxes?.includes(messageBox)) {

                    let newData = data.filter((item: string) => item !== messageBox)
                    body = {
                        mailboxes: [
                            ...newData
                        ]
                    }
                } else {
                    body = {
                        mailboxes: [
                            ...data,
                            messageBox
                        ]
                    }
                }
                currentThreads[index1] = {
                    ...currentThreads[index1],
                    mailboxes: body?.mailboxes || []
                };
                dispatch(updateThreadState({threads: currentThreads, selectedThread: currentThreads[index1]}));
                dispatch(updateThreads({id: selectedThread.id, body}));
            }
        }
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
            {selectedThread && !isCompose &&
            <Flex justifyContent={'space-between'} flexDir={'column'} height={'100%'}>
                {!hideAndShowReplyBox &&
                <Flex direction={'column'} className={styles.mailBoxFLex}>
                    <div style={{flex: 'none'}}>
                        <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                              borderBottom={'1px solid rgba(8, 22, 47, 0.1)'}
                              marginBottom={'15'} padding={'12px 20px'}>
                            <Flex alignItems={'center'} gap={2}>
                                <div className={styles.closeIcon} onClick={() => onClose()}><CloseIcon/>
                                </div>
                                <div className={`${styles.actionIcon} ${index === 0 ? styles.disabled : ''}`}
                                     onClick={() => showPreNextMessage('up')}>
                                    <ChevronUpIcon/>
                                </div>
                                <div
                                    className={`${styles.actionIcon} ${inboxMessages && inboxMessages?.length - 1 !== index ? '' : styles.disabled}`}
                                    onClick={() => showPreNextMessage('down')}>
                                    <ChevronDownIcon/>
                                </div>

                            </Flex>

                            <Flex alignItems={'center'} gap={3} className={styles.headerRightIcon}>
                                {!isLoading && <Text className={styles.totalMessages}>
                                    {index ? index + 1 : 1} / {inboxMessages && inboxMessages.length}
                                </Text>}
                                <Button className={styles.addToProject} leftIcon={<FolderIcon/>}>Add to
                                    Project <span
                                        className={styles.RightContent}>⌘P</span></Button>
                                <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>
                                    <div onClick={() => updateMailBox('ARCHIVE')}>
                                        <ArchiveIcon/>
                                    </div>
                                </Tooltip>
                                <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>
                                    <div onClick={() => updateMailBox('TRASH')}>
                                        <TrashIcon/>
                                    </div>
                                </Tooltip>
                                <Tooltip label='Snooze' placement='bottom' bg='gray.300' color='black'>
                                    <div onClick={() => updateMailBox('SNOOZE')}>
                                        <TimeSnoozeIcon/>
                                    </div>
                                </Tooltip>

                                <Tooltip label='Mark as unread' placement='bottom' bg='gray.300' color='black'>
                                    <div onClick={() => updateMailBox('UNREAD')}>
                                        <CheckIcon className={styles.colorGray}/>
                                    </div>
                                </Tooltip>

                                <Tooltip
                                    label={(selectedThread?.mailboxes || []).includes('STARRED') ? 'Starred' : 'Not Starred'}
                                    placement='bottom' bg='gray.300' color='black'>
                                    <div onClick={() => updateMailBox('STARRED')}>
                                        {(selectedThread?.mailboxes || []).includes('STARRED') && <BlueStarIcon/>}
                                        {!(selectedThread?.mailboxes || []).includes('STARRED') && <StarIcon/>}
                                    </div>
                                </Tooltip>

                                <Tooltip
                                    label={(selectedThread?.mailboxes || []).includes('SPAM') ? 'Spammed' : 'Mark As Spam'}
                                    placement='bottom' bg='gray.300' color='black'>
                                    <div onClick={() => updateMailBox('SPAM')}>
                                        <WarningIcon className={styles.colorGray}/>
                                    </div>
                                </Tooltip>
                            </Flex>
                        </Flex>

                        {messageContent &&
                        <Flex alignItems={'center'} padding={'10px 20px'}>
                            <Image src={'/image/user.png'} alt={''} width={50} height={50}/>
                            <Flex flexDir={'column'} marginLeft={'5'} width={'100%'}>
                                <Heading as='h4' size='md'>{messageContent?.subject || ''}</Heading>
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
                        </Flex>}
                    </div>
                    <div className={styles.mailBodyContent}>
                        {(!isLoading && emailPart) && <iframe src={emailPart} className={styles.mailBody}/>}
                        {messageAttachments && !!messageAttachments.length && messageAttachments?.map((item: MessageAttachments, i) => (
                            <p key={i + 1} onClick={() => downloadImage(item)}>{item.filename}</p>))}
                    </div>
                </Flex>}

                {!hideAndShowReplyBox &&
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
                </Flex>}

                {hideAndShowReplyBox && <div className={styles.replayBox}>
                    <Flex justifyContent={'space-between'} flexDir={'column'} height={'100%'}>
                        <div className={styles.mailBoxFLex}>
                            <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                                  borderBottom={'1px solid rgba(8, 22, 47, 0.1)'} padding={'12px 20px'}>
                                <Flex alignItems={'center'} gap={2}>
                                    <div className={styles.closeIcon} onClick={() => onClose()}>
                                        <CloseIcon/>
                                    </div>
                                </Flex>
                            </Flex>
                        </div>

                        <ReplyBox replyType={replyType} emailPart={(messagePart?.data || '')}/>
                    </Flex>
                </div>}
            </Flex>
            }

            {!selectedThread && !isCompose &&
            <Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'}
                  height={'100%'}>
                <Heading as='h3' size='md'>Click on a thread from list to view messages!</Heading>
            </Flex>}

            {isCompose &&
            <div className={styles.composeReplyBox}>
                <Flex justifyContent={'space-between'} flexDir={'column'} height={'100%'}>
                    <div className={styles.mailBoxFLex}>
                        <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                              borderBottom={'1px solid rgba(8, 22, 47, 0.1)'} padding={'12px 20px'}>
                            <Flex alignItems={'center'} gap={2}>
                                <div className={styles.closeIcon} onClick={() => onClose()}>
                                    <CloseIcon/>
                                </div>
                            </Flex>
                        </Flex>
                    </div>

                    <ReplyBox/>
                </Flex>
            </div>}
        </Box>
    )
}
