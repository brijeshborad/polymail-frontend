import styles from "@/styles/Inbox.module.css";
import {
    Badge,
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Tab,
    TabList,
    TabPanels,
    Tabs,
    Tooltip
} from "@chakra-ui/react";
import {ArchiveIcon, DraftIcon, EditIcon, InboxIcon, SendIcon, StarIcon, TimeSnoozeIcon, TrashIcon} from "@/icons";
import {StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getAllThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {Message, Thread} from "@/models";
import {InboxTab} from "@/components/inbox";
import {updateDraftState} from "@/redux/draft/action-reducer";
import {updateLastMessage} from "@/redux/socket/action-reducer";
import {TriangleDownIcon} from "@chakra-ui/icons";
import {useSocket} from "@/hooks/use-socket.hook";

let cacheThreads: { [key: string]: Thread[] } = {};
let currentCacheTab = 'INBOX';

export function Threads() {
    const [tab, setTab] = useState<string>('INBOX');
    const [countUnreadMessages, setCountUnreadMessages] = useState<number>(0);

    const {
        threads,
        isLoading,
        selectedThread,
        updateSuccess,
        success: threadListSuccess,
        tabValue
    } = useSelector((state: StateType) => state.threads);
    const {success: draftSuccess, updatedDraft} = useSelector((state: StateType) => state.draft);
    const {selectedAccount, account} = useSelector((state: StateType) => state.accounts);
    const {newMessage} = useSelector((state: StateType) => state.socket);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {sendJsonMessage} = useSocket();
    const dispatch = useDispatch();

    const getAllThread = useCallback((resetState: boolean = true, force: boolean = false) => {
        if (selectedAccount) {
            console.log('---Step 1 Check for cache', resetState, force);
            if (!cacheThreads[`${tab}-${selectedAccount.id}`] && !force) {
                force = true;
            }
            console.log('---Step 2 Check for force', force);
            if (force) {
                console.log('---Step 3 API CALLED and returned');
                dispatch(getAllThreads({mailbox: tab, account: selectedAccount.id, enriched: true, resetState}));
                return;
            }
            if (currentCacheTab !== tab) {
                currentCacheTab = tab;
                dispatch(updateThreadState({threads: cacheThreads[`${tab}-${selectedAccount.id}`]}));
            }
        }
    }, [dispatch, selectedAccount, tab]);

    useEffect(() => {
        if (newMessage && newMessage.name === 'new_message') {
            console.log('---NEW MESSAGE---', newMessage);
            dispatch(updateLastMessage(null));
            getAllThread(false, true);
        }
    }, [getAllThread, newMessage, dispatch])

    useEffect(() => {
        if (updateSuccess) {
            dispatch(updateThreadState({updateSuccess: false}));
            getAllThread(false);
        }
    }, [updateSuccess, getAllThread, dispatch])

    useEffect(() => {
        if (threadListSuccess && selectedAccount) {
            currentCacheTab = tab;
            cacheThreads = {
                ...cacheThreads,
                [`${tab}-${selectedAccount?.id}`]: threads ? [...threads] : []
            }
            dispatch(updateThreadState({success: false}));
        }
    }, [selectedAccount, tab, threadListSuccess, threads, dispatch])

    useEffect(() => {
        if (draftSuccess) {
            let usedThread = selectedThread;
            if (updatedDraft) {
                if (tab === 'DRAFT' && !usedThread) {
                    usedThread = (threads || []).find(t => (t?.messages || []).find(d => d.id === updatedDraft.id));
                }
                if (usedThread && usedThread.id && threads && threads.length > 0) {
                    let currentThreads = [...(threads || [])];
                    let currentThreadIndex = currentThreads.findIndex((thread: Thread) => thread.id === usedThread?.id);
                    let currentMessages = [...(usedThread.messages || [])];
                    let draftIndex = currentMessages.findIndex((message: Message) => message.id === updatedDraft.id);
                    let messages = currentThreads[currentThreadIndex]?.messages || [];
                    const messagesCopy = [...messages];
                    messagesCopy[draftIndex] = updatedDraft as Message;
                    messages = messagesCopy;
                    currentThreads[currentThreadIndex] = {
                        ...currentThreads[currentThreadIndex],
                        messages: [...messages]
                    };
                    dispatch(updateDraftState({success: false, updatedDraft: null}));
                    dispatch(updateThreadState({threads: currentThreads, success: true}));
                }
            }
        }
    }, [updatedDraft, draftSuccess, selectedThread, threads, dispatch, tab])

    useEffect(() => {
        setCountUnreadMessages((threads || []).filter(item => (item.mailboxes || [])?.includes('UNREAD')).length);
    }, [threads])

    useEffect(() => {
        if (account && account.success) {
            getAllThread(true, true);
        }
    }, [account, dispatch, getAllThread])

    useEffect(() => {
        if (threads && threads.length > 0 && !selectedThread) {
            dispatch(updateMessageState({selectedMessage: null}));
        }
    }, [threads, dispatch, selectedThread])


    useEffect(() => {
        if (tabValue && tabValue === 'reset') {
            currentCacheTab = '';
            getAllThread();
        }
    }, [getAllThread, tabValue])

    useEffect(() => {
        if (tab !== '' && currentCacheTab !== '') {
            getAllThread();
            dispatch(updateThreadState({tabValue: tab}));
        }
    }, [dispatch, getAllThread, tab])

    const changeEmailTabs = (value: string) => {
        if (currentCacheTab !== value) {
            dispatch(updateThreadState({isThreadSearched: false}));
            sendJsonMessage({
                "userId": userDetails?.id,
                "name": "SearchCancel",
            });
        }
        setTab(value);
    }

    const openComposeBox = () => {
        dispatch(updateDraftState({draft: null}));
        dispatch(updateMessageState({isCompose: true, selectedMessage: null}));
    }

    return (
        <>
            <Flex direction={'column'} gap={5} className={styles.mailListTabs}>
                <Tabs>
                    <Flex align={'center'} gap={'3'}>
                        <TabList justifyContent={'space-between'} flex={1} alignItems={'center'}
                                 className={styles.mailTabList}
                                 overflowX={"auto"}>
                            <Tab className={styles.emailTabs}>
                                <Tooltip label='Inbox' placement='bottom' bg='gray.300' color='black'>
                                    <div className={`${tab === 'INBOX' ? styles.active : ''}`}
                                         onClick={() => changeEmailTabs('INBOX')}>
                                        <InboxIcon/>
                                        <span>Inbox {countUnreadMessages > 0 &&
                                        <Badge>{countUnreadMessages}</Badge>}</span>
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

                            {!['TRASH', 'STARRED', 'ARCHIVE', 'DRAFT'].includes(tab) &&
                            <Tab className={styles.emailTabs}>
                                <Tooltip label='Snoozed' placement='bottom' bg='gray.300' color='black'>
                                    <div className={`${tab === 'SNOOZED' ? styles.active : ''}`}
                                         onClick={() => changeEmailTabs('SNOOZED')}>
                                        <TimeSnoozeIcon/>
                                        <span>Snoozed</span>
                                    </div>
                                </Tooltip>
                            </Tab>
                            }

                            {tab === 'STARRED' &&
                            <Tab className={styles.emailTabs}>
                                <Tooltip label='Starred' placement='bottom' bg='gray.300' color='black'>
                                    <div className={`${tab === 'STARRED' ? styles.active : ''}`}
                                         onClick={() => changeEmailTabs('STARRED')}>
                                        <StarIcon/>
                                        <span>Starred</span>
                                    </div>
                                </Tooltip>
                            </Tab>
                            }

                            {tab === 'TRASH' &&

                            <Tab className={styles.emailTabs}>
                                <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>
                                    <div className={`${tab === 'TRASH' ? styles.active : ''}`}
                                         onClick={() => changeEmailTabs('TRASH')}>
                                        <TrashIcon/>
                                        <span>Trash</span>
                                    </div>
                                </Tooltip>
                            </Tab>
                            }
                            {tab === 'ARCHIVE' &&

                            <Tab className={styles.emailTabs}>
                                <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>
                                    <div className={`${tab === 'ARCHIVE' ? styles.active : ''}`}
                                         onClick={() => changeEmailTabs('ARCHIVE')}>
                                        <ArchiveIcon/>
                                        <span>Archive</span>
                                    </div>
                                </Tooltip>
                            </Tab>
                            }

                            {tab === 'DRAFT' &&

                            <Tab className={styles.emailTabs}>
                                <Tooltip label='Draft' placement='bottom' bg='gray.300' color='black'>
                                    <div className={`${tab === 'DRAFT' ? styles.active : ''}`}
                                         onClick={() => changeEmailTabs('DRAFT')}>
                                        <DraftIcon/>
                                        <span>Draft</span>
                                    </div>
                                </Tooltip>
                            </Tab>
                            }

                            <Menu>
                                <MenuButton className={styles.tabListMoreButton} minWidth={'80px'}
                                            borderLeft={'1px solid #D1D5DB'}
                                            borderRadius={0} backgroundColor={'transparent'} height={'auto'}
                                            fontSize={'13px'} color={'#6B7280'} as={Button} marginLeft={1}
                                            rightIcon={<TriangleDownIcon/>}>
                                    More
                                </MenuButton>
                                <MenuList className={`${styles.tabListDropDown} drop-down-list`}>
                                    {['TRASH', 'STARRED', 'ARCHIVE', 'DRAFT'].includes(tab) &&
                                    <MenuItem onClick={() => changeEmailTabs('SNOOZED')}><TimeSnoozeIcon/> Snoozed</MenuItem>
                                    }

                                    {tab !== 'TRASH' &&
                                    <MenuItem onClick={() => changeEmailTabs('TRASH')}><TrashIcon/> Trash</MenuItem>
                                    }
                                    {tab !== 'STARRED' &&
                                    <MenuItem onClick={() => changeEmailTabs('STARRED')}><StarIcon/> Starred</MenuItem>
                                    }
                                    {tab !== 'ARCHIVE' &&
                                    <MenuItem
                                        onClick={() => changeEmailTabs('ARCHIVE')}><ArchiveIcon/> Archive</MenuItem>
                                    }
                                    {tab !== 'DRAFT' &&
                                    <MenuItem
                                        onClick={() => changeEmailTabs('DRAFT')}><DraftIcon/> Draft</MenuItem>
                                    }
                                </MenuList>
                            </Menu>
                        </TabList>

                        <Button className={styles.composeButton} borderRadius={8} height={'auto'} padding={'10px'}
                                minWidth={'101px'} backgroundColor={'#FFFFFF'} color={'#374151'} borderColor={'#E5E7EB'}
                                leftIcon={<EditIcon/>} colorScheme='blue'
                                variant='outline' onClick={() => openComposeBox()}>Compose</Button>
                    </Flex>

                    <TabPanels marginTop={5}>
                        <InboxTab tab={tab} showLoader={isLoading}/>
                    </TabPanels>
                </Tabs>
            </Flex>
        </>
    )
}
