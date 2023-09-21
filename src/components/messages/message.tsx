import styles from "@/styles/Inbox.module.css";
import {
  Box,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { StateType } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMessageAttachments,
  getMessageParts,
  updateMessageState
} from "@/redux/messages/action-reducer";
import {Message as MessageModel, MessageDraft, MessagePart, MessageAttachments} from "@/models";
const MessagesHeader = dynamic(() => import('@/components/messages/messages-header').then(mod => mod.MessagesHeader));
const MessageBox = dynamic(() => import('@/components/messages/message-box').then(mod => mod.MessageBox));
const MessageReplyBox = dynamic(() => import('@/components/messages/message-reply-box').then(mod => mod.MessageReplyBox));
import {updateDraftState} from "@/redux/draft/action-reducer";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import {updateThreadState, updateThreads} from "@/redux/threads/action-reducer";
import dynamic from "next/dynamic";
import { keyPress } from "@/redux/key-navigation/action-reducer";

let cacheMessages: { [key: string]: { body: MessagePart, attachments: MessageAttachments[] } } = {};

export function Message() {
  const messagesWrapperRef = React.useRef<HTMLDivElement | null | any>(null);

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
      setInboxMessages([...currentInboxMessages]);
      const draftMessage = messages.findLast((msg: MessageModel) => (msg.mailboxes || []).includes('DRAFT'));
      if (draftMessage) {
        dispatch(updateDraftState({ draft: draftMessage as MessageDraft }));
      }
      setIndex(currentInboxMessages.length - 1);
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
    if (index === null) {
      return;
    }
    let messageId = inboxMessages[index].id;
    if (messageId) {
      cacheMessages = {
        ...cacheMessages,
        [messageId]: {
          ...cacheMessages[messageId],
          ...body
        }
      }
    }
  }, [inboxMessages, index])

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

                {showReplyBox &&
                  <MessageReplyBox
                    emailPart={(messagePart?.data || '')} messageData={messageDetailsForReplyBox}
                    threadDetails={index !== null && inboxMessages[index]}
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
