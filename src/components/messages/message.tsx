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
import {debounce} from "@/utils/common.functions";
import {InboxLoader} from "@/components/loader-screen/inbox-loader";

let cacheMessages: { [key: string]: { body: MessagePart, attachments: MessageAttachments[] } } = {};

export function Message() {
    const iframeRef = React.useRef<HTMLIFrameElement | null | any>(null);
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
        isLoading: messageLoading,
        messageAttachments,
        selectedMessage,
        attachmentUrl
    } = useSelector((state: StateType) => state.messages);
    const {selectedThread, isThreadLoading: threadLoading} = useSelector((state: StateType) => state.threads);
    const {isLoading: accountLoading} = useSelector((state: StateType) => state.accounts);
    const {isLoading: organizationLoading} = useSelector((state: StateType) => state.organizations);
    const {isLoading: usersProfilePictureLoading} = useSelector((state: StateType) => state.users);
    const {isLoading: projectsLoading} = useSelector((state: StateType) => state.projects);

    const [lastMessageDetails, setLastMessageDetails] = useState<MessageModel | null>(null);
    const [messageDetailsForReplyBox, setMessageDetailsForReplyBox] = useState<MessageModel | null>(null);
    const [isLoaderShow, setIsLoaderShow] = useState<boolean>(false);

    const dispatch = useDispatch();


    useEffect(() => {
        if (threadLoading && accountLoading && organizationLoading && usersProfilePictureLoading && projectsLoading) {
            setIsLoaderShow(true)
        } else {
            setIsLoaderShow(false)
        }
    }, [threadLoading, accountLoading, organizationLoading, usersProfilePictureLoading, projectsLoading])

    useEffect(() => {
        if (selectedThread && selectedThread?.id) {
            setIndex(null);
            setHideAndShowReplyBox(false);
            setLastMessageDetails(null);
            dispatch(updateMessageState({messages: selectedThread.messages}));
        }
    }, [dispatch, selectedThread])

    useEffect(() => {
        if (messages && messages.length > 0) {
            // remove draft messages and set index to last inbox message
            const currentInboxMessages: MessageModel[] = messages.filter((msg: MessageModel) => !(msg.mailboxes || []).includes('DRAFT'));
            let data = [...currentInboxMessages];
            data.splice(currentInboxMessages.length - 1, 1);
            setInboxMessages([...data]);
            setLastMessageDetails(currentInboxMessages[currentInboxMessages.length - 1]);
            const draftMessage = messages.findLast((msg: MessageModel) => (msg.mailboxes || []).includes('DRAFT'));
            if (draftMessage) {
                dispatch(updateDraftState({draft: draftMessage as MessageDraft}));
            }
            setIndex(null);
        }
    }, [messages, dispatch])


    const cacheMessage = useCallback((body: Object | any) => {
        let messageId = index === null ? (lastMessageDetails ? lastMessageDetails.id : null) : inboxMessages[index].id;
        if (messageId) {
            cacheMessages = {
                ...cacheMessages,
                [messageId]: {
                    ...cacheMessages[messageId],
                    ...body
                }
            }
        }
    }, [inboxMessages, index, lastMessageDetails])

    useEffect(() => {
        if (lastMessageDetails) {
            if (cacheMessages[lastMessageDetails.id!] && cacheMessages[lastMessageDetails.id!].body) {
                dispatch(updateMessageState({messagePart: cacheMessages[lastMessageDetails.id!].body}));
            } else {
                dispatch(getMessageParts({id: lastMessageDetails.id!}));
            }
            if (cacheMessages[lastMessageDetails.id!] && cacheMessages[lastMessageDetails.id!].attachments) {
                dispatch(updateMessageState({messageAttachments: cacheMessages[lastMessageDetails.id!].attachments}));
            } else {
                dispatch(getMessageAttachments({id: lastMessageDetails.id!}));
            }
        }
    }, [dispatch, lastMessageDetails])

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
            dispatch(updateMessageState({attachmentUrl: null}));
        }
    }, [dispatch, attachmentUrl])

    // Set iframe height once content is loaded within iframe
    const onIframeLoad = () => {
        debounce(() => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                setIframeHeight(iframeRef.current.contentWindow.document.body.scrollHeight + "px");
            }
        }, 500)
    };


    const closeCompose = () => {
        setHideAndShowReplyBox(false)
        setReplyType('');
        dispatch(updateMessageState({isCompose: false}));
    }


    const hideAndShowReplayBox = (type: string = '', messageData: MessageModel) => {
        setReplyType(type);
        setMessageDetailsForReplyBox(messageData)
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
                {!isLoaderShow && <Heading as='h3' size='md'>Click on a thread from list to view messages!</Heading>}
                {isLoaderShow && <InboxLoader />}
            </Flex>}
            {selectedThread && !isCompose &&
            <Flex flexDir={'column'} height={'100%'}>
                {!hideAndShowReplyBox &&
                <>
                    <MessagesHeader inboxMessages={inboxMessages} index={index} closeCompose={closeCompose}
                                    herderType={'inbox'}/>

                    <Flex padding={'20px'} gap={5} direction={'column'} flex={1} overflow={'auto'}>
                        <Flex gap={2} direction={'column'} height={'100%'}>
                            {inboxMessages && !!inboxMessages.length && inboxMessages.map((item: any, index: number) => (
                                <div key={index}>
                                    <MessageBox item={item} index={index} threadDetails={item}
                                                isLoading={messageLoading} emailPart={emailPart}
                                                messageAttachments={messageAttachments} hideAndShowReplayBox={hideAndShowReplayBox}
                                    />
                                </div>

                            ))}

                            {lastMessageDetails &&
                            <Flex direction={'column'} className={`${styles.oldMail} ${styles.lastOpenMail}`} gap={4}
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
                                                      lineHeight={1} fontWeight={400}>{lastMessageDetails.from}</Text>
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
                                                    <Time time={lastMessageDetails?.created || ''}
                                                          isShowFullTime={true} showTimeInShortForm={false}/>
                                                </div>
                                                <Menu>
                                                    <MenuButton className={styles.menuIcon} transition={'all 0.5s'}
                                                                backgroundColor={'transparent'} fontSize={'12px'}
                                                                h={'auto'} minWidth={'24px'} padding={'0'} as={Button}
                                                                rightIcon={<MenuIcon/>}>
                                                    </MenuButton>
                                                    <MenuList className={'drop-down-list'}>
                                                        {lastMessageDetails && (
                                                            <MenuItem
                                                                onClick={() => setScope(lastMessageDetails.scope === 'visible' ? 'hidden' : 'visible', lastMessageDetails)}>
                                                                {lastMessageDetails.scope === 'visible' ? 'Hide from project members' : 'Show to project members'}
                                                            </MenuItem>
                                                        )}

                                                        <MenuItem
                                                            onClick={() => hideAndShowReplayBox('reply', lastMessageDetails)}> Reply </MenuItem>
                                                        <MenuItem
                                                            onClick={() => hideAndShowReplayBox('reply-all', lastMessageDetails)}> Reply All </MenuItem>
                                                        <MenuItem
                                                            onClick={() => hideAndShowReplayBox('forward', lastMessageDetails)}> Forward </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Flex>
                                        </Flex>
                                        <Flex>

                                            {lastMessageDetails && lastMessageDetails.to && lastMessageDetails.to.length > 0 &&
                                            <Flex fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'}
                                                  lineHeight={1} fontWeight={400}>to:&nbsp;
                                                {lastMessageDetails.to[0]}&nbsp; <Text
                                                    as='u'>{lastMessageDetails.to.length - 1 > 0 && `and ${lastMessageDetails.to.length - 1} others`} </Text>
                                            </Flex>
                                            }
                                        </Flex>
                                    </Flex>
                                </Flex>
                                {(!messageLoading && emailPart) &&
                                <div className={styles.mailBodyContent}>
                                    <iframe
                                        ref={iframeRef}
                                        src={emailPart}
                                        onLoad={onIframeLoad}
                                        height={iframeHeight}
                                        frameBorder="0"
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
                                emailPart={(messagePart?.data || '')} messageData={messageDetailsForReplyBox}
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
