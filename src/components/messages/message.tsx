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
import { Time } from "@/components/common";
import {
  DownloadIcon, MenuIcon
} from "@/icons";
import { StateType } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAttachmentDownloadUrl,
  getMessageAttachments,
  getMessageParts, updateMessage,
  updateMessageState
} from "@/redux/messages/action-reducer";
import {Message as MessageModel, MessageDraft, MessagePart, MessageAttachments} from "@/models";
const MessagesHeader = dynamic(() => import('@/components/messages/messages-header').then(mod => mod.MessagesHeader));
const MessageBox = dynamic(() => import('@/components/messages/message-box').then(mod => mod.MessageBox));
const MessageReplyBox = dynamic(() => import('@/components/messages/message-reply-box').then(mod => mod.MessageReplyBox));
import {updateDraftState} from "@/redux/draft/action-reducer";
import {debounce} from "@/utils/common.functions";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import {updateThreadState, updateThreads} from "@/redux/threads/action-reducer";
import {EyeSlashedIcon} from "@/icons/eye-slashed.icon";
import dynamic from "next/dynamic";
import { keyPress } from "@/redux/key-navigation/action-reducer";

let cacheMessages: { [key: string]: { body: MessagePart, attachments: MessageAttachments[] } } = {};

export function Message() {
  const iframeRef = React.useRef<HTMLIFrameElement | null | any>(null);
  const messagesWrapperRef = React.useRef<HTMLDivElement | null | any>(null);
  const [iframeHeight, setIframeHeight] = React.useState("0px");

  const [index, setIndex] = useState<number | null>(null);
  const [emailPart, setEmailPart] = useState<string>("");
  const [replyType, setReplyType] = useState<string>('');
  const [replyTypeName, setReplyTypeName] = useState<string>('');
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
  const {
    selectedThread,
    isThreadLoading: threadLoading,
    isThreadFocused
  } = useSelector((state: StateType) => state.threads);
  const { target, messageIndex } = useSelector((state: StateType) => state.keyNavigation)
  const { isLoading: accountLoading } = useSelector((state: StateType) => state.accounts);
  const { isLoading: organizationLoading } = useSelector((state: StateType) => state.organizations);
  const { isLoading: usersProfilePictureLoading } = useSelector((state: StateType) => state.users);
  const { isLoading: projectsLoading } = useSelector((state: StateType) => state.projects);
  const { isLoading: summaryLoading } = useSelector((state: StateType) => state.commonApis);
  const [lastMessageDetails, setLastMessageDetails] = useState<MessageModel | null>(null);
  const [messageDetailsForReplyBox, setMessageDetailsForReplyBox] = useState<MessageModel | null>(null);
  const [isLoaderShow, setIsLoaderShow] = useState<boolean>(false);
  const [showReplyBox, setShowReplyBox] = useState<boolean>(false);

  const dispatch = useDispatch();


  useEffect(() => {
    if (!threadLoading && !accountLoading && !organizationLoading && !usersProfilePictureLoading && !projectsLoading && !summaryLoading) {
      setIsLoaderShow(false)
    } else {
      setIsLoaderShow(true)
    }
  }, [threadLoading, accountLoading, organizationLoading, usersProfilePictureLoading, projectsLoading, summaryLoading])

  useEffect(() => {
    if (selectedThread && selectedThread?.id) {
      setShowReplyBox(false)
      setIndex(null);
      setLastMessageDetails(null);
      setIframeHeight('0px');
      setMessageDetailsForReplyBox(null);
      dispatch(updateMessageState({ messages: selectedThread.messages }));
      setTimeout(() => {
        setShowReplyBox(true)
      }, 200);
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
        dispatch(updateDraftState({ draft: draftMessage as MessageDraft }));
      }
      setIndex(null);
    }
  }, [messages, dispatch])

  const setThreadFocus = useCallback((focused: boolean) => {
    if (selectedThread) {
      dispatch(updateThreadState({
        isThreadFocused: focused
      }))

      const isUnread = (selectedThread.mailboxes || []).includes('UNREAD')

      if (isUnread) {
        dispatch(updateThreads({
          id: selectedThread.id,
          body: {
            mailboxes: (selectedThread.mailboxes || []).filter(i => i !== 'UNREAD')
          }
        }))
      }
    }
  }, [dispatch, selectedThread])

  /**
   * Detects if the iframe was clicked
   */
  const onWindowBlur = useCallback(() => {
    const message = document.getElementById('message-content')
    setTimeout(() => {
      if (document && document.activeElement && document?.activeElement.tagName === "IFRAME" && message) {
        message.textContent = "clicked " + Date.now();
        setThreadFocus(true)
      }
    })
  }, [setThreadFocus])


  useEffect(() => {
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [onWindowBlur]);

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
        dispatch(updateMessageState({ messagePart: cacheMessages[lastMessageDetails.id!].body }));
      } else {
        dispatch(getMessageParts({ id: lastMessageDetails.id! }));
      }
      if (cacheMessages[lastMessageDetails.id!] && cacheMessages[lastMessageDetails.id!].attachments) {
        dispatch(updateMessageState({ messageAttachments: cacheMessages[lastMessageDetails.id!].attachments }));
      } else {
        dispatch(getMessageAttachments({ id: lastMessageDetails.id! }));
      }

      dispatch(updateMessageState({
        selectedMessage: lastMessageDetails
      }))
    }
  }, [dispatch, lastMessageDetails, inboxMessages])

  useEffect(() => {
    if (index !== null && inboxMessages && inboxMessages.length > 0) {
      if (inboxMessages[index]) {
        dispatch(updateMessageState({ selectedMessage: inboxMessages[index] }));
        // We already set index to last inbox message
        if (cacheMessages[inboxMessages[index].id!] && cacheMessages[inboxMessages[index].id!].body) {
          dispatch(updateMessageState({ messagePart: cacheMessages[inboxMessages[index].id!].body }));
        } else {
          dispatch(getMessageParts({ id: inboxMessages[index].id! }));
        }
        if (cacheMessages[inboxMessages[index].id!] && cacheMessages[inboxMessages[index].id!].attachments) {
          dispatch(updateMessageState({ messageAttachments: cacheMessages[inboxMessages[index].id!].attachments }));
        } else {
          dispatch(getMessageAttachments({ id: inboxMessages[index].id! }));
        }

      }
    }
  }, [dispatch, index, inboxMessages])


  useEffect(() => {
    if (messagePart && messagePart.data) {
      cacheMessage({ data: messagePart.data });
      let decoded = Buffer.from(messagePart.data || '', 'base64').toString('ascii');
      let addTargetBlank = decoded.replace(/<a/g, '<a target="_blank"');
      const blob = new Blob([addTargetBlank], { type: "text/html" });
      const blobUrl = window.URL.createObjectURL(blob);
      setEmailPart(blobUrl);
    } else {
      cacheMessage({ data: '' });
      setEmailPart('')
    }
  }, [cacheMessage, messagePart])

  useEffect(() => {
    // convert blob url to image url
    if (messageAttachments && messageAttachments.length) {
      cacheMessage({ attachments: messageAttachments });
    } else {
      cacheMessage({ attachments: [] });
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
      dispatch(updateMessageState({ attachmentUrl: null }));
    }
  }, [dispatch, attachmentUrl])

  useEffect(() => {
    if(target === 'thread') {
      const topPos = ((messageIndex || 0)) * 95

      setTimeout(() => {
        messagesWrapperRef.current.scrollTo({
          top: topPos,
          behavior: 'smooth'
        })
      }, 1200)
    }
  }, [target, messageIndex])

  // Set iframe height once content is loaded within iframe
  const onIframeLoad = () => {
    debounce(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.document.body.style = "margin: 0; overflow: hidden;";
        setIframeHeight((iframeRef.current.contentWindow.document.body.scrollHeight + 20) + "px");
      }
    }, 500)
  };


  const closeCompose = () => {
    setReplyType('');
    dispatch(updateMessageState({ isCompose: false }));
  }


  const hideAndShowReplayBox = (type: string = '', messageData: MessageModel) => {
    if (type === 'reply') {
      setReplyTypeName('Reply')
    } else if (type === 'reply-all') {
      setReplyTypeName('Reply All')
    } else {
      setReplyTypeName('Forward')
    }
    setReplyType(type);
    setMessageDetailsForReplyBox(messageData)
  }

  const downloadImage = (item: MessageAttachments) => {
    if (selectedMessage && selectedMessage.id) {
      dispatch(getAttachmentDownloadUrl({ id: selectedMessage.id, attachment: item.id }));
    }
  }

  const setScope = (type: string, item: any) => {
    if (item && item.id) {
      let body = {
        scope: type
      }
      dispatch(updateMessage({ id: item.id, body }))
    }
  }
  const handleRowClick = (index: any) => {
    const selectedMessageIndex = inboxMessages.findIndex(msg => msg.id === selectedMessage?.id)
    if (selectedMessageIndex === index) {
      // Clicking on an already expanded row, so close it
      dispatch(updateMessageState({
        selectedMessage: null
      }))
    } else {
      // Clicking on a new row, expand it
      const targetMessage = inboxMessages[index]
      dispatch(updateMessageState({
        selectedMessage: targetMessage
      }))
    }
  };

  
  return (
    <Box
      className={`${styles.mailBox} ${isThreadFocused ? styles.mailBoxFocused : ''}`}
      height={'calc(100vh - 180px)'} overflow={'hidden'} borderRadius={'15px'}
      onClick={() => {
        if (!isThreadFocused) {
          setThreadFocus(true)
          dispatch(keyPress({
            action: 'RIGHT',
            target: 'thread'
          }))
        }
      }}
    >
      {!selectedThread && !isCompose &&
        <Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'}
          height={'100%'}>
          {!isLoaderShow && <Heading as='h3' size='md'>Click on a thread from list to view messages!</Heading>}
          {isLoaderShow && <Flex direction={'column'} gap={2} flex={1} w={'100%'}>
            <SkeletonLoader skeletonLength={1} height={'100%'} />
          </Flex>}

        </Flex>}
      {selectedThread && !isCompose &&
        <Flex flexDir={'column'} height={'100%'}>
          <>
            <MessagesHeader inboxMessages={inboxMessages} index={index} closeCompose={closeCompose}
              headerType={'inbox'} />

            <Flex ref={messagesWrapperRef} padding={'20px'} gap={5} direction={'column'} flex={1} overflow={'auto'}>
              <Flex gap={2} direction={'column'} height={'100%'}>
                {inboxMessages && !!inboxMessages.length && inboxMessages.map((item: any, index: number) => (
                  <div key={index}>
                    <MessageBox 
                      item={item} index={index} threadDetails={item}
                      isLoading={messageLoading} emailPart={emailPart}
                      messageAttachments={messageAttachments} hideAndShowReplayBox={hideAndShowReplayBox}
                      isExpanded={selectedMessage?.id === item.id}
                      onClick={() => handleRowClick(index)}
                    />
                  </div>

                ))}


                {lastMessageDetails && (selectedMessage?.id === lastMessageDetails.id) ?
                 <Flex direction={'column'} onClick={() => handleRowClick(inboxMessages?.length)}  className={`${styles.oldMail} ${styles.lastOpenMail}`} gap={4}
                  padding={4} border={'1px solid #E5E7EB'} borderRadius={12} align={'center'}>
                  <Flex align={'center'} w={'100%'} gap={2}>
                    <div className={styles.mailBoxUserImage}>

                    </div>

                    <Flex w={'100%'} direction={'column'}>
                      <Flex align={'center'} justify={'space-between'} mb={1}>
                        <Flex align={'center'} gap={1}>
                          <Heading
                            as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400}
                            letterSpacing={'-0.13px'} lineHeight={1}
                          >
                            {lastMessageDetails?.from?.name || lastMessageDetails?.from?.email}
                          </Heading>
                          {lastMessageDetails && lastMessageDetails.from && lastMessageDetails.from.name && (
                            <>
                              <span className={'dot'} />
                              <Text
                                fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'}
                                lineHeight={1} fontWeight={400}
                              >
                                {lastMessageDetails?.from?.email}
                              </Text>
                            </>
                          )}
                        </Flex>

                        <Flex align={'center'} gap={'6px'}>
                          {lastMessageDetails.scope !== 'visible' ?
                            <Flex align={'center'} justify={'center'} className={styles.hideShowIcon}>
                              <EyeSlashedIcon />
                            </Flex> : ''}

                          <div className={styles.mailBoxTime}>
                            <Time time={lastMessageDetails?.created || ''}
                              isShowFullTime={true} showTimeInShortForm={false} />
                          </div>
                          <Menu>
                            <MenuButton className={styles.menuIcon} transition={'all 0.5s'}
                              backgroundColor={'transparent'} fontSize={'12px'}
                              h={'auto'} minWidth={'24px'} padding={'0'} as={Button}
                              rightIcon={<MenuIcon />}>
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
                                onClick={() => hideAndShowReplayBox('reply-all', lastMessageDetails)}> Reply
                                All </MenuItem>
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
                            {lastMessageDetails.to[0].email}&nbsp; <Text
                              as='u'>{lastMessageDetails.to.length - 1 > 0 && `and ${lastMessageDetails.to.length - 1} others`} </Text>
                          </Flex>
                        }
                      </Flex>
                    </Flex>
                  </Flex>
                  {(!messageLoading && emailPart) &&
                    <div className={styles.mailBodyContent}>
                      <iframe
                        id='message-content'
                        ref={iframeRef}
                        src={emailPart}
                        onLoad={onIframeLoad}
                        height={iframeHeight}
                        frameBorder="0"
                        className={styles.mailBody}
                      />
                    </div>}
                  {messageAttachments && !!messageAttachments.length && messageAttachments?.map((item: MessageAttachments, i) => (

                    <div className={styles.mailBodyAttachments} key={i}>
                      <Flex align={'center'} className={styles.attachmentsFile}>
                        {item.filename}
                        <div className={`${styles.closeIcon} ${styles.downloadIcon}`}
                          onClick={() => downloadImage(item)}>
                          <DownloadIcon />
                        </div>
                      </Flex>
                    </div>
                  ))}

                </Flex> : <Flex border={'1px solid #E5E7EB'}  onClick={() => handleRowClick(inboxMessages?.length)}  borderRadius={12} align={'center'} w={'100%'} gap={2} cursor={'pointer'} padding={4} >
                  <div className={styles.mailBoxUserImage}>
                  </div>

                  <Flex w={'100%'} direction={'column'}>
                    <Flex align={'center'} justify={'space-between'} mb={1}>
                      <Heading as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400}
                        letterSpacing={'-0.13px'} lineHeight={1}>{lastMessageDetails?.from?.name}</Heading>
                      <Flex align={'center'} className={styles.mailBoxTime} gap={3}>
                        {lastMessageDetails?.scope !== 'visible' ? <Flex align={'center'} justify={'center'} className={styles.hideShowIcon}>
                          <EyeSlashedIcon />
                        </Flex> : ''}
                        <Time time={lastMessageDetails?.created || ''} isShowFullTime={true} showTimeInShortForm={false} />
                      </Flex>
                    </Flex>
                    <Text fontSize='13px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                      fontWeight={400}>{lastMessageDetails?.snippet || '(no content)'}</Text>
                  </Flex>
                </Flex>
                }

                {showReplyBox &&
                  <MessageReplyBox
                    emailPart={(messagePart?.data || '')} messageData={messageDetailsForReplyBox}
                    threadDetails={lastMessageDetails}
                    replyType={replyType}
                    hideAndShowReplayBox={hideAndShowReplayBox} replyTypeName={replyTypeName} />
                }
              </Flex>
            </Flex>
          </>
        </Flex>
      }
    </Box>
  )
}
