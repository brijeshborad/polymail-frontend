import {MessageDraft, Thread} from "@/models";
import styles from "@/styles/Inbox.module.css";
import {Flex, Input} from "@chakra-ui/react";
import React, {useEffect, useCallback, useRef, useState, RefObject} from "react";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {ThreadListProps} from "@/types";
import {useRouter} from "next/router";
import dynamic from "next/dynamic";
import {
    getCurrentSelectedThreads,
    setCurrentSelectedThreads,
} from "@/utils/cache.functions";
import {debounceInterval} from "@/utils/common.functions";
import {
    commonService,
    draftService,
    globalEventService,
    messageService,
    socketService,
    threadService
} from "@/services";

const ThreadsSideBarListItem = dynamic(() => import("./side-bar-list-item").then(mod => mod.ThreadsSideBarListItem));

export function ThreadsSideBarList(props: ThreadListProps) {
    const {selectedThread, threads} = useSelector((state: StateType) => state.threads);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const [currentThreadRef, setCurrentThreadRef] = useState<RefObject<HTMLDivElement> | null>(null);
    const listRef = useRef<any>(null);
    const router = useRouter();
    const routePaths = router.pathname.split('/');
    const editorRef = useRef<any>(null);
    const [extraClassNames, setExtraClassNames] = useState<string>('');
    const [currentThreads, setCurrentThreads] = useState<Thread[]>([]);
    const [extraClassNamesForBottom, setExtraClassNamesForBottom] = useState<string>('');
    const {target, threadIndex} = useSelector((state: StateType) => state.keyNavigation)

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
        if (target === 'threads') {
            const node = currentThreadRef ? currentThreadRef.current : null
            if (node) {
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

    const handleClick = useCallback((item: Thread, event: KeyboardEvent | any, index: number) => {

      router.push(
        { pathname: routePaths.includes('projects') ? `/projects/${router.query.project}` : '/inbox', query: { thread: item.id }},  
        undefined, 
        { shallow: true }
      )

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
                    commonService.updateUserOnlineStatus(selectedThread!, item!);
                }
                commonService.toggleComposing(false);
                if (props.tab === 'DRAFT') {
                    draftService.setResumeDraft(null);
                    if (item && item.messages && item.messages[0]) {
                        let draft = item.messages[0];
                        setTimeout(() => {
                            commonService.toggleComposing(true);
                            draftService.setComposeDraft(draft as MessageDraft);
                        }, 50)
                        threadService.setThreadState({
                            selectedThread: item,
                            isThreadFocused: false,
                            multiSelection: []
                        });
                        return;
                    }
                }
                console.log('SELECTED THREAD', item);
                setCurrentSelectedThreads([]);
                threadService.setThreadState({
                    selectedThread: item,
                    isThreadFocused: false,
                    multiSelection: []
                });
                if (!isSameThreadClicked) {
                    draftService.setReplyDraft(null);
                    messageService.setMessageState({selectedMessage: (item.messages || [])[0], messages: [], showMessageBox: isSameThreadClicked})
                    setTimeout(() => {
                        messageService.setMessageState({showMessageBox: true});
                    }, 10);
                }
                globalEventService.fireEvent({data: '', type: 'richtexteditor.discard'});
                setTimeout(() => {
                    globalEventService.fireEvent({data: {type: 'reply'}, type: 'draft.updateType'});
                }, 100);
            }
        }
    }, [currentThreads, selectedThread, props.tab]);


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
        if (selectedThread && selectedAccount) {
            const interval = debounceInterval(() => {
                socketService.fireThreadViewActivity(selectedAccount?.userId, selectedThread.id);
            }, 2000);
            return () => clearInterval(interval);
        }
        return undefined
    }, [selectedThread, selectedAccount]);

    return (
        <>
            <div className={'project-list-shadow'}>
                <Flex direction={'column'} gap={2} marginTop={5} pb={3} ref={editorRef}
                      onScroll={() => handleEditorScroll()}
                      className={`${styles.mailList} ${extraClassNames} ${extraClassNamesForBottom} ${routePaths.includes('projects') ? styles.projectMailList : ''}`}>
                    <Input type={'text'} opacity={0} height={0} width={0} padding={0} border={0} outline={0}
                           ref={listRef}/>

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
