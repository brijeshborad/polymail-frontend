import {Button, Checkbox, Flex} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {StateType, TabProps} from "@/types";
import React, {useState, useEffect, useCallback} from "react";

const ThreadsSideBarList = dynamic(() => import("@/components/threads").then(mod => mod.ThreadsSideBarList), {ssr: false});
import {getAllThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import {useRouter} from "next/router";
import dynamic from "next/dynamic";
import {
    getCacheThreads,
    getCurrentCacheTab,
    setCacheThreads,
    setCurrentCacheTab,
    setCurrentSelectedThreads
} from "@/utils/cache.functions";
import {updateLastMessage} from "@/redux/socket/action-reducer";
import {getProjectSummary} from "@/redux/common-apis/action-reducer";
import {updateAccountState} from "@/redux/accounts/action-reducer";

export function ThreadsSideBarTab(props: TabProps) {
    const {
        threads,
        isLoading,
        success: threadListSuccess,
        updateSuccess,
        tabValue,
        multiSelection,
        isThreadSearched
    } = useSelector((state: StateType) => state.threads)
    const {selectedAccount, account, success} = useSelector((state: StateType) => state.accounts);
    const {isLoading: summaryIsLoading, syncingEmails} = useSelector((state: StateType) => state.commonApis);
    const {newMessage} = useSelector((state: StateType) => state.socket);
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

    const getAllThread = useCallback((type: string = tabName) => {
        if (selectedAccount && selectedAccount.syncHistory?.mailInitSynced) {
            let resetState = true;
            if (!tabValue) {
                return;
            }
            if (getCurrentCacheTab() !== tabValue) {
                setCurrentCacheTab(tabValue);
            }
            if (getCacheThreads()[`${props.cachePrefix}-${tabValue}-${selectedAccount.id}-${type}`]) {
                resetState = false
                dispatch(updateThreadState({
                    threads: getCacheThreads()[`${props.cachePrefix}-${tabValue}-${selectedAccount.id}-${type}`],
                    isLoading: false
                }));
            }
            let projectId = getProjectId();
            if (projectId && !isSummaryApiCalled) {
                setIsSummaryApiCalled(true);
                dispatch(getProjectSummary({body:{
                    id: projectId as string,
                    mailbox: tabValue,
                }}))
            } else {
                if (projectId) {
                    dispatch(getAllThreads({body:{
                        mailbox: tabValue,
                        project: projectId as string,
                        resetState: resetState,
                        ...(type === 'just-mine' ? {mine: true} : {})
                    }}));
                } else {
                    if (type === 'projects') {
                        dispatch(getAllThreads({body:{project: "ALL", mailbox: tabValue, resetState: resetState}}));
                    } else {
                        dispatch(getAllThreads({body:{mailbox: tabValue, account: selectedAccount.id, resetState: resetState}}));
                    }
                }
            }
        }
    }, [dispatch, getProjectId, isSummaryApiCalled, props.cachePrefix, selectedAccount, tabName, tabValue]);

    useEffect(() => {
        if (threadListSuccess && selectedAccount) {
            setCurrentCacheTab(tabValue!);
            setCacheThreads({
                ...getCacheThreads(),
                [`${props.cachePrefix}-${tabValue!}-${selectedAccount?.id}-${tabName}`]: threads ? [...threads] : []
            });
            dispatch(updateThreadState({success: false}));
        }
    }, [selectedAccount, threadListSuccess, props.cachePrefix, dispatch, threads, tabName, tabValue])

    useEffect(() => {
        if (newMessage && newMessage.name === 'new_message') {
            console.log('---NEW MESSAGE---', newMessage);
            dispatch(updateLastMessage(null));
            getAllThread();
        }
    }, [getAllThread, newMessage, dispatch])

    useEffect(() => {
        if (selectedAccount && success) {
            dispatch(updateAccountState({success: false}));
            getAllThread();
        }
    }, [getAllThread, selectedAccount, success, dispatch])

    useEffect(() => {
        if (updateSuccess) {
            dispatch(updateThreadState({updateSuccess: false}));
            getAllThread();
        }
    }, [updateSuccess, getAllThread, dispatch])

    useEffect(() => {
        if (account && account.success) {
            getAllThread();
        }
    }, [account, dispatch, getAllThread])

    useEffect(() => {
        if (tabValue && currentTab !== tabValue) {
            setCurrentTab(tabValue)
            dispatch(updateThreadState({selectedThread: null}));
            getAllThread();
        }
    }, [dispatch, getAllThread, tabValue, currentTab])

    useEffect(() => {
        if (threadListSuccess) {
            if (threads && threads.length) {
                dispatch(updateThreadState({threads: threads}));
            }
        }
    }, [dispatch, threadListSuccess, threads])

    useEffect(() => {
        if (isLoading && threads && threads.length >= 1) {
            dispatch(updateThreadState({isLoading: false}));
        }
    }, [dispatch, isLoading, threads])

    const changeThread = (type: string) => {
        setTabName(type);
        dispatch(updateThreadState({threads: []}));
        dispatch(updateThreadState({selectedThread: null}));
        getAllThread(type);
    }

    const toggleSelectAllThreads = (checked: boolean) => {
        dispatch(updateThreadState({
            multiSelection: !checked ? [] : threads?.map((thread) => thread.id!)
        }))
        setCurrentSelectedThreads(!checked ? [] : (threads || []).map((thread, index) => index));
        return
    }
    const isSelectedAllChecked = ((multiSelection && multiSelection.length > 0) && multiSelection.length === (threads || []).length)

    return (
        <>
          <Flex overflowX={'auto'} align={'center'} alignItems={'center'} alignContent={'center'} gap={2} padding={"0 6px"}>
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


            </div>
          </Flex>


            {(isLoading || summaryIsLoading || syncingEmails) && (
                <Flex direction="column" gap={2} mt={5} padding={"0 6px"}>
                    <SkeletonLoader skeletonLength={15}/>
                </Flex>
            )}


            <ThreadsSideBarList tab={tabValue!}/>
        </>
    )
}
