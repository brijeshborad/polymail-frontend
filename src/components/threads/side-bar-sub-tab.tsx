import styles from "@/styles/Inbox.module.css";
import {Button, Checkbox, Flex} from "@chakra-ui/react";
import {
    cacheService,
    commonService,
    draftService,
    messageService,
    threadService
} from "@/services";
import React, {useCallback, useEffect, useState} from "react";
import {setCurrentSelectedThreads, setCurrentViewingCacheTab} from "@/utils/cache.functions";
import {Thread} from "@/models";
import {useRouter} from "next/router";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import dayjs from "dayjs";
import {INFINITE_LIST_PER_COUNT} from "@/utils/constants";
import {getAllThreads} from "@/redux/threads/action-reducer";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat)

let currentPage: number = 1;

export function SideBarSubTab() {
    const router = useRouter();
    const dispatch = useDispatch();
    const {
        threads,
        success: threadListSuccess,
        tabValue,
        multiSelection,
        isThreadSearched
    } = useSelector((state: StateType) => state.threads)
    const {resumeAbleDraft} = useSelector((state: StateType) => state.draft);
    const {isComposing, syncingEmails} = useSelector((state: StateType) => state.commonApis);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);

    const [projectId, setProjectId] = useState<string>('');
    const [waitForProjectRoute, setWaitForProjectRoute] = useState<boolean>(true);

    const [tabName, setTabName] = useState<string>(() => {
        let defaultTab = 'just-mine';
        if (router.asPath === "/projects/[project]") {
            defaultTab = 'everything';
        } else if (router.query.project) {
            defaultTab = 'everything';
        }
        return defaultTab;
    });
    const [currentTab, setCurrentTab] = useState<string>('');

    const getAllThread = useCallback((type: string = tabName, useFrom: string = '') => {
        if (selectedAccount && !syncingEmails) {
            let resetState = true;
            if (!tabValue) {
                return;
            }
            let cutoffDate = dayjs().add(5, "day").format('YYYY-MM-DD');
            let currentThreads = [...threadService.getThreadState().threads || []];
            if (currentThreads.length > 0) {
                resetState = false;
            }
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
            let buildBody: any = {};
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
            buildBody.type = type;
            dispatch(getAllThreads({
                body: buildBody,
                afterSuccessAction: (threads: any) => {
                    cacheService.setThreadCacheByKey(cacheService.buildCacheKey(buildBody.mailbox, buildBody.type), threads ? [...threads] : []);
                }
            }));
        }
    }, [dispatch, projectId, selectedAccount, syncingEmails, tabName, tabValue]);

    const isMultiItemsSelected = multiSelection && multiSelection.length > 0

    const changeThread = (type: string) => {
        if (tabName !== type) {
            setTabName(type);
            setCurrentViewingCacheTab(cacheService.buildCacheKey(tabValue!, type!));
            if (cacheService.getThreadCacheByKey(cacheService.buildCacheKey(tabValue!, type!)).length > 0) {
                let threads = cacheService.getThreadCacheByKey(cacheService.buildCacheKey(tabValue!, type!)) as Thread[];
                threadService.setThreadState({
                    threads: [...threads],
                    isLoading: false,
                    selectedThread: {...threads[0]}
                })
                currentPage = 1;
                getAllThread(type);
                return;
            } else {
                threadService.setThreads([]);
                threadService.setSelectedThread(null);
                messageService.setMessages([]);
                currentPage = 1;
                getAllThread(type);
            }
        }
    }

    const toggleSelectAllThreads = (checked: boolean) => {
        threadService.setMultiSelectionThreads((!checked ? [] : threads?.map((thread) => thread.id!)) || []);
        setCurrentSelectedThreads(!checked ? [] : (threads || []).map((thread, index) => index));
        return
    }
    const isSelectedAllChecked = ((multiSelection && multiSelection.length > 0) && multiSelection.length === (threads || []).length)

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
        if (threadListSuccess) {
            cacheService.setThreadCacheByKey(cacheService.buildCacheKey(tabValue!, tabName!), threads ? [...threads] : []);
            threadService.setThreadState({success: false});
        }
    }, [threadListSuccess, dispatch, threads, tabName, tabValue])

    useEffect(() => {
        if (projectId !== router.query.project) {
            setProjectId(router.query.project as string);
        }
    }, [projectId, router.query.project])

    useEffect(() => {
        if (projectId) {
            currentPage = 1;
            getAllThread();
        }
    }, [getAllThread, projectId])

    useEffect(() => {
        if (tabName !== '') {
            threadService.setSubTabValue(tabName);
        }
    }, [tabName])

    useEffect(() => {
        if (tabValue && currentTab !== tabValue) {
            setCurrentTab(tabValue)
            let defaultTab = 'just-mine';
            if (router.asPath === "/projects/[project]") {
                defaultTab = 'everything';
            } else if (router.query.project) {
                defaultTab = 'everything';
            }
            setTabName(defaultTab);
            setCurrentViewingCacheTab(cacheService.buildCacheKey(tabValue, defaultTab));
            if (cacheService.getThreadCacheByKey(cacheService.buildCacheKey(tabValue)).length > 0) {
                let threads = cacheService.getThreadCacheByKey(cacheService.buildCacheKey(tabValue)) as Thread[];
                threadService.setThreads([]);
                messageService.setMessages([]);
                threadService.setThreadState({
                    threads: threads,
                    isLoading: false,
                    selectedThread: threads[0]
                });
                currentPage = 1;
                getAllThread(defaultTab);
                return;
            } else {
                threadService.setThreads([]);
                threadService.setSelectedThread(null);
                messageService.setMessages([]);
                if (window.location.pathname.includes('projects') && waitForProjectRoute) {
                    setWaitForProjectRoute(false);
                    return;
                }
                currentPage = 1;
                getAllThread(defaultTab);
            }
        }
    }, [getAllThread, tabValue, currentTab, waitForProjectRoute, router.asPath, router.query.project])

    useEffect(() => {
        if (incomingEvent === 'threads.refresh') {
            currentPage = 1;
            getAllThread();
        }
        if (incomingEvent === 'threads.next') {
            currentPage = currentPage + 1
            getAllThread();
        }
        if (incomingEvent === 'threads.load-from-cache') {
            // console.log('FFF', cacheService.getThreadCache(), cacheService.buildCacheKey(tabValue!, tabName!));
            // if (cacheService.getThreadCacheByKey(cacheService.buildCacheKey(tabValue!, tabName!)).length > 0) {
            //     let threads = cacheService.getThreadCacheByKey(cacheService.buildCacheKey(tabValue!, tabName!)) as Thread[];
            //     threadService.setThreadState({
            //         threads: threads,
            //         isLoading: false,
            //         selectedThread: threads[0]
            //     })
            // }
        }
        if (incomingEvent === 'threads.refresh-with-cache') {
            if (cacheService.getThreadCacheByKey(cacheService.buildCacheKey(tabValue!, tabName!)).length > 0) {
                let threads = cacheService.getThreadCacheByKey(cacheService.buildCacheKey(tabValue!, tabName!)) as Thread[];
                threadService.setThreadState({
                    threads: threads,
                    isLoading: false,
                    selectedThread: threads[0]
                })
            }
            currentPage = 1;
            getAllThread();
        }
        if (typeof incomingEvent === 'object' && incomingEvent.type) {
            if (incomingEvent.type === 'threads.update') {
                if (incomingEvent.data.type === 'new') {
                    updateThreads(true, incomingEvent.data.thread, () => {
                        getAllThread(tabName, incomingEvent.data.thread.sortDate);
                    });
                }
                if (incomingEvent.data.type === 'snooze') {
                    updateThreads(false, incomingEvent.data.thread);
                }
            }
        }
    }, [getAllThread, incomingEvent, tabName, tabValue, updateThreads])

    return (
        <Flex overflowX={'auto'} align={'center'} alignItems={'center'} alignContent={'center'} gap={2}
              padding={"0 6px"} className={styles.mailOtherOptionParents}>
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
                            <div className={tabName === 'everything' ? styles.active : ''}>
                                <Button
                                    _focusVisible={{boxShadow: 'none'}}
                                    colorScheme='white'
                                    onClick={() => changeThread('everything')}
                                >
                                    Everything
                                </Button>
                            </div>
                        )}
                        <div className={tabName === 'just-mine' ? styles.active : ''}>
                            <Button
                                _focusVisible={{boxShadow: 'none'}}
                                colorScheme='white'
                                onClick={() => changeThread('just-mine')}
                            >
                                Just mine
                            </Button>
                        </div>
                        {!router.query.project &&
                        <div className={tabName === 'projects' ? styles.active : ''}>
                            <Button
                                _focusVisible={{boxShadow: 'none'}}
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
                                commonService.toggleResumeComposing(true);
                                draftService.resumeDraft();
                            }}>
                        Resume Draft
                    </Button>
                }
            </div>
        </Flex>
    )
}
