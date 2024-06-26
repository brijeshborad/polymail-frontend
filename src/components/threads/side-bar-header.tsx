import {Badge, Button, Flex, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Tab, TabList} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {SmallCloseIcon, TriangleDownIcon} from "@chakra-ui/icons";
import {
    MAILBOX_ARCHIVE, MAILBOX_DRAFT,
    MAILBOX_INBOX, MAILBOX_SENT, MAILBOX_SNOOZED,
    MAILBOX_SPAM,
    MAILBOX_STARRED,
    MAILBOX_TRASH,
    MAILBOX_UNREAD
} from "@/utils/constants";
import {
    ArchiveIcon, DraftIcon, EditIcon,
    InboxIcon,
    InboxOpenIcon,
    MuteIcon,
    SendIcon,
    SpamIcon,
    StarIcon,
    TimeSnoozeIcon,
    TrashIcon
} from "@/icons";
import {
    commonService,
    draftService, globalEventService,
    messageService,
    socketService,
    threadService
} from "@/services";
import Tooltip from "@/components/common/Tooltip";
import React, {useEffect, useState} from "react";
import {createDraft} from "@/redux/draft/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import dynamic from "next/dynamic";
import {useRouter} from "next/router";
import {Thread} from "@/models";

const MessageSchedule = dynamic(() => import("../messages/message-schedule").then(mod => mod.default));
const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));

export function SideBarHeader() {
    const dispatch = useDispatch();
    const router = useRouter();

    const [scheduledDate, setScheduledDate] = useState<string | undefined>();
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {
        threads,
        isLoading,
        selectedThread,
        tabValue,
        isThreadSearched,
        multiSelection
    } = useSelector((state: StateType) => state.threads);
    const {allowThreadSelection, isComposing} = useSelector((state: StateType) => state.commonApis);
    const {success: draftSuccess, updatedDraft} = useSelector((state: StateType) => state.draft);

    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false)
    const [countUnreadMessages, setCountUnreadMessages] = useState<number>(0);
    const [tab, setTab] = useState<string>('INBOX');
    const [toggleValues, setToggleValues] = useState<{ isAllRead: boolean, isAllMute: boolean, isAllStarred: boolean }>({
        isAllRead: false,
        isAllMute: false,
        isAllStarred: false
    })

    useEffect(() => {
        if (draftSuccess) {
            if (updatedDraft) {
                threadService.pushOrUpdateDraftInThreadMessages(updatedDraft);
            }
        }
    }, [draftSuccess, updatedDraft])

    useEffect(() => {
        if (isThreadSearched) {
            setCountUnreadMessages((threads || []).length);
        } else {
            setCountUnreadMessages((threads || []).filter(item => (item.mailboxes || [])?.includes('UNREAD')).length);
        }
    }, [threads, isThreadSearched])

    useEffect(() => {
        if (threads && threads.length > 0 && !selectedThread && !isLoading) {
            if (allowThreadSelection) {
                if (tabValue === 'DRAFT') {
                    let item = threads[0];
                    if (item.tab !== 'DRAFT') {
                        return;
                    }
                    commonService.toggleComposing(true);
                    threadService.setSelectedThread(item);
                    if (item && item.messages && item.messages[0]) {
                        let finalDraft = {...item.messages[0], projects: [...(item.projects || [])]}
                        draftService.setComposeDraft(finalDraft);
                    }
                } else {
                    if (!isComposing) {
                        if (!router.query.thread) {
                            threadService.setSelectedThread(threads[0]);
                        }
                    }
                }
            }
        }
    }, [allowThreadSelection, isComposing, isLoading, router.query.thread, selectedThread, tabValue, threads])

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsMoreDropdownOpen(false)
        }
    }, [incomingEvent])

    useEffect(() => {
        if (tab !== '') {
            threadService.setTabValue(tab);
        }
    }, [tab])

    useEffect(() => {
        if (multiSelection && multiSelection.length > 0) {
            let allSelectedThreads: Thread[] = (threads || []).filter((t: Thread) => multiSelection.includes(t.id!));
            let unreadStatus = allSelectedThreads.filter((t: Thread) => t.mailboxes?.includes(MAILBOX_UNREAD));
            let muteStatus = allSelectedThreads.filter((t: Thread) => t.mute);
            let starStatus = allSelectedThreads.filter((t: Thread) => t.mailboxes?.includes(MAILBOX_STARRED));
            setToggleValues({
                isAllRead: unreadStatus.length <= 0,
                isAllMute: muteStatus.length > 0 && allSelectedThreads.length === muteStatus.length,
                isAllStarred: starStatus.length > 0 && allSelectedThreads.length === starStatus.length
            });
        }
    }, [multiSelection, threads])

    const searchCancel = (callAPI: boolean = false) => {
        threadService.cancelThreadSearch(true);
        socketService.cancelThreadSearch(userDetails?.id);
        if (selectedAccount && selectedAccount.id && callAPI) {
            globalEventService.fireEvent('threads.refresh-with-cache');
        }
    }

    const changeEmailTabs = (value: string) => {
        if (tab !== value) {
            router.push(
                {pathname: router.pathname.includes('projects') ? `/projects/${router.query.project}` : '/inbox'},
                undefined,
                {shallow: true}
            )
            if (value !== 'DRAFT') {
                commonService.toggleComposingWithThreadSelection(false, true);
                draftService.saveDraftToResume();
                messageService.setMessageState({showMessageBox: true});
            }
            threadService.setTabValue(tab);
            searchCancel();
        }
        setTab(value);
    }

    const openComposeModel = () => {
        if (!isComposing) {
            draftService.setComposeDraft(null);
            draftService.setResumeDraft(null);
            commonService.toggleComposing(true);
            if (selectedAccount && selectedAccount.id) {
                dispatch(createDraft({
                        body: {
                            accountId: selectedAccount.id, body: {}, fromCompose: true
                        },
                        afterSuccessAction: () => {
                            draftService.addComposeToProject(router.pathname)
                        }
                    }
                ));
            }
        }
    }

    const moveThreadToMailBoxes = (type: string, date: string = '') => {
        if (type === MAILBOX_UNREAD) {
            threadService.toggleMultipleThreadsAsRead(toggleValues.isAllRead);
            return;
        }
        if (type === MAILBOX_STARRED) {
            threadService.toggleMultipleThreadsAsStarred(toggleValues.isAllStarred);
            return;
        }
        threadService.moveThreadToMailBox(type, date);
    }

    const handleSchedule = (date: string | undefined) => {
        setIsMoreDropdownOpen(!isMoreDropdownOpen)
        setScheduledDate(date);
        moveThreadToMailBoxes(MAILBOX_SNOOZED, date);
    }

    function getHeaderForSearched() {
        return (
            <Flex padding={"0 6px"}>
                <Flex
                    overflow={'auto'}
                    backgroundColor={'#FFFFFF'}
                    border={'1px solid #F3F4F6'}
                    borderRadius={16} padding={'10px 14px'}
                    gap={1} align={'center'} w={"100%"}
                    justify={'space-between'} className={styles.threadSearched}
                >
                    {(isThreadSearched || multiSelection && multiSelection.length > 0) &&
                    <Flex align={'center'} fontSize={'13px'} fontWeight={'400'}
                          color={'#374151'} gap={2} letterSpacing={'-0.13px'}
                          whiteSpace={'nowrap'}>
                        {isThreadSearched ? <span>Search Results {countUnreadMessages > 0 && (
                            <Badge
                                backgroundColor={'#F3F4F6'} fontSize={'12px'} color={'#6B7280'}
                                padding={'1px 4px'} borderRadius={4} fontWeight={500}
                            >
                                {countUnreadMessages}
                            </Badge>
                        )}
                            </span> : <span style={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>{multiSelection && multiSelection?.length > 0 && (
                            <Badge
                                backgroundColor={'#F3F4F6'} fontSize={'12px'} color={'#6B7280'} marginRight={'5px'}
                                padding={'1px 4px'} borderRadius={4} fontWeight={500}
                            >
                                {multiSelection?.length}
                            </Badge>
                        )} Selected
                            </span>}
                    </Flex>}
                    {/*<Flex className={styles.checkBoxLabel}>*/}
                    {/*    <Checkbox*/}
                    {/*        isChecked={isSelectedAllChecked}*/}
                    {/*        onChange={(e) => toggleSelectAllThreads(e.target.checked)}*/}
                    {/*    >*/}
                    {/*        Select All*/}
                    {/*    </Checkbox>*/}
                    {/*</Flex>*/}
                    <Flex gap={2}>
                        <AddToProjectButton allowDefaultSelect={false}/>
                        <Menu
                            isOpen={isMoreDropdownOpen}
                            onClose={() => setIsMoreDropdownOpen(false)}
                        >
                            <MenuButton
                                onClick={() => {
                                    setIsMoreDropdownOpen(!isMoreDropdownOpen)
                                }}
                                className={styles.tabListMoreButton} minWidth={'60px'} height={'auto'}
                                backgroundColor={'transparent'} border={'1px solid #F3F4F6'}
                                lineHeight={1} _hover={{backgroundColor: 'var(--alias-bg-subtle)'}}
                                fontSize={'12px'} color={'#374151'} as={Button} borderRadius={'50px'}
                                rightIcon={<TriangleDownIcon color={'#374151'}/>}
                                p={'0 8px 0 3px'}
                            >
                                <span className={styles.threadSearchedActionButtonText}>Actions</span>
                            </MenuButton>
                            <MenuList
                                className={`${styles.tabListDropDown} ${styles.multiselectTreadTabList} drop-down-list`}>
                                <MenuItem
                                    onClick={() => moveThreadToMailBoxes(MAILBOX_UNREAD)}><InboxOpenIcon/> Mark {toggleValues.isAllRead ? 'Unread' : 'Read'}
                                </MenuItem>
                                <MenuItem
                                    onClick={() => threadService.markMultipleThreadsAsMute()}><MuteIcon/>{toggleValues.isAllMute ? 'Unmute' : 'Mute'}
                                </MenuItem>
                                <MenuItem
                                    onClick={() => moveThreadToMailBoxes(MAILBOX_SPAM)}><SpamIcon/> Mark Spam</MenuItem>
                                <MenuDivider/>
                                <div className={styles.tabListSnoozeButton}>
                                    <MessageSchedule
                                        isSnooze={true}
                                        date={scheduledDate}
                                        onChange={handleSchedule}
                                        isNameShow={true}
                                    />
                                </div>
                                <MenuItem className={styles.dropDownIconBold}
                                          onClick={() => moveThreadToMailBoxes(MAILBOX_STARRED)}><StarIcon/> {toggleValues.isAllStarred ? 'Removed ' : 'Add '}
                                    Star</MenuItem>
                                <MenuItem className={styles.dropDownIconBold}
                                          onClick={() => moveThreadToMailBoxes(MAILBOX_INBOX)}><InboxIcon/> Move to
                                    Inbox</MenuItem>
                                <MenuItem className={styles.dropDownIconBold}
                                          onClick={() => moveThreadToMailBoxes(MAILBOX_TRASH)}><TrashIcon/> Move to
                                    Trash</MenuItem>
                                <MenuItem className={styles.dropDownIconBold}
                                          onClick={() => moveThreadToMailBoxes(MAILBOX_ARCHIVE)}><ArchiveIcon/> Move to
                                    Archive</MenuItem>
                            </MenuList>
                        </Menu>

                        <div className={styles.searchCloseIcon} onClick={() => searchCancel(true)}>
                            <SmallCloseIcon/>
                        </div>
                    </Flex>
                </Flex>
            </Flex>
        )
    }

    function getHeaderForNotSearched() {
        return (
            <Flex align={'center'} gap={'3'} padding={"0 6px"} className={styles.TabsListTabPanel}>
                <TabList
                    justifyContent={'space-between'} flex={1} alignItems={'center'}
                    className={styles.mailTabList} overflowX={"auto"}
                >
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Inbox' placement='bottom'>
                            <div
                                className={`${tab === MAILBOX_INBOX ? styles.active : ''}`}
                                onClick={() => changeEmailTabs(MAILBOX_INBOX)}
                            >
                                <InboxIcon/>
                                <span className={styles.mailboxText}>Inbox</span>
                                {countUnreadMessages > 0 &&
                                <Badge backgroundColor={'#F3F4F6'}>{countUnreadMessages}</Badge>}
                            </div>
                        </Tooltip>
                    </Tab>
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Sent' placement='bottom'>
                            <div
                                className={`${tab === MAILBOX_SENT ? styles.active : ''}`}
                                onClick={() => changeEmailTabs(MAILBOX_SENT)}
                            >
                                <SendIcon/>
                                <span className={styles.mailboxText}>Sent</span>
                            </div>
                        </Tooltip>
                    </Tab>

                    {![MAILBOX_TRASH, MAILBOX_STARRED, MAILBOX_ARCHIVE, MAILBOX_DRAFT, MAILBOX_SPAM].includes(tab) &&
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Snoozed' placement='bottom'>
                            <div
                                className={`${tab === MAILBOX_SNOOZED ? styles.active : ''}`}
                                onClick={() => changeEmailTabs(MAILBOX_SNOOZED)}
                            >
                                <TimeSnoozeIcon/>
                                <span className={styles.mailboxText}>Snoozed</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    }

                    {tab === MAILBOX_STARRED &&
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Starred' placement='bottom'>
                            <div
                                className={`${tab === MAILBOX_STARRED ? styles.active : ''}`}
                                onClick={() => changeEmailTabs(MAILBOX_STARRED)}
                            >
                                <StarIcon/>
                                <span className={styles.mailboxText}>Starred</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    }

                    {tab === MAILBOX_TRASH &&
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Trash' placement='bottom'>
                            <div
                                className={`${tab === MAILBOX_TRASH ? styles.active : ''}`}
                                onClick={() => changeEmailTabs(MAILBOX_TRASH)}
                            >
                                <TrashIcon/>
                                <span className={styles.mailboxText}>Trash</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    }
                    {tab === MAILBOX_ARCHIVE &&
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Archive' placement='bottom'>
                            <div
                                className={`${tab === MAILBOX_ARCHIVE ? styles.active : ''}`}
                                onClick={() => changeEmailTabs(MAILBOX_ARCHIVE)}
                            >
                                <ArchiveIcon/>
                                <span className={styles.mailboxText}>Archive</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    }

                    {tab === MAILBOX_DRAFT &&
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Draft' placement='bottom'>
                            <div
                                className={`${tab === MAILBOX_DRAFT ? styles.active : ''}`}
                                onClick={() => changeEmailTabs(MAILBOX_DRAFT)}
                            >
                                <DraftIcon/>
                                <span className={styles.mailboxText}>Draft</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    }

                    {tab === MAILBOX_SPAM &&
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Spam' placement='bottom'>
                            <div
                                className={`${tab === MAILBOX_SPAM ? styles.active : ''}`}
                                onClick={() => changeEmailTabs(MAILBOX_SPAM)}
                            >
                                <SpamIcon/>
                                <span className={styles.mailboxText}>Spam</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    }

                    <Menu
                        isOpen={isMoreDropdownOpen}
                        onClose={() => {
                            setIsMoreDropdownOpen(false)
                        }}>
                        <MenuButton
                            onClick={() => {
                                setIsMoreDropdownOpen(!isMoreDropdownOpen)
                            }}
                            className={styles.tabListMoreButton} minWidth={'80px'}
                            borderLeft={'1px solid #D1D5DB'}
                            borderRadius={0} backgroundColor={'transparent'} height={'auto'}
                            fontSize={'13px'} color={'#6B7280'} as={Button} marginLeft={1}
                            rightIcon={<TriangleDownIcon/>}
                            _focus={{boxShadow: "none"}}
                        >
                            More
                        </MenuButton>
                        <MenuList zIndex={20}
                            className={`${styles.tabListDropDown} drop-down-list`}
                        >
                            {tab !== MAILBOX_SNOOZED &&
                            <MenuItem
                                onClick={() => changeEmailTabs(MAILBOX_SNOOZED)}><TimeSnoozeIcon/> Snoozed</MenuItem>
                            }

                            {tab !== MAILBOX_STARRED &&
                            <MenuItem
                                onClick={() => changeEmailTabs(MAILBOX_STARRED)}><StarIcon/> Starred</MenuItem>
                            }
                            {tab !== MAILBOX_DRAFT &&
                            <MenuItem onClick={() => changeEmailTabs(MAILBOX_DRAFT)}><DraftIcon/> Draft</MenuItem>
                            }
                            {tab !== MAILBOX_SPAM &&
                            <MenuItem onClick={() => changeEmailTabs(MAILBOX_SPAM)}><SpamIcon/> Spam</MenuItem>
                            }
                            {tab !== MAILBOX_TRASH &&
                            <MenuItem
                                onClick={() => changeEmailTabs(MAILBOX_TRASH)}><TrashIcon/> Trash</MenuItem>
                            }
                            {tab !== MAILBOX_ARCHIVE &&
                            <MenuItem
                                onClick={() => changeEmailTabs(MAILBOX_ARCHIVE)}><ArchiveIcon/> Archive</MenuItem>
                            }
                        </MenuList>
                    </Menu>
                </TabList>
                <Tooltip label={'Compose'} placement={'bottom'} customClass={'text-tooltip'}>
                    <Button
                        className={styles.composeButton} borderRadius={8} height={'auto'} padding={'10px'}
                        minWidth={'101px'} backgroundColor={'#FFFFFF'} color={'#374151'} borderColor={'#F3F4F6'}
                        leftIcon={<EditIcon/>} _hover={{backgroundColor: 'var(--alias-bg-subtle)'}} variant='outline'
                        onClick={() => openComposeModel()}
                    >
                        <span className={styles.composeButtonText}>Compose</span>
                    </Button>
                </Tooltip>
            </Flex>
        )
    }

    return (
        (isThreadSearched || (multiSelection && multiSelection.length > 0)) ? getHeaderForSearched() : getHeaderForNotSearched()
    )
}
