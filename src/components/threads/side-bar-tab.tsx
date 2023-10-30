import {Button, Checkbox, Flex} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {StateType, TabProps} from "@/types";
import React, {useState, useEffect, useCallback} from "react";
import {getAllThreads} from "@/redux/threads/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import {useRouter} from "next/router";
import dynamic from "next/dynamic";
import {
    getCacheThreads,
    getCurrentCacheTab,
    setCacheThreads,
    setCurrentCacheTab,
    setCurrentSelectedThreads, setCurrentViewingCacheTab
} from "@/utils/cache.functions";
import {getProjectSummary} from "@/redux/common-apis/action-reducer";
import {
    accountService,
    commonService,
    draftService,
    globalEventService, messageService,
    socketService,
    threadService
} from "@/services";
import {Message, Thread} from "@/models";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {performMessagesUpdate} from "@/utils/thread.functions";
import {clearDebounce, debounce} from "@/utils/common.functions";

dayjs.extend(customParseFormat)

const ThreadsSideBarList = dynamic(() => import("@/components/threads").then(mod => mod.ThreadsSideBarList), {ssr: false});

let currentPage: number = 1;

export function ThreadsSideBarTab(props: TabProps) {
    const {
        threads,
        isLoading,
        success: threadListSuccess,
        tabValue,
        multiSelection,
        isThreadSearched,
        selectedThread
    } = useSelector((state: StateType) => state.threads)
    const {selectedAccount, account, success} = useSelector((state: StateType) => state.accounts);
    const {
        isLoading: summaryIsLoading,
        syncingEmails,
        isComposing
    } = useSelector((state: StateType) => state.commonApis);
    const {newMessage} = useSelector((state: StateType) => state.socket);
    const {resumeAbleDraft} = useSelector((state: StateType) => state.draft);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const router = useRouter();
    const dispatch = useDispatch();
    const [tabName, setTabName] = useState<string>(() => {
        let defaultTab = 'just-mine';
        if (router.asPath === "/projects/[project]") {
            defaultTab = 'every-thing';
        } else if (router.query.project) {
            defaultTab = 'every-thing';
        }
        return defaultTab;
    });
    const [isSummaryApiCalled, setIsSummaryApiCalled] = useState<boolean>(false);
    const [currentTab, setCurrentTab] = useState<string>('');
    const isMultiItemsSelected = multiSelection && multiSelection.length > 0

    const getProjectId = useCallback(() => {
        const routePaths = window.location.pathname.split('/');
        let projectId: string = '';
        if (router.query.project) {
            projectId = router.query.project as string;
        } else if (router.asPath === "/projects/[project]") {
            projectId = routePaths[2] as string;
        }
        return projectId;
    }, [router.asPath, router.query.project])
    let projectId = getProjectId();


    const getAllThread = useCallback((type: string = tabName, useFrom: string = '') => {
        if (selectedAccount && !syncingEmails) {
            let resetState = true;
            if (!tabValue) {
                return;
            }
            if (getCurrentCacheTab() !== tabValue) {
                setCurrentCacheTab(tabValue);
            }
            let cutoffDate = dayjs().add(5, "day").format('YYYY-MM-DD');
            if (getCacheThreads()[`${props.cachePrefix}-${tabValue}-${selectedAccount.id}-${type}`]) {
                let threads = getCacheThreads()[`${props.cachePrefix}-${tabValue}-${selectedAccount.id}-${type}`];
                resetState = false
                threadService.setThreadState({
                    threads: threads,
                    isLoading: false
                })
            }
            let currentThreads = [...threadService.getThreadState().threads || []];
            if (currentPage > 1 && currentThreads[currentThreads.length - 1]) {
                cutoffDate = dayjs(currentThreads[currentThreads.length - 1].sortDate).format('YYYY-MM-DD');
            }
            let pagination: any = {
                to: cutoffDate,
                count: 100,
                page: currentPage
            }
            if (currentPage === 1) {
                delete pagination.to;
            }
            if (useFrom) {
                pagination = {
                    from: dayjs(useFrom).format('YYYY-MM-DD'),
                    page: currentPage
                }
            }
            if (projectId && !isSummaryApiCalled) {
                setIsSummaryApiCalled(true);
                dispatch(getProjectSummary({
                    body: {
                        id: projectId as string,
                        mailbox: tabValue,
                    }
                }))
            } else {
                if (projectId) {
                    dispatch(getAllThreads({
                        body: {
                            mailbox: tabValue,
                            project: projectId as string,
                            resetState: resetState,
                            ...(type === 'just-mine' ? {mine: true} : {}),
                            pagination
                        }
                    }));
                } else {
                    if (type === 'projects') {
                        dispatch(getAllThreads({body: {project: "ALL", mailbox: tabValue, resetState: resetState, pagination}}));
                    } else {
                        dispatch(getAllThreads({
                            body: {
                                mailbox: tabValue,
                                account: selectedAccount.id,
                                resetState: resetState,
                                pagination
                            }
                        }));
                    }
                }
            }
        }
    }, [dispatch, isSummaryApiCalled, projectId, props.cachePrefix, selectedAccount, syncingEmails, tabName, tabValue]);

    const updateThreads = useCallback((isNewThread: boolean, newThread: Thread, callBack: any | null = null) => {
        let thread: Thread = {...newThread};
        thread = {
            ...thread,
            id: thread._id,
        };
        let finalThreads = [...(threads || [])];
        let findThreadInList = finalThreads.findIndex((item: Thread) => item.id === thread.id);
        if (!isNewThread) {
            if (findThreadInList !== -1) {
                finalThreads.splice(findThreadInList, 1);
            }
            let messages: Message[] = [...(thread.messages || [])];
            messages = performMessagesUpdate(messages);
            thread.messages = messages;
            finalThreads.unshift(thread);
        } else {
            if (findThreadInList !== -1) {
                let messages: Message[] = [...(finalThreads[findThreadInList].messages || [])];
                let newMessages: Message[] = [...(thread.messages || [])];
                newMessages = performMessagesUpdate(newMessages);
                newMessages.forEach((item: Message) => {
                    let index = messages.findIndex((t: Message) => t.id === item.id);
                    if (index === -1) {
                        messages.push(item);
                    }
                })
                if (selectedThread && selectedThread.id === thread.id) {
                    messageService.setMessages(messages);
                }
            } else {
                let messages: Message[] = [...(thread.messages || [])];
                messages = performMessagesUpdate(messages);
                thread.messages = messages;
                finalThreads.unshift(thread);
            }
        }
        threadService.setThreads(finalThreads);
        threadService.setThreadState({success: true});
        if (callBack) {
            setTimeout(() => {
                callBack();
            }, 100)
        }
    }, [threads, selectedThread])

    useEffect(() => {
        if (threadListSuccess && selectedAccount) {
            setCurrentCacheTab(tabValue!);
            setCurrentViewingCacheTab(`${props.cachePrefix}-${tabValue!}-${selectedAccount?.id}-${tabName}`);
            setCacheThreads({
                ...getCacheThreads(),
                [`${props.cachePrefix}-${tabValue!}-${selectedAccount?.id}-${tabName}`]: threads ? [...threads] : []
            });
            threadService.setThreadState({success: false});
        }
    }, [selectedAccount, threadListSuccess, props.cachePrefix, dispatch, threads, tabName, tabValue])

    useEffect(() => {
        if (newMessage) {
            socketService.updateSocketMessage(null);

            if (newMessage.name === 'NewMessage') {
                console.log('---NEW MESSAGE---', newMessage);
                const _newMsg = newMessage.data.thread as Thread
                updateThreads(true, _newMsg, () => {
                    getAllThread('', newMessage.data.thread.sortDate);
                });
                var name = _newMsg?.from?.name || _newMsg?.from?.email
                globalEventService.fireEvent({
                    type: 'show-notification',
                    data: {
                        title: "New message from " + name,
                        data: {
                            body: `${_newMsg?.subject}`,
                            tag: `${_newMsg?.updated}`
                        }
                    }
                });
            }
            if (newMessage.name === 'SnoozedThread') {
                console.log(newMessage);
                updateThreads(false, newMessage.data.thread);
                globalEventService.fireEvent({
                    type: 'show-notification',
                    data: {
                        title: newMessage.data.thread.subject || "You got a new message",
                        data: {
                            body: `${newMessage.data.thread?.from?.name} ${newMessage.data.thread?.from?.email}`,
                            tag: `${newMessage.data.thread?.updated}`
                        }
                    }
                });
            }
            if (newMessage.name === 'Activity' && newMessage.data.Type === 'MemberJoined') {
                if (tabName === 'projects') {
                    getAllThread();
                }
            }
        }
    }, [getAllThread, newMessage, dispatch, threads, tabName, updateThreads])

    useEffect(() => {
        if (selectedAccount && success) {
            accountService.setAccountState({success: false});
            currentPage = 1;
            getAllThread();
        }
    }, [getAllThread, selectedAccount, success])

    useEffect(() => {
        if (incomingEvent === 'threads.refresh') {
            currentPage = 1;
            getAllThread();
        }
    }, [getAllThread, incomingEvent])

    useEffect(() => {
        if (account && account.success) {
            currentPage = 1;
            getAllThread();
        }
    }, [account, getAllThread])

    useEffect(() => {
        if (projectId) {
            currentPage = 1;
            getAllThread();
        }
    }, [projectId, getAllThread])

    useEffect(() => {
        if (tabValue && currentTab !== tabValue) {
            setCurrentTab(tabValue)
            threadService.setThreads([]);
            threadService.setSelectedThread(null);
            currentPage = 1;
            getAllThread();
        }
    }, [getAllThread, tabValue, currentTab])

    useEffect(() => {
        if (threadListSuccess) {
            if (threads && threads.length) {
                threadService.setThreads(threads)
            }
        }
    }, [threadListSuccess, threads])

    useEffect(() => {
        if (isLoading && threads && threads.length >= 1) {
            threadService.setThreadState({isLoading: false});
        }
    }, [isLoading, threads])

    const changeThread = (type: string) => {
        setTabName(type);
        threadService.setThreads([]);
        threadService.setSelectedThread(null);
        clearDebounce('THREAD_FILTER');
        debounce(() => {
            threadService.setThreads([]);
            threadService.setSelectedThread(null);
            currentPage = 1;
            getAllThread(type);
        }, 500, 'THREAD_FILTER');
    }

    function fetchNext() {
        currentPage = currentPage + 1
        getAllThread();
    }

    const toggleSelectAllThreads = (checked: boolean) => {
        threadService.setMultiSelectionThreads((!checked ? [] : threads?.map((thread) => thread.id!)) || []);
        setCurrentSelectedThreads(!checked ? [] : (threads || []).map((thread, index) => index));
        return
    }
    const isSelectedAllChecked = ((multiSelection && multiSelection.length > 0) && multiSelection.length === (threads || []).length)

    return (
        <>
            <Flex overflowX={'auto'} align={'center'} alignItems={'center'} alignContent={'center'} gap={2}
                  padding={"0 6px"}>
                <div className={styles.mailOtherOption}>
                    {(isMultiItemsSelected || isThreadSearched) ?
                        <Flex align={'center'} gap={2} className={styles.checkBoxLabel}>
                            <Checkbox
                                isChecked={isSelectedAllChecked}
                                onChange={(e) => toggleSelectAllThreads(e.target.checked)}
                            >
                                Select All
                            </Checkbox>
                        </Flex> :
                        <Flex align={'center'} gap={2}>
                            {router.query.project && (
                                <div className={tabName === 'every-thing' ? styles.active : ''}>
                                    <Button
                                        colorScheme='white'
                                        onClick={() => changeThread('every-thing')}
                                    >
                                        Everything
                                    </Button>
                                </div>
                            )}
                            <div className={tabName === 'just-mine' ? styles.active : ''}>
                                <Button
                                    colorScheme='white'
                                    onClick={() => changeThread('just-mine')}
                                >
                                    Just mine
                                </Button>
                            </div>
                            {!router.query.project &&
                            <div className={tabName === 'projects' ? styles.active : ''}>
                                <Button
                                    colorScheme='white'
                                    onClick={() => changeThread('projects')}
                                >
                                    Projects
                                </Button>
                            </div>
                            }
                        </Flex>
                    }
                    {
                        (resumeAbleDraft && !isComposing && tabValue !== 'DRAFT') &&
                        <Button className={styles.resumeDraft}
                                onClick={() => {
                                    commonService.toggleComposing(true);
                                    draftService.resumeDraft();
                                }}>
                            Resume Draft
                        </Button>
                    }
                </div>
            </Flex>


            {(isLoading || summaryIsLoading || syncingEmails) && (
                <Flex direction="column" gap={2} mt={5} padding={"0 6px"}>
                    <SkeletonLoader skeletonLength={15}/>
                </Flex>
            )}


            <ThreadsSideBarList tab={tabValue!} fetchNext={fetchNext}/>
        </>
    )
}
