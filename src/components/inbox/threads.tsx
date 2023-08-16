import styles from "@/styles/Inbox.module.css";
import {
    Badge,
    Flex,
    Tab,
    TabList,
    TabPanels,
    Tabs,
    Tooltip
} from "@chakra-ui/react";
import {StarIcon, DraftIcon, FolderIcon, SendIcon, TrashIcon, ArchiveIcon} from "@/icons";
import InboxTab from "@/components/inbox/tabs-components/inbox-tab";
import {StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getAllThreads, updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {Thread} from "@/models";

export function Threads() {
    const [tab, setTab] = useState<string>('INBOX');
    const [countUnreadMessages, setCountUnreadMessages] = useState<number>(0);

    const {threads, isLoading} = useSelector((state: StateType) => state.threads);
    const {selectedAccount, account} = useSelector((state: StateType) => state.accounts);
    const dispatch = useDispatch();

    useEffect(() => {
        setCountUnreadMessages(0);
        (threads || []).map((item: Thread) => {
            if ((item.mailboxes || [])?.includes('UNREAD')) {
                setCountUnreadMessages( prevState => prevState + 1)
            }
        })
    }, [threads])

    useEffect(() => {
        if (account && account.success && selectedAccount) {
            dispatch(getAllThreads({mailbox: tab, account: selectedAccount.id, enriched: true}));
        }
    }, [account, dispatch, selectedAccount, tab])

    const getAllThread = useCallback(() => {
        if (selectedAccount) {
            dispatch(getAllThreads({mailbox: tab, account: selectedAccount.id, enriched: true}));
        }
    }, [dispatch, selectedAccount, tab]);

    useEffect(() => {
        if (threads && threads.length > 0) {
            const thread = threads[0];
            if ((thread.mailboxes || []).includes('UNREAD')) {
                let newData = (thread.mailboxes || []).filter((item: string) => item !== 'UNREAD')
                const body = {
                    mailboxes: [
                        ...newData
                    ]
                }
                dispatch(updateThreads({id: thread.id, body}));
            }
            dispatch(updateThreadState({selectedThread: thread}));
            dispatch(updateMessageState({selectedMessage: null}));
        }
    }, [threads, dispatch])

    useEffect(() => {
        getAllThread();
    }, [getAllThread])

    const changeEmailTabs = (value: string) => {
        setTab(value);
    }



    return (
        <>
            <Flex direction={'column'} gap={5}>
                <Tabs>
                    <TabList justifyContent={'space-between'} alignItems={'center'} className={styles.mailTabList}
                             overflowX={"auto"}>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Inbox' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'INBOX' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('INBOX')}>
                                    <FolderIcon/>
                                    <span>Inbox <Badge>{countUnreadMessages || 0}</Badge></span>
                                </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Draft' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'DRAFT' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('DRAFT')}>
                                    <DraftIcon/>
                                    <span>Draft</span>
                                </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Starred' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'STARRED' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('STARRED')}>
                                    <StarIcon/>
                                    <span>Starred</span>
                                </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Sent' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'SENT' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('SENT')}>
                                    <SendIcon/>
                                    <span>Sent</span>
                                </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'TRASH' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('TRASH')}>
                                    <TrashIcon/>
                                    <span>Trash</span>
                                </div>
                            </Tooltip>
                        </Tab>

                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'ARCHIVE' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('ARCHIVE')}>
                                    <ArchiveIcon/>
                                    <span>Archive</span>
                                </div>
                            </Tooltip>
                        </Tab>
                    </TabList>

                    <TabPanels marginTop={5}>
                        <InboxTab content={threads} tab={tab} showLoader={isLoading}/>
                    </TabPanels>
                </Tabs>
            </Flex>
        </>
    )
}
