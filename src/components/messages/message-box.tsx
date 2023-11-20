import styles from "@/styles/Inbox.module.css";
import {Button, Flex, Heading, Menu, MenuButton, MenuItem, MenuList, Text} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {MenuIcon} from "@/icons";
import React, {useEffect, useState} from "react";
import {
  getAllMessages,
    getAttachmentDownloadUrl,
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
import {globalEventService, messageService, socketService, threadService} from "@/services";
import LinkPreview from "../common/link-preview";
import {LinkPreviewProps} from "@/types/props-types/link-preview.types";
import Image from "next/image";
import {getPlainTextFromHtml} from "@/utils/editor-common-functions";

export function MessageBox(props: any) {
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {success: draftSuccess, updatedDraft} = useSelector((state: StateType) => state.draft);
    const {newMessage} = useSelector((state: StateType) => state.socket);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean[]>([]);
    const iframeRef = React.useRef<any>([]);
    const [iframeHeight, setIframeHeight] = useState<{ [key: number]: string }>({});
    const dispatch = useDispatch();
    const {
        messages
    } = useSelector((state: StateType) => state.messages);
    const {selectedThread: currentSelectedThread} = useSelector((state: StateType) => state.threads);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const [isAttachmentOpen, setIsAttachmentOpen] = useState<boolean[]>([]);
    const [currentLinkPreview, setCurrentLinkPreview] = useState<LinkPreviewProps>({
        isVisible: false,
        url: null,
        top: 0,
        left: 0
    })
    const [inboxMessages, setInboxMessages] = useState<MessageModel[]>([]);
    const [draftMessages, setDraftMessages] = useState<MessageModel[]>([]);
    const [index, setIndex] = useState<number | null>(null);

    useEffect(() => {
        if (draftSuccess) {
            if (updatedDraft) {
                if (draftMessages && draftMessages[0] && updatedDraft.threadId !== draftMessages[0].threadId) {
                    return;
                }
                let finalMessages = [...(draftMessages || [])]
                let findDraft = finalMessages.findIndex((item: Message) => item.id === updatedDraft.id);
                if (findDraft !== -1) {
                    finalMessages[findDraft] = updatedDraft;
                } else {
                    globalEventService.fireEvent({
                        data: {
                            callBack: (value: string) => {
                                finalMessages.push({...updatedDraft, draftInfo: {...updatedDraft.draftInfo, body: value}});
                                setDraftMessages([...finalMessages]);
                                globalEventService.blankEvent();
                            }
                        }, type: 'richtexteditor.getCurrentData'
                    });
                }
                setDraftMessages([...finalMessages]);
            }
        }
    }, [draftSuccess, updatedDraft, draftMessages])

    useEffect(() => {
        if (currentSelectedThread && currentSelectedThread?.id) {
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
    }, [currentSelectedThread, selectedAccount])

    useEffect(() => {
        if (messages && messages.length > 0) {
            // remove draft messages and set index to last inbox message
            const currentInboxMessages: MessageModel[] = messages.filter((msg: MessageModel) => !(msg.mailboxes || []).includes('DRAFT'));
            setInboxMessages([...currentInboxMessages]);
            const currentDraftMessages: MessageModel[] = messages.filter((msg: MessageModel) => (msg.mailboxes || []).includes('DRAFT'));
            setDraftMessages([...currentDraftMessages]);
            let finalArray: boolean[] = [];
            currentInboxMessages.forEach(() => {
                finalArray.push(false);
            })
            setIsMoreMenuOpen([...finalArray]);
            setIsAttachmentOpen([...finalArray]);
            // if (index === null) {
            // }
            setIndex(currentInboxMessages.length - 1);
        }
    }, [messages, dispatch])

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
                [index]: (iframeRef.current[index].contentWindow.document.body.scrollHeight + 32)
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
                            top: -100,
                            left: -100
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
            setIndex(null)
        } else {
            setIndex(selectIndex);
        }
    };

    useEffect(() => {
        if (messages && messages.length > 0) {
            let lastIndex = index;
            if (lastIndex === null) {
                lastIndex = messages.length - 1;
            }
            // Clicking on a new row, expand it
            const targetMessage = (messages || [])[lastIndex]
            messageService.setSelectedMessage(targetMessage)
        }
    }, [index, messages])

    useEffect(() => {
      if (newMessage) {
          socketService.updateSocketMessage(null);
          if(newMessage.name === 'DraftCreated' || newMessage.name === 'DraftUpdated') {
            dispatch(getAllMessages)
          }
      }
  }, [newMessage])

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

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsMoreMenuOpen(prevState => {
                return prevState.map(() => false);
            });
        }
    }, [incomingEvent]);

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

    return (
        <>
            {inboxMessages && inboxMessages.length > 0 && inboxMessages.map((message: Message, messageIndex) => (
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

                            <span style={{whiteSpace: 'nowrap'}}>
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
                        <Flex align={'flex-start'} className={styles.maxBoxMailHeader}>
                            <Flex align={'center'} w={'100%'} cursor={'pointer'} gap={2} padding={4}
                                  onClick={() => handleRowClick(messageIndex)}>
                                {/*<div className={styles.mailBoxUserImage}>*/}

                                {/*</div>*/}
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
                        <div className={styles.mailBodyContent} style={{ height: iframeRef.current[messageIndex] && iframeHeight[messageIndex] ? parseFloat(iframeHeight[messageIndex]) - 32 : 'auto' }}>
                            <iframe
                                ref={ref => iframeRef.current[messageIndex] = ref}
                                onLoad={() => onIframeLoad(messageIndex)}
                                scrolling="no"
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
            }

            {draftMessages && draftMessages.length > 0 && draftMessages.map((message: Message, messageIndex) => {
                if (message.draftInfo?.discardedBy) {
                    return null
                }
                return (
                    <div key={messageIndex}>
                        <Flex direction={'column'} cursor={'pointer'} mb={3} onClick={() => {
                            globalEventService.fireEvent({data: {draftId: message.id}, type: 'draft.updateIndex'})
                        }} gap={2} padding={4} borderRadius={'10px'} border={'1px dashed #E5E7EB'}>
                            <Flex align={'center'} justify={'space-between'} gap={2}>
                                <Flex align={'center'} gap={2}>
                                    <Flex width={'20px'} height={'20px'} borderRadius={'50%'} overflow={'hidden'}>
                                        <div className={'member-photo'} key={index}
                                             style={{background: '#000'}}>
                                            {message?.draftInfo?.createdByAvatarURL &&
                                            <Image src={message?.draftInfo?.createdByAvatarURL} width="24" height="24"
                                                   alt=""/>}
                                        </div>
                                    </Flex>
                                    <Text fontSize={'13px'}
                                          color={'#0A101D'}> {message?.draftInfo?.createdBy || ''} </Text>
                                </Flex>
                                {/*<Text fontSize={'11px'} color={'#6B7280'}>*/}
                                {/*    Saved <Time fontSize={'11px'} as={'span'} time={message?.updated || ''} isShowFullTime={false}*/}
                                {/*                showTimeInShortForm={true}/>&nbsp;ago </Text>*/}
                            </Flex>

                            <Flex>
                                <Text fontSize={'13px'} color={'#6B7280'} noOfLines={1}>
                                    {getPlainTextFromHtml(message.draftInfo?.body || '')}
                                </Text>
                            </Flex>
                        </Flex>
                    </div>
                )
            })}
        </>
    )
}

