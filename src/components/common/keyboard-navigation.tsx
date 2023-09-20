import { keyPress } from "@/redux/key-navigation/action-reducer";
import { updateMessageState } from "@/redux/messages/action-reducer";
import { updateThreadState } from "@/redux/threads/action-reducer";
import { InitialKeyNavigationStateType, StateType } from "@/types";
import { MONITORED_KEYS } from "@/utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function KeyboardNavigationListener() {
  const dispatch = useDispatch();
  const { threads, selectedThread } = useSelector((state: StateType) => state.threads);
  const { messages, selectedMessage } = useSelector((state: StateType) => state.messages);
  const { target: lastTarget, currentMessageId } = useSelector((state: StateType) => state.keyNavigation);

  useEffect(() => {
    const handleShortcutKeyPress = (e: KeyboardEvent | any) => {
      if (MONITORED_KEYS.map(mk => mk.key).includes(e.keyCode)) {
        // Prevents the scrollbar to scrolling while pressing up/down keys.
        e.preventDefault()
        e.stopPropagation()

        const pressedKey = MONITORED_KEYS.find(mk => mk.key === e.keyCode)
        let target = lastTarget

        if (pressedKey) {
          let dispatchAction: InitialKeyNavigationStateType = {
            action: pressedKey.value,
            target
          }

          if(pressedKey?.value === 'UP' && lastTarget === 'reply-box') {
            dispatchAction.target = 'thread'
          }


          if (pressedKey?.value === 'RIGHT') {
            dispatchAction.target = 'thread'
            dispatch(updateThreadState({
              isThreadFocused: true
            }))
          }

          if (pressedKey?.value === 'LEFT') {
            dispatchAction.target = 'threads'
            dispatchAction.currentMessageId = undefined
            dispatch(updateThreadState({
              isThreadFocused: false
            }))
          }

          if (target === 'threads') {
            const threadsLength = (threads || []).length
            if (pressedKey?.value === 'DOWN') {
              const currentThreadIndex = selectedThread ? threads?.findIndex(thread => thread.id === selectedThread.id) : 0
              const nextThreadIndex = currentThreadIndex! <= threadsLength ? currentThreadIndex! + 1 : currentThreadIndex
              const nextThread = threads && threads[nextThreadIndex as keyof object]

              if (nextThread) {
                dispatch(updateThreadState({
                  selectedThread: nextThread
                }))
                dispatchAction.threadIndex = nextThreadIndex
                dispatchAction.currentThreadId = nextThread.id
              }
            } else if (pressedKey?.value === 'UP') {
              const currentThreadIndex = selectedThread ? threads?.findIndex(thread => thread.id === selectedThread.id) : 0
              const lastThreadIndex = currentThreadIndex! > 0 ? currentThreadIndex! - 1 : currentThreadIndex
              const lastThread = threads && threads[lastThreadIndex as keyof object]

              if (lastThread) {
                dispatch(updateThreadState({
                  selectedThread: lastThread
                }))
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

              dispatch(updateMessageState({
                selectedMessage: nextMessage
              }))

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

              dispatch(updateMessageState({
                selectedMessage: lastMessage
              }))
              dispatchAction.messageIndex = lastMessageIndex
              dispatchAction.currentMessageId = lastMessage?.id
            }
          }

          dispatch(keyPress(dispatchAction))
        }
      }
    };
    window.addEventListener('keydown', handleShortcutKeyPress);
    return () => {
      window.removeEventListener('keydown', handleShortcutKeyPress);
    };
  }, [dispatch, lastTarget, threads, selectedThread, currentMessageId, messages, selectedMessage?.id]);

  /**
   * Brings back the focus to the window
   * when an iframe is clicked.
   */
  useEffect(() => {
    const handleWindowBlur = () => {
      setTimeout(() => {
        window.focus()
      }, 500)
    }
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [])

  return (
    <></>
  )
}