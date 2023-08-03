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
import {ClockIcon, DraftIcon, FolderIcon, SendIcon, TimeSnoozeIcon, TrashIcon} from "@/icons";
import {TriangleDownIcon} from "@chakra-ui/icons";
import InboxTab from "@/components/inbox/tabs-components/inbox-tab";
import {MailsTabProps, StateType} from "@/types";
import {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getAllThreads} from "@/redux/threads/action-reducer";

export function Mails(props: MailsTabProps) {
    const [tab, setTab] = useState<string>('INBOX');

    const {threads} = useSelector((state: StateType) => state.threads);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const dispatch = useDispatch();

    const getAllThread = useCallback(() => {
        if (selectedAccount) {
            dispatch(getAllThreads({mailbox: tab, account: selectedAccount.id}));
        }
    }, [dispatch, tab, selectedAccount]);

    useEffect(() => {
        getAllThread();
    }, [getAllThread, selectedAccount])

    const handleClick = (e: string, isShow: boolean = true) => {
        props.show(isShow);
        props.handleContent(e);
    }

    useEffect(() => {
        if (tab  === 'INBOX' && threads && threads.length > 0) {
            handleClick(threads[0].id, false)
        }
    }, [threads])

    const changeEmailTabs = (value) => {
        setTab(value);
    }

    return (
        <>
            <Flex direction={'column'} gap={5}>
                <Tabs>
                    <TabList justifyContent={'space-between'} alignItems={'center'} className={styles.mailTabList}>
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
                                    <ClockIcon/>
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
                                    <TimeSnoozeIcon/>
                                    <span>Archive <Badge>{threads.length}</Badge></span>
                                </div>
                            </Tooltip>
                        </Tab>
                        <div className={styles.moreDropdown}>
                            <Menu>
                                <MenuButton as={Button} rightIcon={<TriangleDownIcon/>}
                                            className={styles.moreButton}>
                                    More
                                </MenuButton>
                                <MenuList>
                                    <MenuItem>Download</MenuItem>
                                    <MenuItem>Create a Copy</MenuItem>
                                    <MenuItem>Mark as Draft</MenuItem>
                                    <MenuItem>Delete</MenuItem>
                                    <MenuItem>Attend a Workshop</MenuItem>
                                </MenuList>
                            </Menu>
                        </div>
                    </TabList>

                    <TabPanels marginTop={5}>
                        <TabPanel>
                            <InboxTab content={threads} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={threads} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={threads} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={threads} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={threads} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={threads} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={threads} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Flex>
        </>
    )
}
