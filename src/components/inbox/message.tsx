import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {
    Box,
    Button,
    Flex,
    Heading,
    Text,
    Tooltip
} from "@chakra-ui/react";
import {CheckIcon, ChevronDownIcon, ChevronUpIcon, CloseIcon} from "@chakra-ui/icons";
import {Time} from "@/components";
import {ArchiveIcon, FolderIcon, StarIcon, TimeSnoozeIcon, TrashIcon} from "@/icons";
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
import {BlueStarIcon} from "@/icons/star-blue.icon";

export function Message() {
    const [messageContent, setMessageContent] = useState<MessageModel>();
    const [index, setIndex] = useState<number | null>(null);
    const [emailPart, setEmailPart] = useState<string>("");

    const {messages, messagePart, isCompose, isLoading, message} = useSelector((state: StateType) => state.messages);
    const {selectedThread} = useSelector((state: StateType) => state.threads);

    const dispatch = useDispatch();

    const getAllThreadMessages = useCallback(() => {
        if (selectedThread && selectedThread?.id) {
            dispatch(getAllMessages({thread: selectedThread.id}));
        }
    }, [dispatch, selectedThread])
    const [hideCcFields, setHideCcFields] = useState<boolean>(false);
    const [hideBccFields, setHideBccFields] = useState<boolean>(false);

    useEffect(() => {
        if (selectedThread && selectedThread?.id) {
            setIndex(null);
            setHideCcFields(false)
            setHideBccFields(false)
            getAllThreadMessages();
        }
    }, [selectedThread, getAllThreadMessages])

    useEffect(() => {
        if (messages && messages.length > 0) {
            setIndex(val => !val ? messages.length - 1 : val);
            setHideCcFields(false)
            setHideBccFields(false)
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

    useEffect(() => {
        if (message) {
            setMessageContent(message)
        }
    }, [message])

    const showPreNextMessage = (type: string) => {
        if (type === 'up') {
            if (index && index > 0) {
                setIndex(prevState => prevState ? (prevState - 1) :  null);
                setHideCcFields(false);
                setHideBccFields(false);
            }
        } else if (type === 'down') {
            if (messages && messages.length - 1 !== index) {
                setIndex(prevState => prevState || prevState === 0 ? (prevState + 1) : 0);
                setHideCcFields(false);
                setHideBccFields(false);
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
                let body = {}
                let data = messageContent.mailboxes || [];
                if (messageContent.mailboxes?.includes(messageBox)) {

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
                dispatch(updatePartialMessage({id: messageContent.id, body}));
            }
        }
    }

    const [hideAndShowReplyBox, setHideAndShowReplyBox] = useState<boolean>(false);

    const hideAndShowReplayBox = () => {
        if (hideAndShowReplyBox) {
            setHideAndShowReplyBox(false)
        } else {
            setHideAndShowReplyBox(true)
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
                                    {index ? index + 1 : 1} / {selectedThread.numMessages}
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
                                    <div onClick={() => updateMailBox('READ')}>
                                        <CheckIcon />
                                    </div>
                                </Tooltip>

                                <Tooltip label='Starred' placement='bottom' bg='gray.300' color='black'>
                                    <div onClick={() => updateMailBox('STARRED')}>
                                        {(messageContent?.mailboxes || []).includes('STARRED') && <BlueStarIcon />}
                                        {!(messageContent?.mailboxes || []).includes('STARRED') && <StarIcon />}
                                    </div>
                                </Tooltip>

                                <Tooltip label='MailBox' placement='bottom' bg='gray.300' color='black'>
                                    <div onClick={() => updateMailBox('MAILBOX')}>
                                        <FolderIcon/>
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
                                <Time time={messageContent?.created || ''} isShowFullTime={true}/>
                            </div>
                        </Flex>}
                    </div>
                    <div className={styles.mailBodyContent}>
                        {(!isLoading && emailPart) && <iframe src={emailPart} className={styles.mailBody}/>}
                    </div>
                </Flex>

                <Button className={styles.hideButton} rightIcon={hideAndShowReplyBox ? <ChevronDownIcon /> : <ChevronUpIcon />} variant='outline' onClick={() => hideAndShowReplayBox()}>
                    {hideAndShowReplyBox ? 'Discard' : 'Reply box'}
                </Button>
                {hideAndShowReplyBox && <ReplyBox hideCcFields={hideCcFields} setHideCcFields={setHideCcFields} setHideBccFields={setHideBccFields} hideBccFields={hideBccFields}/> }

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

                    <ReplyBox  hideCcFields={hideCcFields} setHideCcFields={setHideCcFields} setHideBccFields={setHideBccFields} hideBccFields={hideBccFields}/>
                </Flex>
            </div>}
        </Box>
    )
}
