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
    const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
    const [iframeHeight, setIframeHeight] = React.useState("0px");

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
    const [messagesList, setMessagesList] = useState<any>([]);
    const [messageDetails, setMessageDetails] = useState<any>(null);

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
            let data = [...messages]
            data.length = data.length - 1
            setMessagesList([...data])
            setMessageDetails(messages[messages.length - 1])
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

    // Set iframe height once content is loaded within iframe
    const onIframeLoad = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            setIframeHeight(iframeRef.current.contentWindow.document.body.scrollHeight + "px");
        }
    };


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
        <Box className={styles.mailBox} height={'calc(100vh - 180px)'}>
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
                                    herderType={'inbox'}/>

                    <Flex padding={'20px'} gap={5} direction={'column'} flex={1} overflow={'auto'}>
                        <Flex gap={2} direction={'column'} height={'100%'}>
                            {messagesList && !!messagesList.length && messagesList.map((item: any, index: number) => (
                                <div key={index}>
                                    <MessageBox item={item} index={index} threadDetails={item}
                                                isLoading={isLoading} emailPart={emailPart}
                                                messageAttachments={messageAttachments}
                                    />
                                </div>

                            ))}

                            {messageDetails &&
                            <Flex direction={'column'} className={`${styles.oldMail} ${styles.lastOneMail}`} gap={4}
                                  padding={4} border={'1px solid #E5E7EB'} borderRadius={12} align={'center'}>
                                <Flex align={'center'} w={'100%'} gap={2}>
                                    <div className={styles.mailBoxUserImage}>

                                    </div>

                                    <Flex w={'100%'} direction={'column'}>
                                        <Flex align={'center'} justify={'space-between'} mb={1}>
                                            <Flex align={'center'} gap={1}>
                                                <Heading as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400}
                                                         letterSpacing={'-0.13px'} lineHeight={1}>Michael
                                                    Eisner</Heading>
                                                <span className={'dot'}/>
                                                <Text fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'}
                                                      lineHeight={1} fontWeight={400}>{messageDetails.from}</Text>
                                            </Flex>

                                            <Flex align={'center'} gap={'6px'}>
                                                <Flex className={styles.memberImages}>
                                                    <div className={styles.memberPhoto}>
                                                        <Image src="/image/user.png" width="24" height="24" alt=""/>
                                                    </div>
                                                    <div className={styles.memberPhoto}>
                                                        <Image src="/image/user.png" width="24" height="24" alt=""/>
                                                    </div>
                                                    <Flex align={'center'} justify={'center'} fontSize={'9px'}
                                                          color={'#082561'} className={styles.memberPhoto}>
                                                        +4
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.mailBoxTime}>
                                                    <Time time={messageDetails?.created || ''} isShowFullTime={true}/>
                                                </div>
                                                <Menu>
                                                    <MenuButton className={styles.menuIcon} transition={'all 0.5s'}
                                                                backgroundColor={'transparent'} fontSize={'12px'}
                                                                h={'auto'} minWidth={'24px'} padding={'0'} as={Button}
                                                                rightIcon={<MenuIcon/>}>
                                                    </MenuButton>
                                                    <MenuList className={'drop-down-list'}>
                                                        {messageDetails && (
                                                            <MenuItem
                                                                onClick={() => setScope(messageDetails.scope === 'visible' ? 'hidden' : 'visible', messageDetails)}>
                                                                {messageDetails.scope === 'visible' ? 'Hide from project members' : 'Show to project members'}
                                                            </MenuItem>
                                                        )}

                                                        <MenuItem
                                                            onClick={() => hideAndShowReplayBox('reply')}> Reply </MenuItem>
                                                        <MenuItem
                                                            onClick={() => hideAndShowReplayBox('reply-all')}> Reply
                                                            All </MenuItem>
                                                        <MenuItem
                                                            onClick={() => hideAndShowReplayBox('forward')}> Forward </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Flex>
                                        </Flex>
                                        <Flex>

                                            {messageDetails && messageDetails.to && messageDetails.to.length > 0 &&
                                            <Flex fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'}
                                                  lineHeight={1} fontWeight={400}>to:&nbsp;
                                                {messageDetails.to[0]}&nbsp; <Text
                                                    as='u'>{messageDetails.to.length - 1 > 0 && `and ${messageDetails.to.length - 1} others`} </Text>
                                            </Flex>
                                            }
                                        </Flex>
                                    </Flex>
                                </Flex>
                                {(!isLoading && emailPart) &&
                                <div className={styles.mailBodyContent}>
                                    <iframe
                                        ref={iframeRef}
                                        src={emailPart}
                                        onLoad={onIframeLoad}
                                        height={iframeHeight}
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
                                emailPart={(messagePart?.data || '')} messageData={messageDetails}
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
