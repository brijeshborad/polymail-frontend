import {Message as MessageModel, MessageAttachments, MessageDraft} from "@/models";
import {
    Button,
    createStandaloneToast,
    Flex,
    Heading,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {Time} from "@/components/common";
import {EyeSlashedIcon} from "@/icons/eye-slashed.icon";
import {MenuIcon} from "@/icons";
import Tooltip from "@/components/common/Tooltip";
import IframeLoader from "@/components/common/iframe-loader";
import React, {useEffect, useRef, useState} from "react";
import {getAttachmentDownloadUrl, updateMessage} from "@/redux/messages/action-reducer";
import {globalEventService, messageService, threadService} from "@/services";
import {AttachmentIcon, ChevronDownIcon, CopyIcon} from "@chakra-ui/icons";
import {DefaultExtensionType, defaultStyles, FileIcon} from "react-file-icon";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {generateToasterId, getRecipientText, getSenderText} from "@/utils/common.functions";
import {Toaster} from "../common";
import {sendMessage} from "@/redux/draft/action-reducer";

const {toast} = createStandaloneToast()
let previousToastId: string = '';

export function MessageItems() {
    const dispatch = useDispatch();
    const lastMessageRef = useRef<HTMLDivElement | null | any>(null)

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
            if (currentInboxMessages.length > 1) {
                setTimeout(() => {
                    if (lastMessageRef && lastMessageRef.current) {
                        lastMessageRef.current.scrollIntoView({behavior: 'smooth', block: "start"});
                    }
                }, 500);
            }
        }
    }, [messages, dispatch])

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsMoreMenuOpen(prevState => {
                return prevState.map(() => false);
            });
            setIsAttachmentOpen(prevState => {
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

    function attachmentsMenu(message: MessageModel, index: number) {
        return <Menu
            autoSelect={false}
            isOpen={isAttachmentOpen[index]}
            onClose={() => {
                openAttachmentMenu(index, false)
            }}>
            <MenuButton
                className={styles.tabListAttachmentButton} minWidth={'1px'} padding={'0 4px 0 0'} margin={0}
                borderRadius={'3px'} backgroundColor={'transparent'} height={'auto'} outline={"none"}
                _focusVisible={{boxShadow: 'none'}} _hover={{background: '#f1f1f1'}} _active={{background: 'none'}}
                fontSize={'13px'} color={'#6B7280'} as={Button} mx={1}
                leftIcon={<ChevronDownIcon strokeWidth={0} className={styles.dropDownIcon}/>}
                onClick={() => {
                    openAttachmentMenu(index)
                }}
            >
                <AttachmentIcon strokeWidth={0}/>
            </MenuButton>

            <MenuList className={`${styles.tabListDropDown} drop-down-list`}>
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

    function copyData(type: 'sender' | 'recipient', message: MessageModel) {
        let text = type === 'sender' ? getSenderText(message) : getRecipientText(message);
        navigator.clipboard.writeText(text)
        if (previousToastId) {
            toast.close(previousToastId);
        }
        previousToastId = generateToasterId();
        Toaster({
            id: previousToastId,
            type: 'success',
            title: type === 'sender' ? 'Sender has been copied to clipboard.' : 'Recipient has been copied to clipboard.',
            desc: 'Paste this wherever you please'
        })
    }

    function resendMessage(draft: MessageDraft | MessageModel) {
        dispatch(sendMessage({body: {id: draft.id!, now: true}}));
        messageService.toggleFailed(draft, false);
    }

    return (
        inboxMessages && inboxMessages.length > 0 && inboxMessages.map((message: MessageModel, messageIndex) => (
            <Flex position={'relative'} direction={'column'} key={messageIndex}
                  className={`${styles.oldMail} ${messageIndex === index ? styles.lastOpenMail : ''}`} mb={2}
                  gap={4} border={'1px solid #E5E7EB'} borderRadius={12} align={'center'}>
                {messageIndex !== index &&
                <Flex align={'flex-start'} width={'100%'} _hover={{backgroundColor: 'rgba(0, 0, 0, 0.01)'}}>
                    <Flex align={'center'} w={'100%'} gap={2} cursor={'pointer'} padding={3} borderColor={'#E5E7EB'}
                          onClick={() => handleRowClick(messageIndex)} className={styles.mailBoxHideMail}>
                        {/*<div className={styles.mailBoxUserImage}>*/}

                        {/*</div>*/}

                        <Flex w={'100%'} direction={'column'}>
                            <Flex align={'center'} justify={'space-between'} mb={1} minH={5} userSelect={'none'}>
                                <Heading as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400}
                                         letterSpacing={'-0.13px'} userSelect={'none'}
                                         lineHeight={1}>{message.from?.name || message.from?.email}</Heading>
                            </Flex>
                            <span className={styles.mailBoxTimeMobile} style={{whiteSpace: 'nowrap'}}>
                                    <Time time={message.created || ''} isShowFullTime={true}
                                          showTimeInShortForm={false}/>
                                </span>
                            <Text fontSize='13px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1.2}
                                  fontWeight={400} noOfLines={1} userSelect={'none'}>
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

                        <span className={styles.mailBoxTimeDesktop} style={{
                            whiteSpace: 'nowrap',
                            display: "flex",
                            alignItems: 'flex-end',
                            flexDirection: 'column'
                        }}>
                                        <Time time={message.created || ''} isShowFullTime={true}
                                              showTimeInShortForm={false}/>

                            {message?.draftInfo?.error &&
                            <Text margin={0} padding={0} color={'blue !important'} textDecoration={'underline'}
                                  cursor={'pointer'} onClick={() => resendMessage(message)}>Sending
                                failed, try again?</Text>}
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
                <Flex direction={'column'} w={'100%'} pb={4} ref={lastMessageRef}>
                    <Flex align={'flex-start'} className={styles.mailBoxMailHeader}>
                        <Flex align={'center'} w={'100%'} cursor={'pointer'} gap={2} py={4} pr={4} pl={3}
                              onClick={() => handleRowClick(messageIndex)}>
                            {/*<div className={styles.mailBoxUserImage}>*/}

                            {/*</div>*/}
                            <Flex w={'100%'} direction={'column'} pr={'20px'}>
                                <Flex align={'center'} justify={'space-between'} mb={1} userSelect={'none'}>
                                    <Flex align={'flex-end'} className={styles.mailBoxMailHeaderDetails} gap={1}>
                                        <Heading
                                            as='h6' fontSize={'13px'} color={'#0A101D'} userSelect={'none'}
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
                                                    fontWeight={400} userSelect={'none'}
                                                >
                                                    {message.from?.email}
                                                </Text>
                                            </>
                                        )}
                                        <div className={styles.copyIcon} onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            copyData('sender', message)
                                        }}>
                                            <CopyIcon strokeWidth={0}/>
                                        </div>
                                    </Flex>
                                </Flex>
                                {message && message.to && message.to.length > 0 &&
                                <Flex fontSize='12px' letterSpacing={'-0.13px'} w={'fit-content'} color={'#6B7280'}
                                      lineHeight={1}
                                      fontWeight={400} userSelect={'none'} className={styles.recipient}>to:&nbsp;
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
                                            <Text userSelect={'none'}
                                                  as='u'>{message.to.length - 1 > 0 && `and ${message.to.length - 1} others`} </Text>
                                        </Tooltip>
                                    </div>
                                    <div className={styles.copyIcon} onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        copyData('recipient', message)
                                    }}>
                                        <CopyIcon strokeWidth={0}/>
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
                            <div className={styles.mailBoxTime} style={{
                                whiteSpace: 'nowrap', display: "flex",
                                alignItems: 'flex-end',
                                flexDirection: 'column'
                            }}>
                                <Time time={message?.created || ''} isShowFullTime={true}
                                      showTimeInShortForm={false}/>
                                {message?.draftInfo?.error &&
                                <Text margin={0} padding={0} color={'blue !important'} textDecoration={'underline'}
                                      cursor={'pointer'} onClick={() => resendMessage(message)}>Sending failed, try
                                    again?</Text>}
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
