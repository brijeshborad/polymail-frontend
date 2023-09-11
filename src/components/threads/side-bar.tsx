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
    Tooltip, useDisclosure
} from "@chakra-ui/react";
import {
    ArchiveIcon,
    DraftIcon,
    EditIcon,
    InboxIcon,
    SendIcon,
    StarIcon,
    TimeSnoozeIcon,
    TrashIcon
} from "@/icons";
import {StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getAllThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {Message, Thread} from "@/models";
import {ThreadsSideBarTab} from "@/components/threads";
import {updateDraftState} from "@/redux/draft/action-reducer";
import {updateLastMessage} from "@/redux/socket/action-reducer";
import {SmallCloseIcon, TriangleDownIcon} from "@chakra-ui/icons";
import {useSocket} from "@/hooks/use-socket.hook";
import {ComposeBox} from "@/components/inbox/compose-box";
import {useRouter} from "next/router";
import {AddToProjectButton} from "@/components/common";

let cacheThreads: { [key: string]: Thread[] } = {};
let currentCacheTab = 'INBOX';

export function ThreadsSideBar(props: { cachePrefix: string }) {
    const [tab, setTab] = useState<string>('INBOX');
    const [countUnreadMessages, setCountUnreadMessages] = useState<number>(0);
    const router = useRouter();

    const {
        threads,
        isLoading,
        selectedThread,
        updateSuccess,
        success: threadListSuccess,
        tabValue,
        isThreadSearched
    } = useSelector((state: StateType) => state.threads);
    const {success: draftSuccess, updatedDraft} = useSelector((state: StateType) => state.draft);
    const {selectedAccount, account} = useSelector((state: StateType) => state.accounts);
    const {newMessage} = useSelector((state: StateType) => state.socket);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {sendJsonMessage} = useSocket();
    const dispatch = useDispatch();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [initialized, setInitialized] = useState(false)

    const getAllThread = useCallback(() => {

        if (selectedAccount) {
            let resetState = !initialized ? true : false;
            if (currentCacheTab !== tab) {
                currentCacheTab = tab;
                if (cacheThreads[`${props.cachePrefix}-${tab}-${selectedAccount.id}`]) {
                    resetState = false
                }
                dispatch(updateThreadState({threads: cacheThreads[`${props.cachePrefix}-${tab}-${selectedAccount.id}`]}));
            }

            if (router.query.project) {
                dispatch(getAllThreads({
                    mailbox: tab,
                    project: router.query.project as string,
                    resetState: resetState
                }));
            } else {
                dispatch(getAllThreads({mailbox: tab, account: selectedAccount.id, resetState: resetState}));
            }
        }
    }, [dispatch, props.cachePrefix, router.query.project, selectedAccount, tab, initialized]);

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
        if (threadListSuccess && selectedAccount) {
            currentCacheTab = tab;
            cacheThreads = {
                ...cacheThreads,
                [`${props.cachePrefix}-${tab}-${selectedAccount?.id}`]: threads ? [...threads] : []
            }
            dispatch(updateThreadState({success: false}));
            setInitialized(true)
        }
    }, [selectedAccount, tab, threadListSuccess, threads, dispatch, props.cachePrefix])

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
                    if (draftIndex !== -1) {
                        messagesCopy[draftIndex] = updatedDraft as Message;
                    } else {
                        messagesCopy.push(updatedDraft as Message);
                    }
                    currentThreads[currentThreadIndex] = {
                        ...currentThreads[currentThreadIndex],
                        messages: [...messagesCopy]
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
            getAllThread();
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

    const searchCancel = () => {
        dispatch(updateThreadState({ isThreadSearched: false }));
        sendJsonMessage({
            "userId": userDetails?.id,
            "name": "SearchCancel",
        });
        if (selectedAccount && selectedAccount.id) {
            dispatch(getAllThreads({mailbox: tabValue, account: selectedAccount.id}));
        }

    }

    const changeEmailTabs = (value: string) => {
        if (currentCacheTab !== value) {
            searchCancel();
        }
        setTab(value);
    }

    return (
        <>
            <Flex direction={'column'} gap={5} className={styles.mailListTabs}>
                <Tabs>
                    {isThreadSearched ? <Flex overflow={'auto'} backgroundColor={'#FFFFFF'} border={'1px solid #F3F4F6'} borderRadius={16} padding={'10px 14px'} gap={2} align={'center'} justify={'space-between'}>
                        <Flex align={'center'} fontSize={'13px'} fontWeight={'400'} color={'#374151'} gap={2} letterSpacing={'-0.13px'} whiteSpace={'nowrap'}>
                            <span>Search Results {countUnreadMessages > 0 &&
                            <Badge backgroundColor={'#F3F4F6'} fontSize={'12px'} color={'#6B7280'} padding={'1px 4px'} borderRadius={4} fontWeight={500}>{countUnreadMessages}</Badge>}</span>
                        </Flex>
                        <Flex gap={2}>
                            <AddToProjectButton />
                            <Menu>
                                <MenuButton className={styles.tabListMoreButton} minWidth={'60px'} height={'auto'}
                                            backgroundColor={'transparent'} border={'1px solid #D1D5DB'} lineHeight={1}
                                            fontSize={'12px'} color={'#374151'} as={Button} borderRadius={'50px'}
                                            rightIcon={<TriangleDownIcon color={'#374151'}/>} p={'0 8px 0 10px'}> More </MenuButton>
                                <MenuList className={`${styles.tabListDropDown} drop-down-list`}>
                                    <MenuItem onClick={() => changeEmailTabs('INBOX')}><InboxIcon/> Inbox</MenuItem>
                                    <MenuItem onClick={() => changeEmailTabs('SENT')}><SendIcon/> Sent</MenuItem>
                                    <MenuItem onClick={() => changeEmailTabs('SNOOZED')}><TimeSnoozeIcon/> Snoozed</MenuItem>
                                    <MenuItem onClick={() => changeEmailTabs('TRASH')}><TrashIcon/> Trash</MenuItem>
                                    <MenuItem onClick={() => changeEmailTabs('STARRED')}><StarIcon/> Starred</MenuItem>
                                    <MenuItem onClick={() => changeEmailTabs('ARCHIVE')}><ArchiveIcon/> Archive</MenuItem>
                                    <MenuItem onClick={() => changeEmailTabs('DRAFT')}><DraftIcon/> Draft</MenuItem>
                                </MenuList>
                            </Menu>

                            <div className={styles.searchCloseIcon} onClick={() => searchCancel()}>
                                <SmallCloseIcon />
                            </div>
                        </Flex>
                    </Flex> : <Flex align={'center'} gap={'3'}>
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
                                    <MenuItem
                                        onClick={() => changeEmailTabs('SNOOZED')}><TimeSnoozeIcon/> Snoozed</MenuItem>
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
                                leftIcon={<EditIcon/>} colorScheme='blue' variant='outline'
                                onClick={onOpen}>Compose</Button>
                    </Flex>}


                    <TabPanels marginTop={5}>
                        <ThreadsSideBarTab tab={tab} showLoader={isLoading} />
                    </TabPanels>
                </Tabs>
            </Flex>

            <ComposeBox onOpen={onOpen} isOpen={isOpen} onClose={onClose}/>
        </>
    )
}
