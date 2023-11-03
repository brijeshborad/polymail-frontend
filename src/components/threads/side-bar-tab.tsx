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
    setCacheThreads,
    setCurrentSelectedThreads, setCurrentViewingCacheTab
} from "@/utils/cache.functions";
import {
    commonService,
    draftService,
    globalEventService, messageService,
    socketService,
    threadService
} from "@/services";
import {Thread} from "@/models";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {clearDebounce, debounce} from "@/utils/common.functions";
import {INFINITE_LIST_PER_COUNT} from "@/utils/constants";

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
        isThreadSearched
    } = useSelector((state: StateType) => state.threads)
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
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
    const [currentTab, setCurrentTab] = useState<string>('');
    const isMultiItemsSelected = multiSelection && multiSelection.length > 0
    const [projectId, setProjectId] = useState<string>('');
    const [waitForProjectRoute, setWaitForProjectRoute] = useState<boolean>(true);

    const getAllThread = useCallback((type: string = tabName, useFrom: string = '') => {
        if (selectedAccount && !syncingEmails) {
            let resetState = true;
            if (!tabValue) {
                return;
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
                count: INFINITE_LIST_PER_COUNT,
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
            let buildBody = {};
            if (projectId) {
                buildBody = {
                    mailbox: tabValue,
                    project: projectId as string,
                    resetState: resetState, ...(type === 'just-mine' ? {mine: true} : {}),
                    pagination
                }
            } else {
                if (type === 'projects') {
                    buildBody = {project: "ALL", mailbox: tabValue, resetState: resetState, pagination}
                } else {
                    buildBody = {
                        mailbox: tabValue,
                        account: selectedAccount.id,
                        resetState: resetState,
                        pagination
                    }
                }
            }
            dispatch(getAllThreads({
                body: buildBody,
                afterSuccessAction: (threads: any) => {
                    setCurrentViewingCacheTab(`${props.cachePrefix}-${tabValue!}-${selectedAccount?.id}-${type}`);
                    setCacheThreads({
                        ...getCacheThreads(),
                        [`${props.cachePrefix}-${tabValue!}-${selectedAccount?.id}-${type}`]: threads ? [...threads] : []
                    });
                }
            }));
        }
    }, [dispatch, projectId, props.cachePrefix, selectedAccount, syncingEmails, tabName, tabValue]);

    const updateThreads = useCallback((isNewThread: boolean, newThread: Thread, callBack: any | null = null) => {
        let thread: Thread = {...newThread};
        thread = {
            ...thread,
            id: thread._id,
        };
        let allowCallBack = threadService.pushEventThreadToAppropriateList(thread, isNewThread, tabName);
        if (allowCallBack && callBack) {
            setTimeout(() => {
                callBack();
            }, 100)
        }
    }, [tabName])

    useEffect(() => {
        if (threadListSuccess && selectedAccount) {
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
                    getAllThread(tabName, newMessage.data.thread.sortDate);
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
            if (newMessage.name === 'ThreadUpdated') {
                console.log('---NEW EVENT', newMessage);
                let thread: Thread = {...newMessage.data.thread};
                thread = {...thread, id: thread._id};
                threadService.threadUpdated(thread);
            }
            if (newMessage.name === 'Activity' && newMessage.data.Type === 'MemberJoined') {
                if (tabName === 'projects') {
                    getAllThread();
                }
            }
        }
    }, [getAllThread, newMessage, dispatch, threads, tabName, updateThreads])

    useEffect(() => {
        if (projectId !== router.query.project) {
            setProjectId(router.query.project as string);
        }
    }, [projectId, router.query.project])

    useEffect(() => {
        if (incomingEvent === 'threads.refresh') {
            currentPage = 1;
            getAllThread();
        }
    }, [getAllThread, incomingEvent])

    useEffect(() => {
        if (projectId) {
            currentPage = 1;
            getAllThread();
        }
    }, [projectId])

    useEffect(() => {
        if (tabValue && currentTab !== tabValue) {
            setCurrentTab(tabValue)
            threadService.setThreads([]);
            threadService.setSelectedThread(null);
            if (window.location.pathname.includes('projects') && waitForProjectRoute) {
                setWaitForProjectRoute(false);
                return;
            }
            currentPage = 1;
            getAllThread();
        }
    }, [getAllThread, tabValue, currentTab, waitForProjectRoute])

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
        messageService.setMessages([]);
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
