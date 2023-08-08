import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {Box, Button, Flex, Heading, Text, Tooltip} from "@chakra-ui/react";
import {ChevronDownIcon, ChevronUpIcon, CloseIcon} from "@chakra-ui/icons";
import {Time} from "@/components";
import {ArchiveIcon, FolderIcon, TimeSnoozeIcon, TrashIcon} from "@/icons";
import Image from "next/image";
import {StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    getAllMessages,
    getMessageParts,
    updateMessageState, updatePartialMessage
} from "@/redux/messages/action-reducer";
import {SpinnerUI} from '@/components/spinner';
import {ReplyBox} from "@/components/inbox/reply-box";
import {updateThreadState} from "@/redux/threads/action-reducer";
import {Message as MessageModel} from "@/models";

export function Message() {
    const [messageContent, setMessageContent] = useState<MessageModel>();
    const [index, setIndex] = useState<number | null>(null);
    const [emailPart, setEmailPart] = useState<string>("");

    const {messages, messagePart, isCompose, isLoading} = useSelector((state: StateType) => state.messages);
    const {selectedThread} = useSelector((state: StateType) => state.threads);

    const dispatch = useDispatch();

    const getAllThreadMessages = useCallback(() => {
        if (selectedThread && selectedThread?.id) {
            dispatch(getAllMessages({thread: selectedThread.id}));
        }
    }, [dispatch, selectedThread])

    useEffect(() => {
        if (selectedThread && selectedThread?.id) {
            setIndex(null);
            getAllThreadMessages();
        }
    }, [selectedThread, getAllThreadMessages])

    useEffect(() => {
        if (messages && messages.length > 0) {
            setIndex(val => !val ? messages.length - 1 : val);
        }
    }, [messages])

    useEffect(() => {
        if (messagePart && messagePart.data) {
            let decoded = Buffer.from(messagePart.data, 'base64').toString('ascii');
            const blob = new Blob([decoded], {type: "text/html"});
            const blobUrl = window.URL.createObjectURL(blob);
            setEmailPart(blobUrl);
        }
    }, [messagePart])

    useEffect(() => {
        if (index !== null && messages && messages.length > 0) {
            setMessageContent(messages[index]);
            dispatch(updateMessageState({selectedMessage: messages[index]}));
            dispatch(getMessageParts({id: messages[index].id}));
        }
    }, [dispatch, index, messages])

    const showPreNextMessage = (type: string) => {
        if (type === 'up') {
            if (index && index > 0) {
                setIndex(prevState => prevState ? (prevState - 1) :  null);
            }
        } else if (type === 'down') {
            if (messages && messages.length - 1 !== index) {
                setIndex(prevState => prevState ? (prevState + 1) : null);
            }
        }
    }

    const onClose = () => {
        dispatch(updateThreadState({selectedThread: null}));
        dispatch(updateMessageState({isCompose: false, selectedMessage: null}));
    }

    const updateMailBox = (messageBox: string) => {
        if (messageContent && messageContent.id) {
            if (messageBox) {
                let body = {
                    Mailboxes: [
                        messageBox
                    ],
                }
                dispatch(updatePartialMessage({id: messageContent.id, body}));
            }
        }
    }


    return (
        <Box className={styles.mailBox}>

            {selectedThread && !isCompose &&
            <Flex justifyContent={'space-between'} flexDir={'column'} height={'100%'}>
                <Flex direction={'column'} className={styles.mailBoxFLex}>
                    <div style={{flex: 'none'}}>
                        <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                              borderBottom={'1px solid rgba(8, 22, 47, 0.1)'}
                              marginBottom={'15'} padding={'12px 20px'}>
                            <Flex alignItems={'center'} gap={2}>
                                <div className={styles.closeIcon} onClick={() => onClose()}><CloseIcon/>
                                </div>
                                <div className={`${styles.actionIcon} ${index === 0 ? styles.disabled : ''}`}
                                     onClick={() => showPreNextMessage('up')}><ChevronUpIcon/></div>
                                <div
                                    className={`${styles.actionIcon} ${messages && messages?.length - 1 !== index ? '' : styles.disabled}`}
                                    onClick={() => showPreNextMessage('down')}><ChevronDownIcon/></div>

                            </Flex>

                            <Flex alignItems={'center'} gap={3} className={styles.headerRightIcon}>
                                {!isLoading && <Text className={styles.totalMessages}>
                                    {index && index + 1} / {selectedThread.numMessages}
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

                            </Flex>
                        </Flex>

                        {isLoading && <SpinnerUI/>}

                        {(!isLoading && messageContent) &&
                        <Flex alignItems={'center'} wrap={'wrap'} justifyContent={'space-between'} gap={5}
                              padding={'10px 20px'}>
                            <Flex alignItems={'center'}>
                                <Image src={'/image/user.png'} alt={''} width={50} height={50}/>
                                <Flex flexDir={'column'} marginLeft={'5'}>
                                    <Heading as='h4' size='md'>{messageContent?.subject || ''}</Heading>
                                    <Text fontSize='sm'>Michel Eisner to Lee Clow and 4 others</Text>
                                </Flex>
                            </Flex>
                            <div className={styles2.receiveTime}>
                                <Time time={messageContent?.created || ''}/>
                            </div>
                        </Flex>}
                    </div>
                    <div className={styles.mailBodyContent}>
                        {(!isLoading && emailPart) && <iframe src={emailPart} className={styles.mailBody}/>}
                    </div>
                </Flex>

                <ReplyBox/>
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
                                <div className={styles.closeIcon} onClick={() => onClose()}><CloseIcon/>
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
