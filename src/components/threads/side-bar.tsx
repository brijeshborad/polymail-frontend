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
    Tabs
} from "@chakra-ui/react";
import {ArchiveIcon, DraftIcon, EditIcon, InboxIcon, SendIcon, StarIcon, TimeSnoozeIcon, TrashIcon} from "@/icons";
import {StateType} from "@/types";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getAllThreads} from "@/redux/threads/action-reducer";
import dynamic from "next/dynamic";
import {SmallCloseIcon, TriangleDownIcon} from "@chakra-ui/icons";
import {getCurrentCacheTab} from "@/utils/cache.functions";
import {MAILBOX_ARCHIVE, MAILBOX_INBOX, MAILBOX_SNOOZED, MAILBOX_STARRED, MAILBOX_TRASH} from "@/utils/constants";
import {threadService, commonService, socketService, draftService} from "@/services";
import Tooltip from "../common/Tooltip";
import {createDraft} from "@/redux/draft/action-reducer";
import {clearDebounce, debounce} from "@/utils/common.functions";
import {MessageDraft} from "@/models";

const MessageSchedule = dynamic(() => import("../messages/message-schedule").then(mod => mod.default));
const ThreadsSideBarTab = dynamic(() => import("@/components/threads").then(mod => mod.ThreadsSideBarTab), {ssr: false});
const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));

export function ThreadsSideBar(props: { cachePrefix: string }) {
    const [tab, setTab] = useState<string>('INBOX');
    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false)
    const [countUnreadMessages, setCountUnreadMessages] = useState<number>(0);
    const {
        threads,
        isLoading,
        selectedThread,
        tabValue,
        isThreadSearched,
        multiSelection
    } = useSelector((state: StateType) => state.threads);
    const {success: draftSuccess, updatedDraft} = useSelector((state: StateType) => state.draft);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {allowThreadSelection} = useSelector((state: StateType) => state.commonApis);
    const dispatch = useDispatch();
    const {isComposing} = useSelector((state: StateType) => state.commonApis);
    const [scheduledDate, setScheduledDate] = useState<string | undefined>();
    const [isMoreClicked, setIsMoreClicked] = useState(false)


    useEffect(() => {
        if (draftSuccess) {
            if (updatedDraft) {
                threadService.pushOrUpdateDraftInThreadMessages(tab, updatedDraft);
            }
        }
    }, [draftSuccess, tab, updatedDraft])

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
                if (!isComposing) {
                    threadService.setSelectedThread(threads[0]);
                }
                if (tabValue === 'DRAFT') {
                    commonService.toggleComposing(true);
                    let item = threads[0];
                    threadService.setSelectedThread(item);
                    if (item && item.messages && item.messages[0]) {
                        draftService.setComposeDraft(item.messages[0] as MessageDraft);
                    }

                }
            }
        }
    }, [allowThreadSelection, isComposing, isLoading, selectedThread, tabValue, threads])

    useEffect(() => {
        if (tab !== '' && getCurrentCacheTab() !== '') {
            threadService.setTabValue(tab);
        }
    }, [tab])

    const searchCancel = (callAPI: boolean = false) => {
        threadService.cancelThreadSearch();
        socketService.cancelThreadSearch(userDetails?.id);
        if (selectedAccount && selectedAccount.id && callAPI) {
            dispatch(getAllThreads({body: {mailbox: tabValue, account: selectedAccount.id}}));
        }
    }

    const changeEmailTabs = (value: string) => {
        if (getCurrentCacheTab() !== value) {
            if (value !== 'DRAFT') {
                commonService.toggleComposingWithThreadSelection(false, true);
                draftService.saveDraftToResume();
            }
            threadService.setTabValueWithEmptyThread(tab);
            searchCancel();
        }
        setTab(value);
    }

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsMoreDropdownOpen(false)
        }
    }, [incomingEvent])

    const openComposeModel = () => {
        threadService.setSelectedThread(null);
        if (!isComposing) {
            draftService.setComposeDraft(null);
            draftService.resumeDraft();
        }
        commonService.toggleComposing(true);
        if (selectedAccount && selectedAccount.id) {
            dispatch(createDraft({body: {accountId: selectedAccount.id, body: {}, fromCompose: true}}));
        }
    }

    const moveThreadToMailBoxes = (type: string, date: string = '') => {
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
                    gap={2} align={'center'} w={"100%"}
                    justify={'space-between'}
                >
                    {isThreadSearched && <Flex align={'center'} fontSize={'13px'} fontWeight={'400'}
                                               color={'#374151'} gap={2} letterSpacing={'-0.13px'}
                                               whiteSpace={'nowrap'}>
                            <span>Search Results {countUnreadMessages > 0 && (
                                <Badge
                                    backgroundColor={'#F3F4F6'} fontSize={'12px'} color={'#6B7280'}
                                    padding={'1px 4px'} borderRadius={4} fontWeight={500}
                                >
                                    {countUnreadMessages}
                                </Badge>
                            )}
                            </span>
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
                        <AddToProjectButton/>
                        <Menu
                          isOpen={isMoreDropdownOpen}
                          onClose={() => setIsMoreDropdownOpen(false)}
                        >
                            <MenuButton
                                onClick={() => {setIsMoreDropdownOpen(!isMoreDropdownOpen)}}
                                className={styles.tabListMoreButton} minWidth={'60px'} height={'auto'}
                                backgroundColor={'transparent'} border={'1px solid #D1D5DB'}
                                lineHeight={1}
                                fontSize={'12px'} color={'#374151'} as={Button} borderRadius={'50px'}
                                rightIcon={<TriangleDownIcon color={'#374151'}/>}
                                p={'0 8px 0 10px'}
                            >
                                Actions
                            </MenuButton>
                            <MenuList className={`${styles.tabListDropDown} drop-down-list`}>
                                <MenuItem
                                    onClick={() => moveThreadToMailBoxes(MAILBOX_INBOX)}><InboxIcon/> Move to
                                    Inbox</MenuItem>
                                <MenuItem
                                    onClick={() => moveThreadToMailBoxes(MAILBOX_ARCHIVE)}><ArchiveIcon/> Move to
                                    Archive</MenuItem>
                                <div className={styles.tabListSnoozeButton}>
                                    <MessageSchedule
                                        isSnooze={true}
                                        date={scheduledDate}
                                        onChange={handleSchedule}
                                        isNameShow={true}
                                    />
                                </div>
                                <MenuItem onClick={() => moveThreadToMailBoxes(MAILBOX_STARRED)}><StarIcon/> Toggle Star</MenuItem>
                                <MenuItem
                                    onClick={() => moveThreadToMailBoxes(MAILBOX_TRASH)}><TrashIcon/> Move to
                                    Trash</MenuItem>
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
            <Flex align={'center'} gap={'3'} padding={"0 6px"}>
                <TabList
                    justifyContent={'space-between'} flex={1} alignItems={'center'}
                    className={styles.mailTabList} overflowX={"auto"}
                >
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Inbox' placement='bottom'>
                            <div
                                className={`${tab === 'INBOX' ? styles.active : ''}`}
                                onClick={() => changeEmailTabs('INBOX')}
                            >
                                <InboxIcon/>
                                <span>Inbox {countUnreadMessages > 0 &&
                                <Badge>{countUnreadMessages}</Badge>}</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Sent' placement='bottom'>
                            <div
                                className={`${tab === 'SENT' ? styles.active : ''}`}
                                onClick={() => changeEmailTabs('SENT')}
                            >
                                <SendIcon/>
                                <span>Sent</span>
                            </div>
                        </Tooltip>
                    </Tab>

                    {!['TRASH', 'STARRED', 'ARCHIVE', 'DRAFT'].includes(tab) &&
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Snoozed' placement='bottom'>
                            <div
                                className={`${tab === 'SNOOZED' ? styles.active : ''}`}
                                onClick={() => changeEmailTabs('SNOOZED')}
                            >
                                <TimeSnoozeIcon/>
                                <span>Snoozed</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    }

                    {tab === 'STARRED' &&
                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Starred' placement='bottom'>
                            <div
                                className={`${tab === 'STARRED' ? styles.active : ''}`}
                                onClick={() => changeEmailTabs('STARRED')}
                            >
                                <StarIcon/>
                                <span>Starred</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    }

                    {tab === 'TRASH' &&

                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Trash' placement='bottom'>
                            <div
                                className={`${tab === 'TRASH' ? styles.active : ''}`}
                                onClick={() => changeEmailTabs('TRASH')}
                            >
                                <TrashIcon/>
                                <span>Trash</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    }
                    {tab === 'ARCHIVE' &&

                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Archive' placement='bottom'>
                            <div
                                className={`${tab === 'ARCHIVE' ? styles.active : ''}`}
                                onClick={() => changeEmailTabs('ARCHIVE')}
                            >
                                <ArchiveIcon/>
                                <span>Archive</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    }

                    {tab === 'DRAFT' &&

                    <Tab className={styles.emailTabs}>
                        <Tooltip label='Draft' placement='bottom'>
                            <div
                                className={`${tab === 'DRAFT' ? styles.active : ''}`}
                                onClick={() => changeEmailTabs('DRAFT')}
                            >
                                <DraftIcon/>
                                <span>Draft</span>
                            </div>
                        </Tooltip>
                    </Tab>
                    }

                    <Menu
                      isOpen={isMoreDropdownOpen}
                      onClose={() => {
                        setIsMoreDropdownOpen(false)
                        setIsMoreClicked(false)
                      }}>
                        <MenuButton
                            onClick={() => {
                              setIsMoreDropdownOpen(!isMoreDropdownOpen)
                              setIsMoreClicked(true)
                            }}
                            className={styles.tabListMoreButton} minWidth={'80px'}
                            borderLeft={'1px solid #D1D5DB'}
                            borderRadius={0} backgroundColor={'transparent'} height={'auto'}
                            fontSize={'13px'} color={'#6B7280'} as={Button} marginLeft={1}
                            rightIcon={<TriangleDownIcon/>}
                            _focus={{ boxShadow: "none" }}
                            onMouseEnter={() => {
                                clearDebounce();
                                setIsMoreDropdownOpen(true)
                            }}
                            onMouseLeave={() => {
                                debounce(() => {
                                    if(!isMoreClicked) {
                                        setIsMoreDropdownOpen(false)
                                        setIsMoreClicked(false)
                                    }
                                }, 100)
                            }}
                        >
                            More
                        </MenuButton>
                        <MenuList
                          className={`${styles.tabListDropDown} drop-down-list`}
                          onMouseEnter={() => {
                              clearDebounce();
                              setIsMoreDropdownOpen(true)
                          }}
                          onMouseLeave={() => {
                              debounce(() => {
                                  if(!isMoreClicked) {
                                      setIsMoreDropdownOpen(false)
                                      setIsMoreClicked(false)
                                  }
                              }, 100)
                          }}
                        >
                            {['TRASH', 'STARRED', 'ARCHIVE', 'DRAFT'].includes(tab) &&
                            <MenuItem
                                onClick={() => changeEmailTabs('SNOOZED')}><TimeSnoozeIcon/> Snoozed</MenuItem>
                            }

                            {tab !== 'TRASH' &&
                            <MenuItem onClick={() => changeEmailTabs('TRASH')}><TrashIcon/> Trash</MenuItem>
                            }
                            {tab !== 'STARRED' &&
                            <MenuItem
                                onClick={() => changeEmailTabs('STARRED')}><StarIcon/> Starred</MenuItem>
                            }
                            {tab !== 'ARCHIVE' &&
                            <MenuItem
                                onClick={() => changeEmailTabs('ARCHIVE')}><ArchiveIcon/> Archive</MenuItem>
                            }
                            {tab !== 'DRAFT' &&
                            <MenuItem onClick={() => changeEmailTabs('DRAFT')}><DraftIcon/> Draft</MenuItem>
                            }
                        </MenuList>
                    </Menu>
                </TabList>
                <Button
                    className={styles.composeButton} borderRadius={8} height={'auto'} padding={'10px'}
                    minWidth={'101px'} backgroundColor={'#FFFFFF'} color={'#374151'} borderColor={'#E5E7EB'}
                    leftIcon={<EditIcon/>} colorScheme='blue' variant='outline'
                    onClick={() => openComposeModel()}
                >
                    Compose
                </Button>
            </Flex>
        )
    }

    return (
        <>
            <Flex direction={'column'} gap={5} className={styles.mailListTabs}>
                <Tabs>
                    {(isThreadSearched || (multiSelection && multiSelection.length > 0)) ? getHeaderForSearched() : getHeaderForNotSearched()}

                    <TabPanels marginTop={5}>
                        <ThreadsSideBarTab cachePrefix={props.cachePrefix}/>
                    </TabPanels>
                </Tabs>
            </Flex>
        </>
    )
}
