import {keyPress} from "@/redux/key-navigation/action-reducer";
import {InitialKeyNavigationStateType, StateType} from "@/types";
import {MONITORED_KEYS} from "@/utils/constants";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {globalEventService, messageService, threadService} from "@/services";
import {MessageDraft} from "@/models";
import {clearDebounce, debounce} from "@/utils/common.functions";
// import {clearDebounce, debounce} from "@/utils/common.functions";

export default function KeyboardNavigationListener() {
    const dispatch = useDispatch();
    const {threads, selectedThread} = useSelector((state: StateType) => state.threads);
    const {messages, selectedMessage} = useSelector((state: StateType) => state.messages);
    const {target: lastTarget, currentMessageId, isEnabled} = useSelector((state: StateType) => state.keyNavigation);
    const {isComposing} = useSelector((state: StateType) => state.commonApis);
    const [isKeyDown, setIsKeyDown] = useState(false)

    useEffect(() => {
        const handleShortcutKeyPress = (e: KeyboardEvent | any) => {
            if (!isEnabled || isComposing) return
            if (isKeyDown) {
                e.preventDefault()
                e.stopPropagation()
                return
            }

            if (MONITORED_KEYS.map(mk => mk.key).includes(e.keyCode)) {
                // Prevents the scrollbar to scrolling while pressing up/down keys.
                e.preventDefault()
                e.stopPropagation()

                const pressedKey = MONITORED_KEYS.find(mk => mk.key === e.keyCode)
                let target = lastTarget


                if (pressedKey) {
                    let dispatchAction: InitialKeyNavigationStateType = {
                        isEnabled,
                        target,
                        action: pressedKey.value,
                    }

                    if (pressedKey?.value === 'UP' && lastTarget === 'reply-box') {
                        dispatchAction.target = 'thread'
                    }


                    if (pressedKey?.value === 'RIGHT') {
                        dispatchAction.target = 'threads'
                        // dispatchAction.messageIndex = 0
                        // threadService.toggleThreadFocused(true);

                        if (selectedThread) {
                            threadService.makeThreadAsRead(selectedThread);
                        }
                    }

                    if (pressedKey?.value === 'LEFT') {
                        dispatchAction.target = 'threads'
                        dispatchAction.currentMessageId = undefined
                        dispatchAction.threadIndex = 0
                        dispatchAction.messageIndex = 0

                        threadService.toggleThreadFocused(false);
                    }

                    if (pressedKey?.value === 'TAB') {
                        dispatchAction.target = 'threads';
                        threadService.toggleThreadFocused(true);
                        let draftMessages = [...(messages || [])].filter((item: MessageDraft) => item.mailboxes?.includes('DRAFT') && !item.draftInfo?.discardedBy);
                        if (draftMessages.length > 0) {
                            globalEventService.fireEvent({
                                data: {draftId: draftMessages[0].id},
                                type: 'draft.updateIndex'
                            })
                        } else {
                            globalEventService.fireEvent('draft.undo');
                        }
                    }

                    if (pressedKey?.value === 'ENTER') {
                        dispatchAction.target = 'threads';
                        globalEventService.fireEvent('thread.archive');
                    }

                    if (target === 'threads') {
                        const threadsLength = (threads || []).length
                        if (pressedKey?.value === 'DOWN') {
                            const currentThreadIndex = selectedThread ? threads?.findIndex(thread => thread.id === selectedThread.id) : 0
                            const nextThreadIndex = currentThreadIndex! <= threadsLength ? currentThreadIndex! + 1 : currentThreadIndex
                            const nextThread = threads && threads[nextThreadIndex as keyof object]

                            if (nextThread) {
                                threadService.setSelectedThread(nextThread);
                                messageService.setMessages([]);
                                messageService.setMessageState({showReplyBox: false});
                                clearDebounce('THREAD_SELECTION_BY_KEY');
                                debounce(() => {
                                    messageService.setMessageState({showReplyBox: true});
                                }, 1, 'THREAD_SELECTION_BY_KEY');
                                dispatchAction.threadIndex = nextThreadIndex
                                dispatchAction.currentThreadId = nextThread.id
                            }
                        } else if (pressedKey?.value === 'UP') {
                            const currentThreadIndex = selectedThread ? threads?.findIndex(thread => thread.id === selectedThread.id) : 0
                            const lastThreadIndex = currentThreadIndex! > 0 ? currentThreadIndex! - 1 : currentThreadIndex
                            const lastThread = threads && threads[lastThreadIndex as keyof object]

                            if (lastThread) {
                                threadService.setSelectedThread(lastThread);
                                messageService.setMessages([]);
                                messageService.setMessageState({showReplyBox: false});
                                clearDebounce('THREAD_SELECTION_BY_KEY');
                                debounce(() => {
                                    messageService.setMessageState({showReplyBox: true});
                                }, 1, 'THREAD_SELECTION_BY_KEY');
                                dispatchAction.threadIndex = lastThreadIndex
                                dispatchAction.currentThreadId = lastThread.id
                            }
                        }
                    }

                    if (target === 'thread') {
                        const messagesArr = (messages || [])

                        if (pressedKey?.value === 'DOWN') {
                            let currentMessageIndex = 0
                            let nextMessageIndex = 0

                            if (currentMessageId) {
                                currentMessageIndex = currentMessageId ? messagesArr.findIndex(msg => msg.id === currentMessageId) : 0
                                nextMessageIndex = currentMessageIndex < messagesArr.length - 1 ? currentMessageIndex + 1 : currentMessageIndex
                            }
                            const nextMessage = messages && messages[nextMessageIndex]

                            if (currentMessageIndex === messagesArr.length - 1) {
                                dispatchAction.target = 'reply-box'
                            }
                            messageService.setSelectedMessage(nextMessage);

                            dispatchAction.messageIndex = nextMessageIndex
                            dispatchAction.currentMessageId = nextMessage?.id
                        }

                        if (pressedKey?.value === 'UP') {
                            let currentMessageIndex = selectedMessage?.id ? messagesArr.findIndex(msg => msg.id === selectedMessage.id) : messagesArr.length - 1
                            let lastMessageIndex = currentMessageIndex

                            if (selectedMessage?.id) {
                                lastMessageIndex = currentMessageIndex > 0 ? currentMessageIndex - 1 : currentMessageIndex
                            }
                            const lastMessage = messagesArr[lastMessageIndex]
                            messageService.setSelectedMessage(lastMessage);
                            dispatchAction.messageIndex = lastMessageIndex
                            dispatchAction.currentMessageId = lastMessage?.id
                        }
                    }

                    dispatch(keyPress(dispatchAction))
                    setIsKeyDown(true)
                }
            }
        };
        window.addEventListener('keydown', handleShortcutKeyPress);
        return () => {
            window.removeEventListener('keydown', handleShortcutKeyPress);
        };
    }, [dispatch, lastTarget, threads, selectedThread, currentMessageId, messages, selectedMessage?.id, isKeyDown, isEnabled, isComposing]);

    useEffect(() => {
        const handleKeyUp = () => {
            setIsKeyDown(false)
        }

        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [])

    return (
        <></>
    )
}
