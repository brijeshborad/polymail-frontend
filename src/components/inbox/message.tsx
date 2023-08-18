import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {Box, Button, Flex, Heading, Text, Tooltip} from "@chakra-ui/react";
import {CheckIcon, ChevronDownIcon, ChevronUpIcon, CloseIcon, WarningIcon} from "@chakra-ui/icons";
import {Time} from "@/components";
import {ArchiveIcon, FolderIcon, StarIcon, TimeSnoozeIcon, TrashIcon, ReplyIcon, ForwardIcon} from "@/icons";
import Image from "next/image";
import {StateType} from "@/types";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getMessageParts, updateMessageState} from "@/redux/messages/action-reducer";
import {SpinnerUI} from '@/components/spinner';
import {ReplyBox} from "@/components/inbox/reply-box";
import {updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {Message as MessageModel} from "@/models";
import {BlueStarIcon} from "@/icons/star-blue.icon";

export function Message() {
    const [messageContent, setMessageContent] = useState<MessageModel>();
    const [index, setIndex] = useState<number | null>(null);
    const [emailPart, setEmailPart] = useState<string>("");
    const {messages, messagePart, isCompose, isLoading, message} = useSelector((state: StateType) => state.messages);
    const {selectedThread} = useSelector((state: StateType) => state.threads);

    const dispatch = useDispatch();

    // const getAllThreadMessages = useCallback(() => {
    //     if (selectedThread && selectedThread?.id) {
    //         if (!cachedThreads[selectedThread.id]) {
    //             dispatch(getAllMessages({thread: selectedThread.id}));
    //             setHideAndShowReplyBox(false)
    //         } else {
    //             dispatch(updateMessageState({messages: cachedThreads[selectedThread.id]}));
    //         }
    //     }
    // }, [cachedThreads, dispatch, selectedThread])

    useEffect(() => {
        if (selectedThread && selectedThread?.id) {
            setIndex(null);
            setHideAndShowReplyBox(false);
            dispatch(updateMessageState({messages: selectedThread.messages}));
            //  getAllThreadMessages();
        }
    }, [dispatch, selectedThread])

    useEffect(() => {
        if (messages && messages.length > 0) {
            // remove draft messages and set index to last inbox message
            const inboxMessages: MessageModel[] = messages.filter((msg: MessageModel) => !(msg.mailboxes || []).includes('DRAFT'));
            setIndex(val => !val ? inboxMessages.length - 1 : val);
        }
    }, [messages])

    useEffect(() => {
        if (messagePart && messagePart.data) {
            let decoded = Buffer.from(messagePart.data || '', 'base64').toString('ascii');
            const blob = new Blob([decoded], {type: "text/html"});
            const blobUrl = window.URL.createObjectURL(blob);
            setEmailPart(blobUrl);
        } else {
            setEmailPart('')
        }
    }, [messagePart])

    useEffect(() => {
        if (index !== null && messages && messages.length > 0) {
            if (messages[index]) {
                setMessageContent(messages[index]);
                dispatch(updateMessageState({selectedMessage: messages[index]}));
                // We already set index to last inbox message
                dispatch(getMessageParts({id: messages[index].id}));

            }
        }
    }, [dispatch, index, messages])

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
            if (messages && messages.length - 1 !== index) {
                setIndex(prevState => prevState || prevState === 0 ? (prevState + 1) : 0);
            }
        }
    }

    const onClose = () => {
        setHideAndShowReplyBox(false)
        dispatch(updateThreadState({selectedThread: null}));
        dispatch(updateMessageState({isCompose: false, selectedMessage: null}));
    }

    const updateMailBox = (messageBox: string) => {
        if (selectedThread && selectedThread.id) {
            if (messageBox) {
                let body = {}
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
                // dispatch(updatePartialMessage({id: selectedThread.id, body}));

                dispatch(updateThreads({id: selectedThread.id, body}));
            }
        }
    }

    const [hideAndShowReplyBox, setHideAndShowReplyBox] = useState<boolean>(false);
    const [replyType, setReplyType] = useState<string>('');

    const hideAndShowReplayBox = (type: string = '') => {
        setReplyType(type);
        setHideAndShowReplyBox(!hideAndShowReplyBox);
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
                                    className={`${styles.actionIcon} ${messages && messages?.length - 1 !== index ? '' : styles.disabled}`}
                                    onClick={() => showPreNextMessage('down')}>
                                    <ChevronDownIcon/>
                                </div>

                            </Flex>

                            <Flex alignItems={'center'} gap={3} className={styles.headerRightIcon}>
                                {!isLoading && <Text className={styles.totalMessages}>
                                    {index ? index + 1 : 1} / {messages && messages.length}
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
                                    label={(messageContent?.mailboxes || []).includes('STARRED') ? 'Starred' : 'Not Starred'}
                                    placement='bottom' bg='gray.300' color='black'>
                                    <div onClick={() => updateMailBox('STARRED')}>
                                        {(messageContent?.mailboxes || []).includes('STARRED') && <BlueStarIcon/>}
                                        {!(messageContent?.mailboxes || []).includes('STARRED') && <StarIcon/>}
                                    </div>
                                </Tooltip>

                                <Tooltip
                                    label={(messageContent?.mailboxes || []).includes('SPAM') ? 'Spammed' : 'Mark As Spam'}
                                    placement='bottom' bg='gray.300' color='black'>
                                    <div onClick={() => updateMailBox('SPAM')}>
                                        <WarningIcon className={styles.colorGray}/>
                                    </div>
                                </Tooltip>
                            </Flex>
                        </Flex>

                        {isLoading && <SpinnerUI/>}

                        {(!isLoading && messageContent) &&
                        <Flex alignItems={'center'} padding={'10px 20px'}>
                            <Image src={'/image/user.png'} alt={''} width={50} height={50}/>
                            <Flex flexDir={'column'} marginLeft={'5'} width={'100%'}>
                                <Heading as='h4' size='md'>{messageContent?.subject || ''}</Heading>
                                <Flex justifyContent={'space-between'} align={'center'}>
                                    <Text fontSize='sm'>Michel Eisner to Lee Clow and 4 others</Text>
                                    <div className={styles2.receiveTime}>
                                        <Time time={messageContent?.created || ''} isShowFullTime={true}/>
                                    </div>
                                </Flex>
                            </Flex>
                        </Flex>}
                    </div>
                    <div className={styles.mailBodyContent}>
                        {(!isLoading && emailPart) && <iframe src={emailPart} className={styles.mailBody}/>}
                    </div>
                </Flex>}

                {!hideAndShowReplyBox &&
                <Flex align={'center'} padding={'10px 20px'}>
                    <Button className={styles.hideButton} variant='outline' onClick={() => hideAndShowReplayBox('reply')}>
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

                        <ReplyBox replyType={replyType} emailPart={emailPart}/>
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
