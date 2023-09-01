import styles from "@/styles/Inbox.module.css";
import {
    Badge, Button,
    Flex, Menu, MenuButton, MenuItem, MenuList,
    Tab,
    TabList,
    TabPanels,
    Tabs,
    Tooltip
} from "@chakra-ui/react";
import {TimeSnoozeIcon, EditIcon, SendIcon, InboxIcon, DraftIcon, StarIcon, TrashIcon} from "@/icons";
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
// import {useRouter} from "next/router";

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
        success: threadListSuccess
    } = useSelector((state: StateType) => state.threads);
    const {success: draftSuccess, draft} = useSelector((state: StateType) => state.draft);
    const {selectedAccount, account} = useSelector((state: StateType) => state.accounts);
    const {newMessage} = useSelector((state: StateType) => state.socket);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {sendJsonMessage} = useSocket();
    const dispatch = useDispatch();
    // const router = useRouter();


    const getAllThread = useCallback((resetState: boolean = true, force: boolean = false) => {
        if (selectedAccount) {
            if (!cacheThreads[`${tab}-${selectedAccount.id}`] && !force) {
                force = true;
            }
            if (force) {
                dispatch(getAllThreads({mailbox: tab, account: selectedAccount.id, enriched: true, resetState}));
                return;
            }
            if (currentCacheTab !== tab) {
                currentCacheTab = tab;
                dispatch(updateThreadState({threads: cacheThreads[`${tab}-${selectedAccount.id}`]}));
            }
        }
    }, [dispatch, selectedAccount, tab]);


    // PM-173
    // useEffect(() => {
    //     if(router.pathname.includes('inbox')) {
    //        getAllThread(true, true);
    //     }
    // }, [dispatch, getAllThread, router.pathname]);

    useEffect(() => {
        if (newMessage && newMessage.name === 'new_message') {
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
            if (draft && selectedThread && selectedThread.id && threads && threads.length > 0) {
                let currentThreads = [...(threads || [])];
                let currentThreadIndex = currentThreads.findIndex((thread: Thread) => thread.id === selectedThread.id);
                let currentMessages = [...(selectedThread.messages || [])];
                let draftIndex = currentMessages.findIndex((message: Message) => message.id === draft.id);
                let messages = [...currentThreads[currentThreadIndex].messages!];
                messages[draftIndex] = draft as Message;
                currentThreads[currentThreadIndex] = {
                    ...currentThreads[currentThreadIndex],
                    messages: [...messages]
                };
                dispatch(updateDraftState({success: false}));
                dispatch(updateThreadState({threads: currentThreads}));
            }
        }
    }, [draft, draftSuccess, selectedThread, threads, dispatch])

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
        if (tab !== '') {
            getAllThread();
        }
    }, [getAllThread, tab])

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
        dispatch(updateMessageState({isCompose: true}));
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
                                <Tooltip label='Draft' placement='bottom' bg='gray.300' color='black'>
                                    <div className={`${tab === 'DRAFT' ? styles.active : ''}`}
                                         onClick={() => changeEmailTabs('DRAFT')}>
                                        <DraftIcon/>
                                        <span>Draft</span>
                                    </div>
                                </Tooltip>
                            </Tab>

                            {!['TRASH', 'STARRED', 'ARCHIVE'].includes(tab) &&
                            <Tab className={styles.emailTabs}>
                                <Tooltip label='Sent' placement='bottom' bg='gray.300' color='black'>
                                    <div className={`${tab === 'SENT' ? styles.active : ''}`}
                                         onClick={() => changeEmailTabs('SENT')}>
                                        <SendIcon/>
                                        <span>Sent</span>
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
                                        <TimeSnoozeIcon/>
                                        <span>Archive</span>
                                    </div>
                                </Tooltip>
                            </Tab>
                            }

                            <Menu>
                                <MenuButton className={styles.tabListMoreButton} borderLeft={'1px solid #D1D5DB'}
                                            borderRadius={0} backgroundColor={'transparent'} height={'auto'}
                                            fontSize={'13px'} color={'#6B7280'} as={Button} marginLeft={1}
                                            rightIcon={<TriangleDownIcon/>}>
                                    More
                                </MenuButton>
                                <MenuList className={`${styles.tabListDropDown} drop-down-list`}>
                                    {['TRASH', 'STARRED', 'ARCHIVE'].includes(tab) &&
                                    <MenuItem onClick={() => changeEmailTabs('SENT')}><SendIcon/> sent</MenuItem>
                                    }

                                    {tab !== 'TRASH' &&
                                    <MenuItem onClick={() => changeEmailTabs('TRASH')}><TrashIcon/> Trash</MenuItem>
                                    }
                                    {tab !== 'STARRED' &&
                                    <MenuItem onClick={() => changeEmailTabs('STARRED')}><StarIcon/> Starred</MenuItem>
                                    }
                                    {tab !== 'ARCHIVE' &&
                                    <MenuItem
                                        onClick={() => changeEmailTabs('ARCHIVE')}><TimeSnoozeIcon/> Archive</MenuItem>
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
