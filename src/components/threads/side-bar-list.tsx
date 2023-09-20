import { Message, Thread } from "@/models";
import styles from "@/styles/Inbox.module.css";
import { Flex, Input, useDisclosure } from "@chakra-ui/react";
import React, {useEffect, useCallback, useRef, useState} from "react";
import { updateMessageState } from "@/redux/messages/action-reducer";
import { updateThreadState } from "@/redux/threads/action-reducer";
import { updateDraftState } from "@/redux/draft/action-reducer";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "@/types";
import { ThreadListProps } from "@/types";
const ThreadsSideBarListItem = dynamic(() => import("./side-bar-list-item").then(mod => mod.ThreadsSideBarListItem));
import { useRouter } from "next/router";
const ComposeBox = dynamic(() => import("@/components/inbox").then(mod => mod.ComposeBox));
import dynamic from "next/dynamic";

let threadData: any = [];
let selectedDivs: any = []

export function ThreadsSideBarList(props: ThreadListProps) {
  const { selectedThread, threads, multiSelection, isThreadSearched} = useSelector((state: StateType) => state.threads);
  const dispatch = useDispatch()
  const listRef = useRef<any>(null);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [messageDetails, setMessageDetails] = useState<Message | null>(null);
  const routePaths = router.pathname.split('/');
  const editorRef = useRef<any>(null);
  const [extraClassNames, setExtraClassNames] = useState<string>('');
  const [extraClassNamesForBottom, setExtraClassNamesForBottom] = useState<string>('');

  const [threadsData, setThreadsData] = useState<Thread[]>([]);

  useEffect(() => {
    if (threads && threads.length) {
      setThreadsData((threads || []))
    }
  }, [threads])

  useEffect(() => {
    // Make isThreadSearched as false when multiSelection is null or blank
    if (multiSelection && !multiSelection.length) {
      dispatch(updateThreadState({isThreadSearched: false}));
    }
  }, [multiSelection, selectedThread])

  const handleClick = useCallback((item: Thread, event: KeyboardEvent | any, index: number) => {
    // Check if Control key (or Command key on Mac) is held down
    if (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        event.preventDefault();
        dispatch(updateThreadState({selectedThread: null}));

        if (event.ctrlKey || event.metaKey) {
          if (selectedDivs.includes(index)) {
            // Deselect if already selected
            selectedDivs.push(...selectedDivs.filter((id: number) => id !== index));
          } else {
            // Select if not selected
            selectedDivs.push(index);
          }
        } else if (event.shiftKey && selectedDivs.length > 0) {
          event.preventDefault();

          // Check if Shift key is held down
          const firstSelectedIndex = selectedDivs[0];
          const clickedIndex = index;

          // Determine the range of divs to select based on Shift + Click
          const minIndex = Math.min(firstSelectedIndex, clickedIndex);
          const maxIndex = Math.max(firstSelectedIndex, clickedIndex);
          const rangeToSelect = Array.from({ length: maxIndex - minIndex + 1 }, (_, i) => minIndex + i);
          selectedDivs = [];
          selectedDivs.push(...rangeToSelect);
        } else {
          // If no modifiers are held down, clear the selection and select the clicked div
          selectedDivs = []
          selectedDivs.push(index);
        }
        if (threadsData && threadsData.length) {
          if (event.ctrlKey || event.metaKey) {
            if (threadData.some((i: Thread) => i.id === threadsData[index].id)) {
              let indexData = threadData.findIndex((i: Thread) => i.id === threadsData[index].id)
              threadData.splice(indexData, 1)
            } else {
              threadData.push(threadsData[index])
            }
          } else if (event.shiftKey) {
            selectedDivs.forEach((item: any) => {
              if (threadData.some((i: Thread) => i.id === threadsData[item].id)) {
                let indexData = threadData.findIndex((i: Thread) => i.id === threadsData[item].id)
                threadData.splice(indexData)
              }
              threadData.push(threadsData[item])
            })
          }


          dispatch(updateThreadState({
            isThreadSearched: true,
            multiSelection: threadData?.map((thread: Thread) => thread.id!)
          }))
        }

      } else {
        if (props.tab === 'DRAFT') {
          if (item && item.messages && item.messages.length === 1) {
            setMessageDetails(item.messages[0])
            onOpen();
            return;
          }
        }
        dispatch(updateThreadState({ selectedThread: item, isThreadFocused: false }));
        dispatch(updateMessageState({ selectedMessage: null, messages: [] }));
        dispatch(updateDraftState({ draft: null }));
      }
    }
  }, [dispatch, onOpen, props.tab, threadsData]);


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

      <ComposeBox onOpen={onOpen} isOpen={isOpen} onClose={onClose} messageDetails={messageDetails} />
    </>
  )
}
