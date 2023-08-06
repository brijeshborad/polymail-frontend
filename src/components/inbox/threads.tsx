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
import { RepeatIcon} from "@chakra-ui/icons";
import InboxTab from "@/components/inbox/tabs-components/inbox-tab";
import {StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getAllThreads} from "@/redux/threads/action-reducer";
import {getSyncAccount} from "@/redux/accounts/action-reducer";
import {ComposeIcon} from "@/icons/compose.icon";
import {updateMessageState} from "@/redux/messages/action-reducer";

export function Threads() {
    const [tab, setTab] = useState<string>('INBOX');

    const {threads, isLoading} = useSelector((state: StateType) => state.threads);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const dispatch = useDispatch();

    const getAllThread = useCallback(() => {
        if (selectedAccount) {
            dispatch(getAllThreads({mailbox: tab, account: selectedAccount.id}));
        }
    }, [dispatch, selectedAccount, tab]);

    useEffect(() => {
        getAllThread();
    }, [getAllThread])

    const changeEmailTabs = (value) => {
        setTab(value);
    }

    const callSyncAPI = () => {
        if (selectedAccount && selectedAccount.id) {
            dispatch(getSyncAccount({id: selectedAccount.id}));
        }
    }

    const openComposeBox = () => {
        dispatch(updateMessageState({isCompose: true}))
    }

    return (
        <>
            <Flex align={'center'} justify={'space-between'}>
                <Tooltip label='Compose' placement='bottom' bg='gray.300' color='black'>
                    <div className={styles.composeButton} onClick={() => openComposeBox()}>
                        <ComposeIcon />
                    </div>
                </Tooltip>
                <div className={styles.syncButton}>
                    <Tooltip label='Sync Data' placement='bottom' bg='gray.300' color='black'>
                        <RepeatIcon onClick={() => callSyncAPI()}/>
                    </Tooltip>
                </div>
            </Flex>
            <Flex direction={'column'} gap={5}>
                <Tabs>
                    <TabList justifyContent={'space-between'} alignItems={'center'} className={styles.mailTabList}
                             overflowX={"auto"}>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Inbox' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'INBOX' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('INBOX')}>
                                    <FolderIcon/>
                                    <span>Inbox <Badge>{threads.length}</Badge></span>
                                </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Draft' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'DRAFT' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('DRAFT')}>
                                    <DraftIcon/>
                                    <span>Draft <Badge>{threads.length}</Badge></span>
                                </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Starred' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'STARRED' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('STARRED')}>
                                    <StarIcon/>
                                    <span>Starred <Badge>{threads.length}</Badge></span>
                                </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Sent' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'SENT' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('SENT')}>
                                    <SendIcon/>
                                    <span>Sent <Badge>{threads.length}</Badge></span>
                                </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'TRASH' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('TRASH')}>
                                    <TrashIcon/>
                                    <span>Trash <Badge>{threads.length}</Badge></span>
                                </div>
                            </Tooltip>
                        </Tab>

                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>
                                <div className={`${tab === 'ARCHIVE' ? styles.active : ''}`}
                                     onClick={() => changeEmailTabs('ARCHIVE')}>
                                    <ArchiveIcon/>
                                    <span>Archive <Badge>{threads.length}</Badge></span>
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
