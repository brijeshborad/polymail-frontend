import styles from "@/styles/Inbox.module.css";
import {
    Box,
    Button,
    Flex,
    Heading,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text
} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {
    DownloadIcon, MenuIcon
} from "@/icons";
import Image from "next/image";
import {StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    getAttachmentDownloadUrl,
    getMessageAttachments,
    getMessageParts, updateMessage,
    updateMessageState
} from "@/redux/messages/action-reducer";
import {Message as MessageModel, MessageDraft, MessagePart, MessageAttachments} from "@/models";
import {MessagesHeader} from "@/components/messages/messages-header";
import {updateDraftState} from "@/redux/draft/action-reducer";
import {MessageBox} from "@/components/inbox/messages/message-box";
import {MessageReplyBox} from "@/components/inbox/messages/message-reply-box";

export function Message() {
    const [index, setIndex] = useState<number | null>(null);
    const [emailPart, setEmailPart] = useState<string>("");
    const [hideAndShowReplyBox, setHideAndShowReplyBox] = useState<boolean>(false);
    const [replyType, setReplyType] = useState<string>('');
    const [inboxMessages, setInboxMessages] = useState<MessageModel[]>([]);
    const {
        messages,
        messagePart,
        isCompose,
        isLoading,
        messageAttachments,
        selectedMessage,
        attachmentUrl
    } = useSelector((state: StateType) => state.messages);
    const {selectedThread} = useSelector((state: StateType) => state.threads);
    const [cacheMessages, setCacheMessages] = useState<{ [key: string]: { body: MessagePart, attachments: MessageAttachments[] } }>({});
    const [threadData, setThreadData] = useState<any>([]);
    const [threadDetails, setThreadDetails] = useState<any>(null);

    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedThread && selectedThread.messages && selectedThread.messages.length) {
            let data = [...selectedThread.messages]
            data.length = data.length - 1
            setThreadData([...data])
            setThreadDetails(selectedThread.messages[selectedThread.messages.length - 1])
        }
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
                [inboxMessages[index].id!]: {
                    ...prev[inboxMessages[index].id!],
                    ...body
                }
            }))
        }
    }, [index, inboxMessages])


    useEffect(() => {
        if (messagePart && messagePart.data) {
            cacheMessage({body: messagePart});
            let decoded = Buffer.from(messagePart.data || '', 'base64').toString('ascii');
            let addTargetBlank = decoded.replace(/<a/g, '<a target="_blank"');
            const blob = new Blob([addTargetBlank], {type: "text/html"});
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
                dispatch(updateMessageState({selectedMessage: inboxMessages[index]}));
                // We already set index to last inbox message
                if (cacheMessages[inboxMessages[index].id!] && cacheMessages[inboxMessages[index].id!].body) {
                    dispatch(updateMessageState({messagePart: cacheMessages[inboxMessages[index].id!].body}));
                } else {
                    dispatch(getMessageParts({id: inboxMessages[index].id!}));
                }
                if (cacheMessages[inboxMessages[index].id!] && cacheMessages[inboxMessages[index].id!].attachments) {
                    dispatch(updateMessageState({messageAttachments: cacheMessages[inboxMessages[index].id!].attachments}));
                } else {
                    dispatch(getMessageAttachments({id: inboxMessages[index].id!}));
                }

            }
        }
    }, [dispatch, index, inboxMessages])

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
    }

    const downloadImage = (item: MessageAttachments) => {
        if (selectedMessage && selectedMessage.id) {
            dispatch(getAttachmentDownloadUrl({id: selectedMessage.id, attachment: item.id}));
        }
    }

    const setScope = (type: string, item: any) => {
        if (item && item.id) {
            let body = {
                scope: type
            }
            dispatch(updateMessage({id: item.id, body}))
        }

    }

    return (
        <Box className={styles.mailBox} height={'708px'}>
            {!selectedThread && !isCompose &&
            <Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'}
                  height={'100%'}>
                <Heading as='h3' size='md'>Click on a thread from list to view messages!</Heading>
            </Flex>}
            {selectedThread && !isCompose &&
            <Flex flexDir={'column'} height={'100%'}>
                {!hideAndShowReplyBox &&
                <>
                    <MessagesHeader inboxMessages={inboxMessages} index={index} closeCompose={closeCompose}
                                    showPreNextMessage={showPreNextMessage} herderType={'inbox'}/>

                    <Flex padding={'20px'} gap={5} direction={'column'} flex={1} maxHeight={'calc(708px - 57px)'} overflow={'auto'}>
                        <Flex gap={2} direction={'column'}>
                            {threadData  && !!threadData.length && threadData.map((item: any, index: number) => (
                                <div key={index}>
                                    <MessageBox item={item} index={index} threadDetails={item}
                                                isLoading={isLoading} emailPart={emailPart}
                                                messageAttachments={messageAttachments}
                                    />
                                </div>

                            ))}

                            {threadDetails && <Flex direction={'column'} className={`${styles.oldMail} ${styles.lastOenMail}`} gap={4} padding={4} border={'1px solid #E5E7EB'} borderRadius={12} align={'center'}>
                                <Flex align={'center'} w={'100%'} gap={2}>
                                    <div className={styles.mailBoxUserImage}>

                                    </div>

                                    <Flex w={'100%'} direction={'column'}>
                                        <Flex align={'center'} justify={'space-between'} mb={1}>
                                            <Flex align={'center'} gap={1}>
                                                <Heading as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400} letterSpacing={'-0.13px'} lineHeight={1}>Michael Eisner</Heading>
                                                <span className={'dot'} />
                                                <Text fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1} fontWeight={400}>{threadDetails.from}</Text>
                                            </Flex>

                                            <Flex align={'center'} gap={'6px'}>
                                                <Flex className={styles.memberImages}>
                                                    <div className={styles.memberPhoto}>
                                                        <Image src="/image/user.png" width="24" height="24" alt=""/>
                                                    </div>
                                                    <div className={styles.memberPhoto}>
                                                        <Image src="/image/user.png" width="24" height="24" alt=""/>
                                                    </div>
                                                    <Flex align={'center'} justify={'center'} fontSize={'9px'} color={'#082561'} className={styles.memberPhoto}>
                                                        +4
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.mailBoxTime}>
                                                    <Time time={threadDetails?.created || ''} isShowFullTime={true}/>
                                                </div>
                                                <Menu>
                                                    <MenuButton className={styles.menuIcon} transition={'all 0.5s'} backgroundColor={'transparent'} fontSize={'12px'} h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon />}>
                                                    </MenuButton>
                                                    <MenuList className={'drop-down-list'}>
                                                        {threadDetails && (
                                                            <MenuItem onClick={() => setScope(threadDetails.scope === 'visible' ? 'hidden' : 'visible', threadDetails)}>
                                                                {threadDetails.scope === 'visible' ? 'Hide from project members' : 'Show to project members'}
                                                            </MenuItem>
                                                        )}

                                                        <MenuItem onClick={() => hideAndShowReplayBox('reply')}> Reply </MenuItem>
                                                        <MenuItem onClick={() => hideAndShowReplayBox('reply-all')}> Reply All </MenuItem>
                                                        <MenuItem onClick={() => hideAndShowReplayBox('forward')}> Forward </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Flex>
                                        </Flex>
                                        <Flex>

                                            {threadDetails && threadDetails.to && threadDetails.to.length > 0 &&
                                            <Flex fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1} fontWeight={400}>to:&nbsp;
                                                {threadDetails.to[0]}&nbsp; <Text as='u'>{threadDetails.to.length - 1 > 0 && `and ${threadDetails.to.length - 1} others`} </Text>
                                            </Flex>
                                            }
                                        </Flex>
                                    </Flex>
                                </Flex>
                                {(!isLoading && emailPart) &&
                                <div className={styles.mailBodyContent}>
                                     <iframe
                                         src={emailPart}
                                         frameBorder="0"
                                         id="frmid"
                                         className={styles.mailBody}/>
                                </div>}
                                {messageAttachments && !!messageAttachments.length && messageAttachments?.map((item: MessageAttachments, i) => (

                                <div className={styles.mailBodyAttachments} key={i}>
                                            <Flex align={'center'} className={styles.attachmentsFile}>
                                                {item.filename}
                                                <div className={`${styles.closeIcon} ${styles.downloadIcon}`}
                                                     onClick={() => downloadImage(item)}>
                                                    <DownloadIcon/>
                                                </div>
                                            </Flex>
                                </div>
                                ))}

                            </Flex>}

                            <MessageReplyBox
                                emailPart={(messagePart?.data || '')} messageData={threadDetails}
                                replyType={replyType}/>
                        </Flex>
                    </Flex>
                </>
                }
            </Flex>
            }
        </Box>
    )
}
