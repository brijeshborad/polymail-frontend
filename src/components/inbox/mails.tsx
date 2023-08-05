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
    TabPanel,
    TabPanels,
    Tabs,
    Tooltip
} from "@chakra-ui/react";
import {StarIcon, DraftIcon, FolderIcon, SendIcon, TrashIcon, ArchiveIcon} from "@/icons";
import {ChevronDownIcon, RepeatIcon, TriangleDownIcon} from "@chakra-ui/icons";
import InboxTab from "@/components/inbox/tabs-components/inbox-tab";
import {MailsTabProps, StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getAllThreads} from "@/redux/threads/action-reducer";
import {getSyncAccount} from "@/redux/accounts/action-reducer";

export function Mails(props: MailsTabProps) {
    const [tab, setTab] = useState<string>('INBOX');

    const {threads} = useSelector((state: StateType) => state.threads);
    const {account, selectedAccount} = useSelector((state: StateType) => state.accounts);
    const dispatch = useDispatch();
    const [showLoader, setShowLoader] = useState<boolean>(false);

    const getAllThread = useCallback(() => {
        if (selectedAccount) {
            dispatch(getAllThreads({mailbox: tab, account: selectedAccount.id}));
        }
    }, [dispatch, tab, selectedAccount]);

    useEffect(() => {
        getAllThread();
    }, [getAllThread, selectedAccount])

    useEffect(() => {
        setShowLoader(true);
        if (threads) {
            setShowLoader(false);
        }
    }, [threads])

    const handleClick = (e: string, isShow: boolean = true) => {
        props.show(isShow);
        props.handleContent(e);
    }

    const changeEmailTabs = (value) => {
        setTab(value);
    }

    const callSyncAPI = () => {
        if (selectedAccount && selectedAccount.id) {
            dispatch(getSyncAccount({id: selectedAccount.id}));
        }
    }
    const [showCompose, setShowCompose] = useState<boolean>(false);

    const openComposeBox = () => {
        setShowCompose(true);
    }
    useEffect(() => {
        if (showCompose) {
            props.showCompose(showCompose);
        }
    }, [showCompose])

    useEffect(() => {
        // setShowLoader(true);
        if (account) {
            getAllThread();
            setShowLoader(false);
        }
    }, [account])

    return (
        <>
            <Flex align={'center'} justify={'space-between'} className={styles.syncButton}>
                <Button className={styles.replyButton} onClick={() => openComposeBox()}>Compose</Button>

                <Tooltip label='Sync Data' placement='bottom' bg='gray.300' color='black'>
                    <RepeatIcon onClick={() => callSyncAPI()}/>
                </Tooltip>
            </Flex>
            <Flex direction={'column'} gap={5}>
                <Tabs>
                    <TabList justifyContent={'space-between'} alignItems={'center'} className={styles.mailTabList} overflowX={"auto"}>
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
                                    <StarIcon />
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
                                    <ArchiveIcon />
                                    <span>Archive <Badge>{threads.length}</Badge></span>
                                </div>
                            </Tooltip>
                        </Tab>
                    </TabList>

                    <TabPanels marginTop={5}>
                        {/*<TabPanel>*/}
                            <InboxTab content={threads} tab={tab} showLoader={showLoader} handleClick={(e) => handleClick(e)}/>
                        {/*</TabPanel>*/}
                        {/*<TabPanel>*/}
                        {/*    <InboxTab content={threads} tab={tab} showLoader={showLoader} handleClick={(e) => handleClick(e)}/>*/}
                        {/*</TabPanel>*/}
                        {/*<TabPanel>*/}
                        {/*    <InboxTab content={threads} tab={tab} showLoader={showLoader} handleClick={(e) => handleClick(e)}/>*/}
                        {/*</TabPanel>*/}
                        {/*<TabPanel>*/}
                        {/*    <InboxTab content={threads} tab={tab} showLoader={showLoader} handleClick={(e) => handleClick(e)}/>*/}
                        {/*</TabPanel>*/}
                        {/*<TabPanel>*/}
                        {/*    <InboxTab content={threads} tab={tab} showLoader={showLoader} handleClick={(e) => handleClick(e)}/>*/}
                        {/*</TabPanel>*/}
                        {/*<TabPanel>*/}
                        {/*    <InboxTab content={threads} tab={tab} showLoader={showLoader} handleClick={(e) => handleClick(e)}/>*/}
                        {/*</TabPanel>*/}
                        {/*<TabPanel>*/}
                        {/*    <InboxTab content={threads} tab={tab} showLoader={showLoader} handleClick={(e) => handleClick(e)}/>*/}
                        {/*</TabPanel>*/}
                    </TabPanels>
                </Tabs>
            </Flex>
        </>
    )
}
