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
import {getCacheThreads, getCurrentCacheTab, setCacheThreads, setCurrentCacheTab} from "@/utils/common.functions";
import {updateLastMessage} from "@/redux/socket/action-reducer";

let tab: string = '';

export function ThreadsSideBarTab(props: TabProps) {
    const {
        multiSelection,
        threads,
        isLoading,
        success: threadListSuccess,
        updateSuccess,
        tabValue,
        selectedThread
    } = useSelector((state: StateType) => state.threads)
    const {selectedAccount, account} = useSelector((state: StateType) => state.accounts);
    const {newMessage} = useSelector((state: StateType) => state.socket);
    const router = useRouter();
    const dispatch = useDispatch();
    const [tabName, setTabName] = useState<string>('just-mine');

    const getAllThread = useCallback((type: string = '') => {
        if (selectedAccount) {
            let resetState = true;
            if (!tab || tab === 'reset') {
                return;
            }
            if (getCurrentCacheTab() !== tab) {
                setCurrentCacheTab(tab);
                if (getCacheThreads()[`${props.cachePrefix}-${tab}-${selectedAccount.id}`]) {
                    resetState = false
                }
                dispatch(updateThreadState({
                    threads: getCacheThreads()[`${props.cachePrefix}-${tab}-${selectedAccount.id}`],
                    isLoading: false
                }));
            }

            if (router.query.project) {
                dispatch(getAllThreads({
                    mailbox: tab,
                    project: router.query.project as string,
                    resetState: resetState,
                    ...(type === 'just-mine' ? {mine: true} : {})
                }));
            } else {
                if (type === 'projects') {
                    dispatch(getAllThreads({project: "ALL", mailbox: tab}));
                } else {
                    dispatch(getAllThreads({mailbox: tab, account: selectedAccount.id, resetState: resetState}));
                }
            }
        }
    }, [dispatch, props.cachePrefix, router.query.project, selectedAccount]);

    useEffect(() => {
        if (threadListSuccess && selectedAccount) {
            setCurrentCacheTab(tab);
            setCacheThreads({
                ...getCacheThreads(),
                [`${props.cachePrefix}-${tab}-${selectedAccount?.id}`]: threads ? [...threads] : []
            });
            dispatch(updateThreadState({success: false}));
        }
    }, [selectedAccount, threadListSuccess, props.cachePrefix, dispatch, threads])

    useEffect(() => {
        if (newMessage && newMessage.name === 'new_message') {
            console.log('---NEW MESSAGE---', newMessage);
            dispatch(updateLastMessage(null));
            getAllThread();
        }
    }, [getAllThread, newMessage, dispatch])

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
        if (tabValue) {
            tab = tabValue;
            dispatch(updateThreadState({selectedThread: null}));
            getAllThread();
        }
    }, [dispatch, getAllThread, tabValue])

    const toggleSelectAllThreads = (checked: boolean) => {
        dispatch(updateThreadState({
            isThreadSearched: checked,
            multiSelection: !checked ? [] : threads?.map((thread) => thread.id!)
        }))
        return
    }

    useEffect(() => {
        if (threadListSuccess) {
            if (threads && threads.length) {
                dispatch(updateThreadState({threads: threads}));
            }
        }
    }, [dispatch, threadListSuccess, threads])

    useEffect(() => {
        if (threads && threads.length > 0 && !selectedThread && !isLoading) {
            dispatch(updateThreadState({selectedThread: threads[0]}));
        }
    }, [threads, dispatch, isLoading, selectedThread])

    useEffect(() => {
        dispatch(updateThreadState({selectedThread: null}));
    }, [dispatch, tabName])

    useEffect(() => {
        if (isLoading && threads && threads.length >= 1) {
            dispatch(updateThreadState({isLoading: false}));
        }
    }, [dispatch, isLoading, threads])

    const isSelectedAllChecked = ((multiSelection && multiSelection.length > 0) && multiSelection.length === (threads || []).length)

    useEffect(() => {
        if (tabValue) {
            if (router.query.project) {
                setTabName('every-thing')
            } else {
                setTabName('just-mine')
            }
        }
    }, [tabValue, router.query.project])

    const changeThread = (type: string) => {
        setTabName(type);
        getAllThread(type);
        dispatch(updateThreadState({threads: []}));
    }

    return (
        <>
            <div>
                <Flex overflowX={'auto'} align={'center'}>
                    <div className={styles.checkBoxLabel}>
                        <Checkbox
                            isChecked={isSelectedAllChecked}
                            onChange={(e) => toggleSelectAllThreads(e.target.checked)}
                        >
                            Select All
                        </Checkbox>
                    </div>

                    <div className={styles.mailOtherOption}>
                        <Flex align={'center'} gap={2}>
                            {router.query.project && (
                                <div className={tabName === 'every-thing' ? styles.active : ''}>
                                    <Button colorScheme='white'
                                            onClick={() => changeThread('every-thing')}>Everything</Button>
                                </div>
                            )}
                            <div className={tabName === 'just-mine' ? styles.active : ''}>
                                <Button colorScheme='white' onClick={() => changeThread('just-mine')}>Just mine</Button>
                            </div>
                            {!router.query.project &&
                            <div className={tabName === 'projects' ? styles.active : ''}>
                                <Button colorScheme='white' onClick={() => changeThread('projects')}>Projects</Button>
                            </div>
                            }
                        </Flex>
                    </div>
                </Flex>
            </div>


            {isLoading && (
                <Flex direction="column" gap={2} mt={5}>
                    <SkeletonLoader skeletonLength={15}/>
                </Flex>
            )}


            <ThreadsSideBarList tab={tab}/>
        </>
    )
}
