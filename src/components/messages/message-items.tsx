import {Message as MessageModel, Message, MessageAttachments} from "@/models";
import {Button, Flex, Heading, Menu, MenuButton, MenuItem, MenuList, Text} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {Time} from "@/components/common";
import {EyeSlashedIcon} from "@/icons/eye-slashed.icon";
import {MenuIcon} from "@/icons";
import Tooltip from "@/components/common/Tooltip";
import IframeLoader from "@/components/common/iframe-loader";
import React, {useEffect, useState} from "react";
import {getAttachmentDownloadUrl, updateMessage} from "@/redux/messages/action-reducer";
import {globalEventService, messageService, threadService} from "@/services";
import {clearDebounce, debounce} from "@/utils/common.functions";
import {AttachmentIcon} from "@chakra-ui/icons";
import {DefaultExtensionType, defaultStyles, FileIcon} from "react-file-icon";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";

export function MessageItems() {
    const dispatch = useDispatch();

    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {selectedThread: currentSelectedThread} = useSelector((state: StateType) => state.threads);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {messages, attachmentUrl} = useSelector((state: StateType) => state.messages);

    const [index, setIndex] = useState<number | null>(null);
    const [inboxMessages, setInboxMessages] = useState<MessageModel[]>([]);
    const [isAttachmentOpen, setIsAttachmentOpen] = useState<boolean[]>([]);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean[]>([]);

    useEffect(() => {
        if (currentSelectedThread && currentSelectedThread?.id) {
            if (inboxMessages[0] && inboxMessages[0].threadId === currentSelectedThread.id) {
                return;
            }
            setIndex(null);
            let eventData: any = {type: 'reply'};
            let noDraftMessage = (currentSelectedThread.messages || []).filter((msg: MessageModel) => !(msg.mailboxes || []).includes('DRAFT'));
            if (selectedAccount) {
                noDraftMessage = noDraftMessage.filter((msg: MessageModel) => msg.from?.email !== selectedAccount.email);
            }
            let latestMessage: MessageModel = noDraftMessage[noDraftMessage.length - 1];
            if (latestMessage) {
                let to = (latestMessage.to || []).filter((t: any) => t.email);
                let cc = (latestMessage.cc || []).filter((t: any) => t.email);
                if (to.length > 1 || cc.length > 1) {
                    eventData = {type: 'reply-all', messageData: latestMessage};
                }
            }
            globalEventService.fireEvent({data: eventData, type: 'draft.updateType'})
            messageService.setMessages(currentSelectedThread.messages || []);
        }
    }, [currentSelectedThread, inboxMessages, selectedAccount])

    useEffect(() => {
        if (messages && messages.length > 0) {
            // remove draft messages and set index to last inbox message
            const currentInboxMessages: MessageModel[] = messages.filter((msg: MessageModel) => !(msg.mailboxes || []).includes('DRAFT'));
            setInboxMessages([...currentInboxMessages]);
            let finalArray: boolean[] = [];
            currentInboxMessages.forEach(() => {
                finalArray.push(false);
            })
            setIsMoreMenuOpen([...finalArray]);
            setIsAttachmentOpen([...finalArray]);
            setIndex(currentInboxMessages.length - 1);
        }
    }, [messages, dispatch])

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsMoreMenuOpen(prevState => {
                return prevState.map(() => false);
            });
        }
    }, [incomingEvent]);

    useEffect(() => {
        if (messages && messages.length > 0) {
            let lastIndex = index;
            if (lastIndex === null) {
                lastIndex = messages.length - 1;
            }
            const targetMessage = (messages || [])[lastIndex]
            messageService.setSelectedMessage(targetMessage)
        }
    }, [index, messages])

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

    const handleRowClick = (selectIndex: any) => {
        if (selectIndex === index) {
            setIndex(null)
        } else {
            setIndex(selectIndex);
        }
    };

    const downloadImage = (message: MessageModel, item: MessageAttachments) => {
        if (message && message.id) {
            dispatch(getAttachmentDownloadUrl({body: {id: message.id, attachment: item.id}}));
        }
    }

    const hideAndShowReplyBox = (type: string = '', messageData: MessageModel) => {
        globalEventService.fireEvent({data: messageData, type: 'draft.currentMessage'})
        setTimeout(() => {
            globalEventService.fireEvent({type: 'draft.updateType', data: {type, messageData}})
        }, 100)
    }

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

    function attachmentsMenu(message: Message, index: number) {
        return <Menu
            isOpen={isAttachmentOpen[index]}
            onClose={() => {
                openAttachmentMenu(index, false)
            }}>
            <MenuButton
                className={styles.tabListAttachmentButton} minWidth={'1px'} padding={0}
                borderRadius={0} backgroundColor={'transparent'} height={'auto'} outline={"none"}
                _focusVisible={{boxShadow: 'none'}} _hover={{background: 'none'}} _active={{background: 'none'}}
                fontSize={'13px'} color={'#6B7280'} as={Button} mx={1}
                onMouseEnter={() => {
                    clearDebounce(message.id);
                    openAttachmentMenu(index)
                }}
                onMouseLeave={() => {
                    debounce(() => {
                        openAttachmentMenu(index, false)
                    }, 200, message.id)
                }}
                onMouseOut={() => {
                    debounce(() => {
                        openAttachmentMenu(index, false)
                    }, 200, message.id)
                }}
            >
                <AttachmentIcon/>
            </MenuButton>

            <MenuList
                className={`${styles.tabListDropDown} drop-down-list`}
                onMouseEnter={() => {
                    clearDebounce(message.id);
                    openAttachmentMenu(index)
                }}
                onMouseLeave={() => {
                    debounce(() => {
                        openAttachmentMenu(index, false)
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

    function openAttachmentMenu(index: number, open: boolean = true) {
        let attachmentMenu = [];
        if (!open) {
            attachmentMenu = [...isAttachmentOpen].map(((item: boolean, idx: number) => {
                if (index === idx) {
                    return false
                }
                return item;
            }))
        } else {
            attachmentMenu = [...isAttachmentOpen].map(((item: boolean, idx: number) => {
                return index === idx;
            }))
        }
        setIsAttachmentOpen([...attachmentMenu]);
    }

    function openMoreMenu(index: number, open: boolean = true) {
        let moreMenu = [];
        if (!open) {
            moreMenu = [...isMoreMenuOpen].map(((item: boolean, idx: number) => {
                if (index === idx) {
                    return false
                }
                return item;
            }))
        } else {
            moreMenu = [...isMoreMenuOpen].map(((item: boolean, idx: number) => {
                return index === idx;
            }))
        }
        setIsMoreMenuOpen([...moreMenu]);
    }

    return (
        inboxMessages && inboxMessages.length > 0 && inboxMessages.map((message: Message, messageIndex) => (
            <Flex position={'relative'} direction={'column'} key={messageIndex}
                  className={`${styles.oldMail} ${messageIndex === index ? styles.lastOpenMail : ''}`} mb={3}
                  gap={4}
                  border={'1px solid #F3F4F6'} borderRadius={12} align={'center'}>
                {messageIndex !== index &&
                <Flex align={'flex-start'} width={'100%'} _hover={{backgroundColor: 'rgba(0, 0, 0, 0.01)'}}>
                    <Flex align={'center'} w={'100%'} gap={2} cursor={'pointer'} padding={4}
                          onClick={() => handleRowClick(messageIndex)} className={styles.mailBoxHideMail}>
                        {/*<div className={styles.mailBoxUserImage}>*/}

                        {/*</div>*/}

                        <Flex w={'100%'} direction={'column'}>
                            <Flex align={'center'} justify={'space-between'} mb={1} minH={5}>
                                <Heading as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400}
                                         letterSpacing={'-0.13px'}
                                         lineHeight={1}>{message.from?.name || message.from?.email}</Heading>
                            </Flex>
                            <span className={styles.mailBoxTimeMobile} style={{whiteSpace: 'nowrap'}}>
                                    <Time time={message.created || ''} isShowFullTime={true}
                                          showTimeInShortForm={false}/>
                                </span>
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

                        {message.attachments && !!message.attachments.length && attachmentsMenu(message, messageIndex)}

                        <span className={styles.mailBoxTimeDesktop} style={{whiteSpace: 'nowrap'}}>
                                        <Time time={message.created || ''} isShowFullTime={true}
                                              showTimeInShortForm={false}/>
                                    </span>

                        <Menu isOpen={isMoreMenuOpen[messageIndex]}
                              onClose={() => openMoreMenu(messageIndex, false)}>
                            <MenuButton
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    openMoreMenu(messageIndex, !isMoreMenuOpen[messageIndex])
                                }} className={styles.menuIcon}
                                transition={'all 0.5s'} backgroundColor={'transparent'} fontSize={'12px'}
                                h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon/>}>
                            </MenuButton>
                            <MenuList className={'drop-down-list'}>
                                <MenuItem
                                    onClick={() => hideAndShowReplyBox('reply', message)}> Reply </MenuItem>
                                <MenuItem
                                    onClick={() => hideAndShowReplyBox('reply-all', message)}> Reply
                                    All </MenuItem>
                                <MenuItem
                                    onClick={() => hideAndShowReplyBox('forward', message)}> Forward </MenuItem>
                                <MenuItem
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setScope(message)
                                    }}>
                                    {message.scope !== 'hidden' ? 'Hide from project members' : 'Show to project members'}
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>
                </Flex>
                }

                {messageIndex === index &&
                <Flex direction={'column'} w={'100%'} pb={4}>
                    <Flex align={'flex-start'} className={styles.mailBoxMailHeader}>
                        <Flex align={'center'} w={'100%'} cursor={'pointer'} gap={2} padding={4}
                              onClick={() => handleRowClick(messageIndex)}>
                            {/*<div className={styles.mailBoxUserImage}>*/}

                            {/*</div>*/}
                            <Flex w={'100%'} direction={'column'} pr={'20px'}>
                                <Flex align={'center'} justify={'space-between'} mb={1}>
                                    <Flex align={'flex-end'} className={styles.mailBoxMailHeaderDetails} gap={1}>
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

                                    <div className={styles.otherMail} onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}>
                                        <Tooltip
                                            closeOnClick={'no'}
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
                            {message.attachments && !!message.attachments.length && attachmentsMenu(message, messageIndex)}
                            <div className={styles.mailBoxTime} style={{whiteSpace: 'nowrap'}}>
                                <Time time={message?.created || ''} isShowFullTime={true}
                                      showTimeInShortForm={false}/>
                            </div>
                            <Menu isOpen={isMoreMenuOpen[messageIndex]}
                                  onClose={() => openMoreMenu(messageIndex, false)}>
                                <MenuButton
                                    onClick={() => openMoreMenu(messageIndex)} className={styles.menuIcon}
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
                                        onClick={() => hideAndShowReplyBox('reply', message)}> Reply </MenuItem>
                                    <MenuItem
                                        onClick={() => hideAndShowReplyBox('reply-all', message)}> Reply
                                        All </MenuItem>
                                    <MenuItem
                                        onClick={() => hideAndShowReplyBox('forward', message)}> Forward </MenuItem>
                                </MenuList>
                            </Menu>
                        </Flex>

                    </Flex>

                    {message.body &&
                    <div className={styles.mailBodyContent}>
                        <IframeLoader body={message.body as string}/>
                    </div>}
                </Flex>
                }
            </Flex>
        ))
    )
}
