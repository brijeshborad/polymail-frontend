import {MessageDraft, Thread} from "@/models";
import styles from "@/styles/Inbox.module.css";
import {Flex, Input} from "@chakra-ui/react";
import React, {useEffect, useCallback, useRef, useState} from "react";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {ThreadListProps} from "@/types";
import {useRouter} from "next/router";
import dynamic from "next/dynamic";
import {
    getCurrentSelectedThreads,
    setCurrentSelectedThreads,
} from "@/utils/cache.functions";
import {debounce, debounceInterval} from "@/utils/common.functions";
import {
    commonService,
    draftService,
    globalEventService,
    messageService,
    socketService,
    threadService
} from "@/services";
import InfiniteScroll from "react-infinite-scroll-component";
import {INFINITE_LIST_PER_COUNT} from "@/utils/constants";

const ThreadsSideBarListItem = dynamic(() => import("./side-bar-list-item").then(mod => mod.ThreadsSideBarListItem));

export function ThreadsSideBarList(props: ThreadListProps) {
    const {selectedThread, threads, multiSelection} = useSelector((state: StateType) => state.threads);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const listRef = useRef<any>(null);
    const router = useRouter();
    const routePaths = router.pathname.split('/');
    const editorRef = useRef<any>(null);
    const [extraClassNames, setExtraClassNames] = useState<string>('');
    const [currentThreads, setCurrentThreads] = useState<Thread[]>([]);
    const [extraClassNamesForBottom, setExtraClassNamesForBottom] = useState<string>('');
    const threadsRef = useRef<any>([]);
    const [showScrollBar, setShowScrollBar] = useState<boolean>(false);

    const scrollToPosition = useCallback((thread: Thread) => {
        const node = threadsRef.current[thread.id!]
        if (node) {
            const topPos = node.offsetTop - 110
            setTimeout(() => {
                if (editorRef.current) {
                    editorRef.current.scrollTo({
                        top: topPos,
                        behavior: 'smooth'
                    })
                }
            }, 1)
        } else {
            setTimeout(() => {
                scrollToPosition(thread);
            }, 100);
        }
    }, [])

    useEffect(() => {
        if (threads) {
            setCurrentThreads(threads);
        }
    }, [threads])

    useEffect(() => {
        // Make isThreadSearched as false when multiSelection is null or blank
        if (selectedThread) {
            scrollToPosition(selectedThread)
            let currentSelectedThreads = getCurrentSelectedThreads();
            currentSelectedThreads.push(currentThreads.findIndex((thread: Thread) => thread.id === selectedThread.id))
            setCurrentSelectedThreads(currentSelectedThreads);
        }
    }, [selectedThread, scrollToPosition])

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
                    const rangeToSelect = Array.from({length: maxIndex - minIndex + 1}, (_, i) => minIndex + i);
                    setCurrentSelectedThreads([]);
                    setCurrentSelectedThreads([...rangeToSelect]);
                } else {
                    // If no modifiers are held down, clear the selection and select the clicked div
                    setCurrentSelectedThreads([]);
                    setCurrentSelectedThreads([index]);
                }
                threadService.setMultiSelectionThreads(currentThreads.map((thread: Thread, index: number) => getCurrentSelectedThreads().includes(index) && thread.id!).filter(t => t) as string[]);

            } else {
                let isSameThreadClicked = false;
                if (selectedThread && item) {
                    isSameThreadClicked = selectedThread.id === item.id;
                }
                if (multiSelection && multiSelection.length > 0) {
                    isSameThreadClicked = false;
                }
                commonService.toggleComposing(false);
                if (props.tab === 'DRAFT') {
                    draftService.setResumeDraft(null);
                    if (item && item.messages && item.messages[0]) {
                        let draft = {...item.messages[0], projects: [...(item.projects || [])]};
                        setTimeout(() => {
                            commonService.toggleComposing(true);
                            draftService.setComposeDraft(draft as MessageDraft);
                        }, 10)
                        threadService.setThreadState({
                            selectedThread: item,
                            isThreadFocused: false,
                            multiSelection: []
                        });
                        messageService.setMessageState({
                            showMessageBox: false
                        });
                        return;
                    }
                }
                if (!isSameThreadClicked) {
                    draftService.setReplyDraft(null);
                    setCurrentSelectedThreads([]);
                    threadService.setThreadState({
                        selectedThread: item,
                        isThreadFocused: false,
                        multiSelection: []
                    });
                    messageService.setMessageState({
                        selectedMessage: (item.messages || [])[0],
                        messages: [],
                        showReplyBox: isSameThreadClicked
                    })
                    setTimeout(() => {
                        messageService.setMessageState({showReplyBox: true});
                    }, 1);
                    // globalEventService.fireEvent({data: '', type: 'richtexteditor.discard'});
                }
            }
        }
    }, [currentThreads, selectedThread, multiSelection, props.tab]);


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
            setShowScrollBar(true);
            debounce(() => setShowScrollBar(false), 500, 'THREAD_LIST_SCROLLBAR');
        }
    }, [])

    useEffect(() => {
        if (selectedThread && selectedAccount) {
            const interval = debounceInterval(() => {
                socketService.fireThreadViewActivity(selectedAccount?.userId, selectedThread.id);
            }, 2000);
            return () => clearInterval(interval);
        }
        return undefined
    }, [selectedThread, selectedAccount]);

    function fetchNext() {
        globalEventService.fireEvent('threads.next')
    }

    return (
        <>
            <div className={'project-list-shadow'}>
                <Flex direction={'column'} marginTop={3} pb={3} ref={editorRef} flex={1}
                      onScroll={() => handleEditorScroll()} id={'scrollableDiv'} backgroundColor={'#FFF'}
                      className={`${styles.mailList} ${extraClassNames} ${extraClassNamesForBottom} ${routePaths.includes('projects') ? styles.projectMailList : ''} ${showScrollBar ? styles.scrollBar : ''}`}>
                    <Input type={'text'} opacity={0} height={0} width={0} padding={0} border={0} outline={0}
                           ref={listRef}/>
                    <InfiniteScroll dataLength={currentThreads.length} className={'thread-list'}
                                    hasMore={currentThreads.length === 0 ? false : (currentThreads.length % INFINITE_LIST_PER_COUNT === 0)}
                                    scrollableTarget="scrollableDiv" next={() => fetchNext()} loader={null}>
                        {currentThreads.length > 0 && currentThreads.map((item: Thread, index: number) => (
                            <div key={index}
                                className={`${(selectedThread && selectedThread.id === item.id) ? styles.selectedThread : ''} ${styles.threadList}`}
                            >
                                <ThreadsSideBarListItem
                                    thread={item}
                                    tab={props.tab}
                                    onClick={(e) => handleClick(item, e, index)}
                                    threadsRef={threadsRef}
                                />
                            </div>
                        ))}
                    </InfiniteScroll>
                </Flex>
            </div>
        </>
    )
}
