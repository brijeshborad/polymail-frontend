import {Thread, UserProjectOnlineStatus} from "@/models";
import styles from "@/styles/Inbox.module.css";
import { Flex, Input } from "@chakra-ui/react";
import React, {useEffect, useCallback, useRef, useState, RefObject} from "react";
import { updateMessageState } from "@/redux/messages/action-reducer";
import { updateThreadState } from "@/redux/threads/action-reducer";
import { updateDraftState } from "@/redux/draft/action-reducer";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "@/types";
import { ThreadListProps } from "@/types";
const ThreadsSideBarListItem = dynamic(() => import("./side-bar-list-item").then(mod => mod.ThreadsSideBarListItem));
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import {updateCommonState} from "@/redux/common-apis/action-reducer";
import {
  getCurrentSelectedThreads, getMemberStatusCache,
  setCurrentSelectedThreads, setMemberStatusCache,
} from "@/utils/cache.functions";
import {debounceInterval} from "@/utils/common.functions";
import dayjs from "dayjs";

export function ThreadsSideBarList(props: ThreadListProps) {
  const { selectedThread, threads} = useSelector((state: StateType) => state.threads);
  const {selectedAccount} = useSelector((state: StateType) => state.accounts);
  const [currentThreadRef, setCurrentThreadRef] = useState<RefObject<HTMLDivElement> | null>(null);
  const dispatch = useDispatch()
  const listRef = useRef<any>(null);
  const router = useRouter();
  const routePaths = router.pathname.split('/');
  const editorRef = useRef<any>(null);
  const { sendJsonMessage } = useSelector((state: StateType) => state.socket);
  const [extraClassNames, setExtraClassNames] = useState<string>('');
  const [currentThreads, setCurrentThreads] = useState<Thread[]>([]);
  const [extraClassNamesForBottom, setExtraClassNamesForBottom] = useState<string>('');
  const { target, threadIndex } = useSelector((state: StateType) => state.keyNavigation)
  const { userDetails, profilePicture } = useSelector((state: StateType) => state.users)

  useEffect(() => {
    if (threads) {
      setCurrentThreads(threads);
    }
  }, [threads])

  useEffect(() => {
    // Make isThreadSearched as false when multiSelection is null or blank
    if (selectedThread) {
      let currentSelectedThreads = getCurrentSelectedThreads();
      currentSelectedThreads.push(currentThreads.findIndex((thread: Thread) => thread.id === selectedThread.id))
      setCurrentSelectedThreads(currentSelectedThreads);
    }
  }, [selectedThread, currentThreads])

  useEffect(() => {
    if(target === 'threads') {
      const node = currentThreadRef ? currentThreadRef.current : null
      if(node) {
        const topPos = (node.offsetTop - 50) || ((threadIndex || 0)) * 50

        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.scrollTo({
              top: topPos,
              behavior: 'smooth'
            })
          }
        }, 1)
      }
    }
  }, [target, threadIndex, currentThreadRef])

  const updateOnlineStatus = useCallback((oldThread: Thread, newThread: Thread) => {
    let oldThreadOnlineUser: UserProjectOnlineStatus | null = null;
    let onlineMembers: any = {...getMemberStatusCache()};
    onlineMembers['threads'] = {...onlineMembers['threads']};
    let oldThreadId: string = oldThread.id!;
    let newThreadId: string = newThread.id!;
    if (!onlineMembers['threads'][oldThreadId]) {
      onlineMembers['threads'][oldThreadId] = [];
    } else {
      onlineMembers['threads'][oldThreadId] = [...onlineMembers['threads'][oldThreadId]];
    }
    if (!onlineMembers['threads'][newThreadId]) {
      onlineMembers['threads'][newThreadId] = [];
    } else {
      onlineMembers['threads'][newThreadId] = [...onlineMembers['threads'][newThreadId]];
    }
    let findOldThreadUserIndex = onlineMembers['threads'][oldThreadId].findIndex((item: UserProjectOnlineStatus) => item.userId === oldThread.user);
    if (findOldThreadUserIndex !== -1) {
      onlineMembers['threads'][oldThreadId][findOldThreadUserIndex] = {...onlineMembers['threads'][oldThreadId][findOldThreadUserIndex]};
      oldThreadOnlineUser = onlineMembers['threads'][oldThreadId][findOldThreadUserIndex];
      onlineMembers['threads'][oldThreadId][findOldThreadUserIndex].isOnline = false;
      onlineMembers['threads'][oldThreadId][findOldThreadUserIndex].forceWait = 2;
    }

    let findNewThreadUserIndex = onlineMembers['threads'][newThreadId].findIndex((item: UserProjectOnlineStatus) => item.userId === newThread.user);
    if (findNewThreadUserIndex !== -1) {
      onlineMembers['threads'][newThreadId][findNewThreadUserIndex] = {...onlineMembers['threads'][newThreadId][findNewThreadUserIndex]};
      onlineMembers['threads'][newThreadId][findNewThreadUserIndex].isOnline = true;
      onlineMembers['threads'][newThreadId][findNewThreadUserIndex].lastOnlineStatusCheck = dayjs().format('DD/MM/YYYY hh:mm:ss a');
      onlineMembers['threads'][newThreadId][findNewThreadUserIndex].forceWait = 0;
    } else {
      if (!oldThreadOnlineUser && userDetails) {
        oldThreadOnlineUser = {
          userId: userDetails.id,
          avatar: (profilePicture?.url || ''),
          color: Math.floor(Math.random() * 16777215).toString(16),
          name: (userDetails.firstName || '') + ' ' + (userDetails.lastName || ' '),
        }
      }
      onlineMembers['threads'][newThreadId].push({
        ...oldThreadOnlineUser,
        isOnline: true,
        lastOnlineStatusCheck: dayjs().format('DD/MM/YYYY hh:mm:ss a'),
        forceWait: 0
      })
    }
    Object.keys(onlineMembers['threads']).forEach((key: string) => {
      onlineMembers['threads'][key] = [...onlineMembers['threads'][key].filter((data: UserProjectOnlineStatus) => data.userId)];
    });
    setMemberStatusCache(onlineMembers);
    dispatch(updateCommonState({onlineUsers: onlineMembers}));
  }, [dispatch, userDetails, profilePicture])

  const handleClick = useCallback((item: Thread, event: KeyboardEvent | any, index: number) => {
    // Check if Control key (or Command key on Mac) is held down
    if (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
          if (getCurrentSelectedThreads().includes(index)) {
            // Deselect if already selected
            setCurrentSelectedThreads(getCurrentSelectedThreads().filter((id: number) => id !== index));
          } else {
            // Select if not selected
            let currentSelectedThreads = getCurrentSelectedThreads();
            currentSelectedThreads.push(index);
            setCurrentSelectedThreads(currentSelectedThreads);
          }
        } else if (event.shiftKey) {
          event.preventDefault();

          // Check if Shift key is held down
          const firstSelectedIndex = currentThreads.findIndex((item: Thread) => item.id === selectedThread!.id);
          const clickedIndex = index;

          // Determine the range of divs to select based on Shift + Click
          const minIndex = Math.min(firstSelectedIndex, clickedIndex);
          const maxIndex = Math.max(firstSelectedIndex, clickedIndex);
          const rangeToSelect = Array.from({ length: maxIndex - minIndex + 1 }, (_, i) => minIndex + i);
          setCurrentSelectedThreads([]);
          setCurrentSelectedThreads([...rangeToSelect]);
        } else {
          // If no modifiers are held down, clear the selection and select the clicked div
          setCurrentSelectedThreads([]);
          setCurrentSelectedThreads([index]);
        }
        dispatch(updateThreadState({
          multiSelection: currentThreads.map((thread: Thread, index: number) => getCurrentSelectedThreads().includes(index) && thread.id!).filter(t => t) as any
        }))

      } else {
        dispatch(updateDraftState({ draft: null }));
        if(selectedThread && item) {
          updateOnlineStatus(selectedThread!, item!);
        }
        dispatch(updateCommonState({isComposing: false}));
        if (props.tab === 'DRAFT') {
          if (item && item.messages && item.messages[0]) {
            setTimeout(() => {
              dispatch(updateCommonState({isComposing: true}));
            }, 50)
            dispatch(updateThreadState({ selectedThread: item, isThreadFocused: false, multiSelection: [] }));
            return;
          }
        }
        setCurrentSelectedThreads([]);

        dispatch(updateThreadState({ selectedThread: item, isThreadFocused: false, multiSelection: [] }));
        dispatch(updateMessageState({ selectedMessage: (item.messages || [])[0], messages: [] }));
      }
    }
  }, [dispatch, currentThreads, selectedThread, updateOnlineStatus, props.tab]);


  const handleEditorScroll = useCallback(() => {
    if (editorRef.current && editorRef.current.scrollTop > 0) {
      setExtraClassNames(prevState => !prevState.includes('project-list-top-shadow') ? prevState + 'project-list-top-shadow' : prevState);
    } else {
      setExtraClassNames(prevState => prevState.replace('project-list-top-shadow', ''));
    }
    const container = editorRef.current;
    if (container) {
      const scrollHeight = container?.scrollHeight;
      const containerHeight = container?.clientHeight;
      const scrollBottom = scrollHeight - containerHeight - editorRef.current.scrollTop;
      if (scrollBottom > 0) {
        setExtraClassNamesForBottom(prevState => !prevState.includes('project-list-bottom-shadow') ? prevState + 'project-list-bottom-shadow' : prevState);
      } else {
        setExtraClassNamesForBottom(prevState => prevState.replace('project-list-bottom-shadow', ''));
      }
    }
  }, [])

  useEffect(() => {
    if (currentThreads) {
      handleEditorScroll();
    }
  }, [currentThreads, handleEditorScroll]);


  useEffect(() => {
    if (selectedThread && selectedAccount && sendJsonMessage) {
      const interval = debounceInterval(() => {
        console.log('Sending activity event THREAD');
        sendJsonMessage({
            userId: selectedAccount?.userId,
            name: 'Activity',
            data: {
                type: "ViewingThread",
                id: selectedThread.id,
            },
        });
      }, 2000);

      return () => clearInterval(interval);
    }
    return undefined
  }, [selectedThread, selectedAccount, sendJsonMessage]);

  return (
    <>
      <div className={'project-list-shadow'}>
        <Flex direction={'column'} gap={2} marginTop={5} pb={3}  ref={editorRef} onScroll={() => handleEditorScroll()}
              className={`${styles.mailList} ${extraClassNames} ${extraClassNamesForBottom} ${routePaths.includes('projects') ? styles.projectMailList : ''}`}>
          <Input type={'text'} opacity={0} height={0} width={0} padding={0} border={0} outline={0}
            ref={listRef} />

            {currentThreads.length > 0 && currentThreads.map((item: Thread, index: number) => (
              <div
                key={index}
                className={`${(selectedThread && selectedThread.id === item.id) ? styles.selectedThread : ''}`}
              >
                <ThreadsSideBarListItem
                  thread={item}
                  tab={props.tab}
                  onClick={(e) => handleClick(item, e, index)}
                  onSelect={(ref) => setCurrentThreadRef(ref)}
                />
              </div>
            ))}
        </Flex>
      </div>
    </>
  )
}
