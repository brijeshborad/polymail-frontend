import { Thread } from "@/models";
import styles from "@/styles/Inbox.module.css";
import { Flex, Input } from "@chakra-ui/react";
import React, {useEffect, useCallback, useRef, useState} from "react";
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

let currentSelectedThreads: any = []

export function ThreadsSideBarList(props: ThreadListProps) {
  const { selectedThread, threads, multiSelection, isThreadSearched} = useSelector((state: StateType) => state.threads);
  const dispatch = useDispatch()
  const listRef = useRef<any>(null);
  const router = useRouter();
  const routePaths = router.pathname.split('/');
  const editorRef = useRef<any>(null);
  const [extraClassNames, setExtraClassNames] = useState<string>('');
  const [extraClassNamesForBottom, setExtraClassNamesForBottom] = useState<string>('');
  const { target, threadIndex } = useSelector((state: StateType) => state.keyNavigation)
  useEffect(() => {
    // Make isThreadSearched as false when multiSelection is null or blank
    if (multiSelection && !multiSelection.length) {
      dispatch(updateThreadState({isThreadSearched: false}));
    }
  }, [dispatch, multiSelection, selectedThread])

  useEffect(() => {
    // Make isThreadSearched as false when multiSelection is null or blank
    if (selectedThread) {
      currentSelectedThreads.push((threads || []).findIndex((thread: Thread) => thread.id === selectedThread.id))
    }
  }, [selectedThread, threads])

  useEffect(() => {
    if(target === 'threads') {
      const topPos = ((threadIndex || 0)) * 50

      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.scrollTo({
            top: topPos,
            behavior: 'smooth'
          })
        }
      }, 50)
    }
  }, [target, threadIndex])

  const handleClick = useCallback((item: Thread, event: KeyboardEvent | any, index: number) => {
    // Check if Control key (or Command key on Mac) is held down
    if (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
          if (currentSelectedThreads.includes(index)) {
            // Deselect if already selected
            currentSelectedThreads.push(...currentSelectedThreads.filter((id: number) => id !== index));
          } else {
            // Select if not selected
            currentSelectedThreads.push(index);
          }
        } else if (event.shiftKey) {
          event.preventDefault();

          // Check if Shift key is held down
          const firstSelectedIndex = (threads || []).findIndex((item: Thread) => item.id === selectedThread!.id);
          const clickedIndex = index;

          // Determine the range of divs to select based on Shift + Click
          const minIndex = Math.min(firstSelectedIndex, clickedIndex);
          const maxIndex = Math.max(firstSelectedIndex, clickedIndex);
          const rangeToSelect = Array.from({ length: maxIndex - minIndex + 1 }, (_, i) => minIndex + i);
          currentSelectedThreads = [];
          currentSelectedThreads.push(...rangeToSelect);
        } else {
          // If no modifiers are held down, clear the selection and select the clicked div
          currentSelectedThreads = []
          currentSelectedThreads.push(index);
        }
        dispatch(updateThreadState({
          isThreadSearched: true,
          multiSelection: threads?.map((thread: Thread, index: number) => currentSelectedThreads.includes(index) && thread.id!).filter(t => t)
        }))

      } else {
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
        currentSelectedThreads = [];

        dispatch(updateThreadState({ selectedThread: item, isThreadFocused: false, multiSelection: [] }));
        dispatch(updateMessageState({ selectedMessage: (item.messages || [])[0], messages: [] }));
        dispatch(updateDraftState({ draft: null }));
      }
    }
  }, [dispatch, props.tab, selectedThread, threads]);


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
    if (threads) {
      handleEditorScroll();
    }
  }, [threads, handleEditorScroll]);

  /*
  useEffect(() => {
    if (selectedThread) {
      const interval = setInterval(() => {
        console.log('Sending activity event');
            sendJsonMessage({
                userId: selectedAccount?.userId,
                name: 'Activity',
                data: {
                    type: "ViewingThread",
                    id: selectedThread.id,
                },
            });
      }, 1000);

      return () => clearInterval(interval);
    }
    return undefined
  }, [selectedThread]);
  */
  return (
    <>
      <div className={'project-list-shadow'}>
        <Flex direction={'column'} gap={2} marginTop={5} pb={3}  ref={editorRef} onScroll={() => handleEditorScroll()}
              className={`${styles.mailList} ${extraClassNames} ${extraClassNamesForBottom} ${routePaths.includes('projects') ? styles.projectMailList : ''}`}>
          <Input type={'text'} opacity={0} height={0} width={0} padding={0} border={0} outline={0}
            ref={listRef} />

            {threads && threads.length > 0 && threads.map((item: Thread, index: number) => (
              <div onClick={(e) => handleClick(item, e, index)} key={index}
                   className={`${(selectedThread && selectedThread.id === item.id && !isThreadSearched) ? styles.selectedThread : ''}`}>
                <ThreadsSideBarListItem thread={item} tab={props.tab} />
              </div>
            ))}
        </Flex>
      </div>
    </>
  )
}
