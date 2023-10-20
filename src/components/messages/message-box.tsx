import styles from "@/styles/Inbox.module.css";
import {Button, Flex, Heading, Menu, MenuButton, MenuItem, MenuList, Text} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {MenuIcon} from "@/icons";
import React, {useCallback, useEffect, useState} from "react";
import {
    getAttachmentDownloadUrl,
    getMessageAttachments,
    getMessageParts,
    updateMessage
} from "@/redux/messages/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {Message, Message as MessageModel, MessageAttachments} from "@/models";
import {StateType} from "@/types";
import {clearDebounce, debounce} from "@/utils/common.functions";
import {EyeSlashedIcon} from "@/icons/eye-slashed.icon";
import Tooltip from "../common/Tooltip";
import {AttachmentIcon} from "@chakra-ui/icons";
import {FileIcon, defaultStyles, DefaultExtensionType} from 'react-file-icon';
import {globalEventService, messageService, threadService} from "@/services";
import LinkPreview from "../common/link-preview";
import {LinkPreviewProps} from "@/types/props-types/link-preview.types";
import {getCacheMessages, setCacheMessages} from "@/utils/cache.functions";


let currentInboxMessagesInstant: MessageModel[] = [];

export function MessageBox(props: any) {
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
    const iframeRef = React.useRef<any>([]);
    const [iframeHeight, setIframeHeight] = useState<{ [key: string | number]: string }>({});
    const dispatch = useDispatch();
    const {
        messagePart,
        messageAttachments,
        messages
    } = useSelector((state: StateType) => state.messages);
    const {selectedThread} = useSelector((state: StateType) => state.threads);
    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false)
    const [currentLinkPreview, setCurrentLinkPreview] = useState<LinkPreviewProps>({
        isVisible: false,
        url: null,
        top: 0,
        left: 0
    })
    const [inboxMessages, setInboxMessages] = useState<MessageModel[]>([]);
    const [index, setIndex] = useState<number | null>(null);

    const cacheMessage = useCallback((body: Object | any, messageId: string) => {
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
    }, [])

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
            const currentInboxMessages: MessageModel[] = messages.filter((msg: MessageModel) => !(msg.mailboxes || []).includes('DRAFT')).map((item: MessageModel) => {
                let cacheMessages: any = getCacheMessages();
                let body = '';
                if (cacheMessages[item.id!]) {
                    let decoded = Buffer.from(cacheMessages[item.id!] && cacheMessages[item.id!].data || '', 'base64').toString();
                    let addTargetBlank = decoded.replace(/<a/g, '<a target="_blank"');
                    const blob = new Blob([addTargetBlank], {type: "text/html"});
                    body = window.URL.createObjectURL(blob);
                }
                return {
                    ...item,
                    body,
                    attachments: cacheMessages[item.id!] ? cacheMessages[item.id!].attachments || [] : []
                }
            });
            setInboxMessages([...currentInboxMessages]);
            currentInboxMessagesInstant = [...currentInboxMessages];
            if (index === null) {
                setIndex(currentInboxMessages.length - 1);
            }
            globalEventService.fireEvent({
                data: currentInboxMessages[currentInboxMessages.length - 1],
                type: 'draft.currentMessage'
            })
        }
    }, [messages, dispatch])

    useEffect(() => {
        if (index !== null && inboxMessages && inboxMessages.length > 0) {
            if (inboxMessages[index]) {
                messageService.setSelectedMessage(inboxMessages[index]);
                // We already set index to last inbox message
                let cacheMessages: any = getCacheMessages();
                if (cacheMessages[inboxMessages[index].id!] && cacheMessages[inboxMessages[index].id!].data) {
                    messageService.setMessageBody({
                        data: cacheMessages[inboxMessages[index].id!].data,
                        messageId: inboxMessages[index].id!
                    })
                } else {
                    dispatch(getMessageParts({body: {id: inboxMessages[index].id!}}));
                }
                if (cacheMessages[inboxMessages[index].id!] && cacheMessages[inboxMessages[index].id!].attachments) {
                    messageService.setMessageAttachments(cacheMessages[inboxMessages[index].id!].attachments, inboxMessages[index].id!)
                } else {
                    dispatch(getMessageAttachments({body: {id: inboxMessages[index].id!}}));
                }

            }
        }
    }, [dispatch, index])


    useEffect(() => {
        if (messagePart && messagePart.messageId) {
            messageService.setMessageBody(null);
            let messageId = currentInboxMessagesInstant.findIndex((item: MessageModel) => item.id === messagePart?.messageId);
            let finalMessages = [...currentInboxMessagesInstant];
            if (messagePart.data) {
                cacheMessage({data: messagePart.data}, messagePart.messageId!);
                let decoded = Buffer.from(messagePart.data || '', 'base64').toString();
                let addTargetBlank = decoded.replace(/<a/g, '<a target="_blank"');
                const blob = new Blob([addTargetBlank], {type: "text/html"});
                const blobUrl = window.URL.createObjectURL(blob);
                messageService.setSelectedMessageIfMessageIdMatches({...finalMessages[messageId], body: messagePart});
                finalMessages[messageId] = {
                    ...finalMessages[messageId],
                    body: blobUrl
                }
            } else {
                messageService.setSelectedMessageIfMessageIdMatches({...finalMessages[messageId], body: null});
                cacheMessage({data: ''}, messagePart.messageId!);
                finalMessages[messageId] = {...finalMessages[messageId], body: ''};
            }
            currentInboxMessagesInstant = [...finalMessages];
            setInboxMessages([...finalMessages]);
        }
    }, [cacheMessage, messagePart])

    useEffect(() => {
        // convert blob url to image url
        if (messageAttachments && messageAttachments.messageId) {
            messageService.clearMessageAndAttachments();
            let messageId = currentInboxMessagesInstant.findIndex((item: MessageModel) => item.id === messageAttachments?.messageId);
            let finalMessages = [...currentInboxMessagesInstant];
            if (messageAttachments.attachments.length) {
                cacheMessage({attachments: messageAttachments.attachments}, messageAttachments.messageId!);
                finalMessages[messageId] = {
                    ...finalMessages[messageId],
                    attachments: messageAttachments.attachments
                }
            } else {
                cacheMessage({attachments: []}, messageAttachments.messageId!);
                finalMessages[messageId] = {...finalMessages[messageId], attachments: []}
            }
            currentInboxMessagesInstant = [...finalMessages];
            setInboxMessages([...finalMessages]);
        }
    }, [cacheMessage, messageAttachments])

    // Set iframe height once content is loaded within iframe
    const onIframeLoad = (index: number) => {
        if (iframeRef.current && iframeRef.current[index] && iframeRef.current[index].contentWindow) {
            // iframeRef.current[index].contentDocument.addEventListener('wheel', function () {
            //     clearDebounce('IFRAME_SCROLL');
            //     debounce(() => {
            //         globalEventService.fireEvent('messagebox.scroll');
            //     }, 10, 'IFRAME_SCROLL');
            // }, false)
            iframeRef.current[index].contentDocument.body.style.fontFamily = "'Inter', sans-serif";
            iframeRef.current[index].contentDocument.body.style.fontSize = "14px";

            setIframeHeight(prevState => ({
                ...prevState,
                [index]: (iframeRef.current[index].contentWindow.document.body.scrollHeight + 20) + "px"
            }));

            const allLinks = iframeRef.current[index].contentDocument.getElementsByTagName("a")

            for (let i in allLinks) {
                const a = allLinks[i]
                if (typeof a === 'object' && a.hasAttribute('href')) {
                    const href = a.getAttribute('href')
                    a.onmouseover = function () {
                        setCurrentLinkPreview({
                            isVisible: true,
                            url: href,
                            top: a.getBoundingClientRect().top + window.scrollY,
                            left: a.getBoundingClientRect().left + window.scrollX
                        })
                    }
                    a.onmouseout = function () {
                        setCurrentLinkPreview({
                            isVisible: false,
                            url: href,
                            top: a.getBoundingClientRect().top + window.scrollY,
                            left: a.getBoundingClientRect().left + window.scrollX
                        })
                    }
                }
            }
        } else {
            setTimeout(() => {
                onIframeLoad(index);
            }, 100);
        }
    };

    const setScope = (message: MessageModel) => {
        if (message && message.id) {
            let body = {scope: message.scope === 'visible' ? 'hidden' : 'visible'}
            dispatch(updateMessage({
                body: {id: message.id, body},
                afterSuccessAction: () => {
                    threadService.makeThreadScope(message, message.scope === 'visible' ? 'hidden' : 'visible');
                }
            }))
        }
        let messageId = inboxMessages.findIndex((item: MessageModel) => item.id === message?.id);
        let finalMessages = [...inboxMessages];
        finalMessages[messageId] = {
            ...finalMessages[messageId],
            scope: message.scope === 'visible' ? 'hidden' : 'visible'
        };
        setInboxMessages(finalMessages);
    }

    const downloadImage = (message: MessageModel, item: MessageAttachments) => {
        if (message && message.id) {
            dispatch(getAttachmentDownloadUrl({body: {id: message.id, attachment: item.id}}));
        }
    }

    const handleRowClick = (selectIndex: any) => {
        if (selectIndex === index) {
            // Clicking on an already expanded row, so close it
            messageService.setSelectedMessage(null)
            setIndex(null)
        } else {
            setIndex(selectIndex);
            // Clicking on a new row, expand it
            const targetMessage = (messages || [])[selectIndex]
            messageService.setSelectedMessage(targetMessage)
        }
    };

    function showExtensionImages(item: string | undefined) {
        if (item) {
            const parts = item.split('.');
            if (parts.length > 1) {
                const extension: string = parts[parts.length - 1];
                return extension;
            }
        }
        return 'pdf'
    }

    function attachmentsMenu(message: Message) {
        return <Menu
            isOpen={isMoreDropdownOpen}
            onClose={() => {
                setIsMoreDropdownOpen(false)
            }}>
            <MenuButton
                className={styles.tabListAttachmentButton} minWidth={'1px'} padding={0}
                borderRadius={0} backgroundColor={'transparent'} height={'auto'}
                fontSize={'13px'} color={'#6B7280'} as={Button} mx={1}
                onMouseEnter={() => {
                    clearDebounce(message.id);
                    setIsMoreDropdownOpen(true)
                }}
                onMouseLeave={() => {
                    debounce(() => {
                        setIsMoreDropdownOpen(false)
                    }, 200, message.id)
                }}
                onMouseOut={() => {
                    debounce(() => {
                        setIsMoreDropdownOpen(false)
                    }, 200, message.id)
                }}
            >
                <AttachmentIcon/>
            </MenuButton>

            <MenuList
                className={`${styles.tabListDropDown} drop-down-list`}
                onMouseEnter={() => {
                    clearDebounce(message.id);
                    setIsMoreDropdownOpen(true)
                }}
                onMouseLeave={() => {
                    debounce(() => {
                        setIsMoreDropdownOpen(false)
                    }, 200, message.id)
                }}
            >
                {(message.attachments || []).map((item: MessageAttachments, i: number) => (
                    <MenuItem gap={2} key={i} onClick={() => downloadImage(message, item)}>
                        <FileIcon
                            extension={showExtensionImages(item.filename) as DefaultExtensionType}
                            {...defaultStyles[showExtensionImages(item.filename) as DefaultExtensionType]}
                        /> {item.filename}
                    </MenuItem>
                ))}

            </MenuList>

        </Menu>
    }

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsContextMenuOpen(false)
        }
    }, [incomingEvent]);

    return (
        inboxMessages && inboxMessages.length > 0 && inboxMessages.map((message: Message, messageIndex) => (
            <Flex position={'relative'} direction={'column'} key={messageIndex}
                  className={`${styles.oldMail} ${messageIndex === index ? styles.lastOpenMail : ''}`} mb={3}
                  gap={4}
                  border={'1px solid #E5E7EB'} borderRadius={12} align={'center'}>
                {messageIndex !== index &&
                <Flex align={'flex-start'} width={'100%'}>
                    <Flex align={'center'} w={'100%'} gap={2} cursor={'pointer'} padding={4}
                          onClick={() => handleRowClick(messageIndex)}>
                        <div className={styles.mailBoxUserImage}>

                        </div>

                        <Flex w={'100%'} direction={'column'}>
                            <Flex align={'center'} justify={'space-between'} mb={1} minH={5}>
                                <Heading as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400}
                                         letterSpacing={'-0.13px'}
                                         lineHeight={1}>{message.from?.name || message.from?.email}</Heading>
                            </Flex>
                            <Text fontSize='13px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                                  fontWeight={400}>
                                <span dangerouslySetInnerHTML={{__html: message.snippet || ''}}/>
                            </Text>
                        </Flex>
                    </Flex>
                    <Flex align={'center'} pt={4} position={'absolute'} right={0} className={styles.mailBoxTime}
                          gap={'6px'}>
                        {message.scope === 'hidden' ?
                            <Flex align={'center'} justify={'center'} className={styles.hideShowIcon}>
                                <EyeSlashedIcon/>
                            </Flex> : ''}

                        {message.attachments && !!message.attachments.length && attachmentsMenu(message)}

                        <span style={{whiteSpace: 'nowrap'}}>
                                    <Time time={message.created || ''} isShowFullTime={true}
                                          showTimeInShortForm={false}/>
                                </span>

                        <Menu isOpen={isContextMenuOpen} onClose={() => setIsContextMenuOpen(false)}>
                            <MenuButton
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setIsContextMenuOpen(!isContextMenuOpen)
                                }} className={styles.menuIcon}
                                transition={'all 0.5s'} backgroundColor={'transparent'} fontSize={'12px'}
                                h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon/>}>
                            </MenuButton>
                            <MenuList className={'drop-down-list'}>
                                <MenuItem
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setScope(message)
                                    }}>
                                    {message.scope !== 'hidden' ? 'Hide from project members' : 'Show to project members'}
                                </MenuItem>
                                <MenuItem
                                    onClick={() => props.hideAndShowReplyBox('reply', message)}> Reply </MenuItem>
                                <MenuItem
                                    onClick={() => props.hideAndShowReplyBox('reply-all', message)}> Reply
                                    All </MenuItem>
                                <MenuItem
                                    onClick={() => props.hideAndShowReplyBox('forward', message)}> Forward </MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>
                </Flex>
                }

                {messageIndex === index &&
                <Flex direction={'column'} w={'100%'} pb={4}>
                    <Flex align={'flex-start'}>
                        <Flex align={'center'} w={'100%'} cursor={'pointer'} gap={2} padding={4}
                              onClick={() => handleRowClick(messageIndex)}>
                            <div className={styles.mailBoxUserImage}>

                            </div>
                            <Flex w={'100%'} direction={'column'} pr={'20px'}>
                                <Flex align={'center'} justify={'space-between'} mb={1}>
                                    <Flex align={'flex-end'} gap={1}>
                                        <Heading
                                            as='h6' fontSize={'13px'} color={'#0A101D'}
                                            fontWeight={400} letterSpacing={'-0.13px'} lineHeight={1}
                                        >
                                            {message.from?.name || message.from?.email}
                                        </Heading>
                                        {message.from?.name && (
                                            <>
                                                <span className={'dot'}/>
                                                <Text
                                                    fontSize='12px' letterSpacing={'-0.13px'}
                                                    color={'#6B7280'} lineHeight={1}
                                                    fontWeight={400}
                                                >
                                                    {message.from?.email}
                                                </Text>
                                            </>
                                        )}
                                    </Flex>
                                </Flex>
                                {message && message.to && message.to.length > 0 &&
                                <Flex fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                                      fontWeight={400}>to:&nbsp;
                                    {message.to[0].email}&nbsp;

                                    <div className={styles.otherMail}>
                                        <Tooltip
                                            placement="bottom"
                                            label={
                                                (message.to.length > 1 ?
                                                    (message.to || []).slice(1, message.to.length).map((item: any, toIndex: number) => (
                                                        <p key={toIndex}>{item.email}</p>
                                                    )) : '') as any
                                            }>
                                            <Text
                                                as='u'>{message.to.length - 1 > 0 && `and ${message.to.length - 1} others`} </Text>
                                        </Tooltip>
                                    </div>
                                </Flex>
                                }
                            </Flex>
                        </Flex>
                        <Flex align={'center'} gap={'6px'} pt={4} position={'absolute'} right={0}>
                            {message.scope === 'hidden' ?
                                <Flex align={'center'} justify={'center'} className={styles.hideShowIcon}>
                                    <EyeSlashedIcon/>
                                </Flex> : ''}
                            {message.attachments && !!message.attachments.length && attachmentsMenu(message)}
                            <div className={styles.mailBoxTime} style={{whiteSpace: 'nowrap'}}>
                                <Time time={message?.created || ''} isShowFullTime={true}
                                      showTimeInShortForm={false}/>
                            </div>
                            <Menu isOpen={isContextMenuOpen} onClose={() => setIsContextMenuOpen(false)}>
                                <MenuButton
                                    onClick={() => setIsContextMenuOpen(true)} className={styles.menuIcon}
                                    transition={'all 0.5s'} backgroundColor={'transparent'} fontSize={'12px'}
                                    h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon/>}>
                                </MenuButton>
                                <MenuList className={'drop-down-list'}>
                                    <MenuItem
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setScope(message)
                                        }}>
                                        {message.scope !== 'hidden' ? 'Hide from project members' : 'Show to project members'}
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => props.hideAndShowReplyBox('reply', message)}> Reply </MenuItem>
                                    <MenuItem
                                        onClick={() => props.hideAndShowReplyBox('reply-all', message)}> Reply
                                        All </MenuItem>
                                    <MenuItem
                                        onClick={() => props.hideAndShowReplyBox('forward', message)}> Forward </MenuItem>
                                </MenuList>
                            </Menu>
                        </Flex>

                    </Flex>

                    {message.body &&
                    <div className={styles.mailBodyContent}>
                        <iframe
                            ref={ref => iframeRef.current[messageIndex] = ref}
                            scrolling="no"
                            onLoad={() => onIframeLoad(messageIndex)}
                            height={iframeHeight[messageIndex] || '0px'}
                            src={message.body as string}
                            className={styles.mailBody}
                        />
                    </div>}
                    <LinkPreview
                        isVisible={currentLinkPreview.isVisible}
                        url={currentLinkPreview?.url}
                        top={currentLinkPreview.top}
                        left={currentLinkPreview.left}
                    />
                </Flex>
                }
            </Flex>
        ))
    )
}

