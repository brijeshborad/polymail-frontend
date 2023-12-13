import {
    Button,
    Flex,
    Heading,
    Menu, MenuButton, MenuItem, MenuList
} from "@chakra-ui/react";

import {
    ArchiveIcon,
    TrashIcon,
    InboxIcon, StarIcon, InboxOpenIcon, UnmuteIcon, SpamIcon, MenuIcon
} from "@/icons";
import React, {useEffect, useState} from "react";
import {updateThreads} from "@/redux/threads/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Thread} from "@/models";
import dynamic from "next/dynamic";
import {
    MAILBOX_ARCHIVE,
    MAILBOX_INBOX,
    MAILBOX_SNOOZED, MAILBOX_SPAM,
    MAILBOX_STARRED,
    MAILBOX_TRASH,
    MAILBOX_UNREAD
} from "@/utils/constants";
import dayjs from "dayjs";
import {clearDebounce, debounce, generateToasterId} from "@/utils/common.functions";
import {commonService, globalEventService, messageService, threadService} from "@/services";
import Tooltip from "../common/Tooltip";
import {MuteIcon} from "@/icons/mute.icon";
import styles from "@/styles/Inbox.module.css";
import {UsersOnline} from "@/components/common";
import {ArrowBackIcon} from "@chakra-ui/icons";

const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
const MessageSchedule = dynamic(() => import("./message-schedule").then(mod => mod.default));

export function MessagesHeader({isProjectView = false}: { isProjectView?: boolean }) {
    const {selectedThread, threads, tabValue} = useSelector((state: StateType) => state.threads);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {removingThread} = useSelector((state: StateType) => state.commonApis);

    const dispatch = useDispatch();
    const [scheduledDate, setScheduledDate] = useState<string | undefined>();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
    const [showMessageHeader, setShowMessageHeader] = useState<boolean>(true);

    const updateMailBox = (messageBox: string, date: string = '') => {
        if (selectedThread && selectedThread.id) {
            if (messageBox) {
                let currentThreads = [...threads || []] as Thread[];
                let threadData = {...(selectedThread) || {}} as Thread;
                let index1 = currentThreads.findIndex((item: Thread) => item.id === threadData?.id);

                let body: any = {
                    mailboxes: selectedThread.mailboxes || []
                };
                let remove_from_list = false
                let showToast = true;
                switch (messageBox) {
                    case MAILBOX_INBOX:
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_ARCHIVE, MAILBOX_TRASH, MAILBOX_SPAM].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        messageService.setSelectedMessage(null);
                        break;
                    case MAILBOX_TRASH:
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_INBOX, MAILBOX_ARCHIVE, MAILBOX_SPAM].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        messageService.setSelectedMessage(null);
                        break;
                    case MAILBOX_ARCHIVE:
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_INBOX, MAILBOX_TRASH, MAILBOX_SPAM].includes(item))
                        remove_from_list = true
                        messageService.setSelectedMessage(null);
                        break;
                    case MAILBOX_SPAM:
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = [messageBox]
                        body.snooze = null;
                        remove_from_list = true
                        messageService.setSelectedMessage(null);
                        break;
                    case MAILBOX_STARRED:
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            body.mailboxes = body.mailboxes.filter((item: string) => item !== messageBox)
                        } else {
                            body.mailboxes = [...body.mailboxes, messageBox]
                        }
                        break;
                    case MAILBOX_UNREAD:
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            body.mailboxes = body.mailboxes.filter((item: string) => item !== messageBox)
                        } else {
                            body.mailboxes = [...body.mailboxes, messageBox]
                        }
                        showToast = false;
                        break;
                    case MAILBOX_SNOOZED:
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_INBOX, MAILBOX_TRASH, MAILBOX_SPAM].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        messageService.setSelectedMessage(null);
                        const targetDate = dayjs(date)
                        const currentDate = dayjs();
                        const secondsDifference = targetDate.diff(currentDate, 'second');
                        body.snooze = secondsDifference
                        break;
                }

                currentThreads[index1] = {
                    ...currentThreads[index1],
                    mailboxes: body.mailboxes || []
                }

                if (remove_from_list) {
                    commonService.removeThread(currentThreads[index1].id!);
                    currentThreads.splice(index1, 1);

                    messageService.setMessageState({showMessageBox: false});
                    clearDebounce('MESSAGE_BOX');
                    debounce(() => {
                        messageService.setMessageState({showMessageBox: true});
                    }, 5, 'MESSAGE_BOX');
                    // Calculate the final index for an item in the 'currentThreads' array. If 'index1' is within bounds,
                    // reduce it by 1; if 'index1' is 0, keep it the same; if 'index1' is below 0, increase it by 1.
                    let finalIndex = (index1 - 1 < currentThreads.length) ? (index1 === 0) ? index1 : index1 - 1 : (index1 <= 0 ? index1 + 1 : index1 - 1)
                    threadService.setSelectedThread(currentThreads[finalIndex]);
                    messageService.setMessages([]);
                    threadService.moveThreadFromListToListCache(tabValue || 'INBOX', messageBox, threadData.id!)
                } else {
                    threadService.setSelectedThread({...currentThreads[index1]});
                    threadService.updateUmMovingThreadCache(messageBox, currentThreads[index1]);
                }
                // threadService.setThreadState({threads: currentThreads});
                dispatch(updateThreads({
                    body: {
                        id: selectedThread.id,
                        body: body
                    },
                    ...(showToast ? {
                        closePreviousToast: true,
                        toaster: {
                            success: {
                                type: 'undo_changes',
                                desc: 'Thread was moved to ' + messageBox.toLowerCase() + '.',
                                title: selectedThread?.subject || '',
                                id: generateToasterId(),
                            },
                        },
                        undoAction: {
                            showUndoButton: true,
                            dispatch,
                            action: updateThreads,
                            undoBody: {
                                id: threadData.id,
                                body: {
                                    mailboxes: threadData.mailboxes || [],
                                },
                                tag: messageBox.toLowerCase(),
                                afterUndoAction: () => {
                                    if (remove_from_list) {
                                        threadService.moveThreadFromListToListCache(messageBox, tabValue || 'INBOX', threadData.id!);
                                    } else {
                                        threadService.updateUmMovingThreadCache(messageBox, threadData);
                                    }
                                    threadService.setThreadState({
                                        threads: threads || [],
                                        selectedThread: threadData
                                    })
                                }
                            },
                            showToasterAfterUndoClick: true
                        }
                    } : {})
                }));
            }
        }
    }

    function muteThread(mute: boolean) {
        if (selectedThread) {
            dispatch(updateThreads({
                body: {
                    id: selectedThread.id,
                    body: {mute}
                }
            }));
            let finalThreads = [...(threads || [])];
            let index1 = finalThreads.findIndex((item: Thread) => item.id === selectedThread.id);
            if (index1 !== -1) {
                finalThreads[index1] = {
                    ...finalThreads[index1],
                    mute
                }
                threadService.setThreadState({
                    threads: finalThreads || [],
                    selectedThread: {...selectedThread, mute}
                })
                threadService.setThreadState({success: true});
            }
        }
    }

    const handleSchedule = (date: string | undefined) => {
        setScheduledDate(date);
        updateMailBox(MAILBOX_SNOOZED, date);
    }

    useEffect(() => {
        if (incomingEvent === 'thread.archive') {
            globalEventService.blankEvent();
            updateMailBox(MAILBOX_ARCHIVE);
        }
        if (incomingEvent === 'iframe.clicked') {
            setIsMoreMenuOpen(false);
        }
        if (typeof incomingEvent === 'object') {
            if (incomingEvent.type === 'project.toggleList') {
                setShowMessageHeader(!incomingEvent.data);
            }

            if (incomingEvent.type === 'thread.move') {
                globalEventService.blankEvent();
                updateMailBox(incomingEvent.data.mailbox, incomingEvent.data.value);
            }
        }
    }, [incomingEvent])

    if (!selectedThread || !threads || threads.length === 0 || (!tabValue)) {
        return <></>;
    }
    return (
        <>
            <Flex gap={2} align={'center'} justify={'space-between'} padding={'12px 20px'}
                  borderBottom={'1px solid #F3F4F6'} className={styles.mailBoxHeader} display={showMessageHeader ? 'flex': 'none'}>
                <Heading as='h6' fontSize={'15px'} color={'#0A101D'} noOfLines={1}
                         fontWeight={600}>{selectedThread?.subject || '(no subject)'}</Heading>

                <Flex align={'center'} className={styles.mailboxHeaderMobileView}>
                    <Button className={'backToThreadMobile'} minW={'1px'} variant='outline' border={'1px solid #E5E7EB'}
                            fontSize={'13px'} fontWeight={500} letterSpacing={'-0.13px'} borderRadius={'50px'} width={'36px'}
                            height={'36px'} backgroundColor={'#FFFFFF'} alignItems={'center'} justifyContent={'center'}
                            leftIcon={<ArrowBackIcon/>} onClick={() => threadService.setSelectedThread(null)}>
                        {/*Back To Threads*/}
                    </Button>

                    <Flex gap={3} align={'center'}>
                        <Flex alignItems={'center'} justifyContent={'end'} className={'member-images member-images-mobile'}>
                            <UsersOnline type={'threads'} itemId={selectedThread.id!}/>
                        </Flex>
                        {!isProjectView && <AddToProjectButton allowDefaultSelect={true} selectFrom={'thread'} allShowingAutomationMenu={true}/>}
                    </Flex>
                    <Flex align={'center'} className={'header-right-icon'}>
                        <div>
                            {!(selectedThread?.mailboxes || []).includes(MAILBOX_INBOX) && (
                                <Tooltip label='Inbox' placement='bottom'>
                                    <button onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateMailBox(MAILBOX_INBOX)
                                    }} className='inbox-button-icon'>
                                        <InboxIcon/>
                                    </button>
                                </Tooltip>
                            )}
                            {(selectedThread?.mailboxes || []).some((item) => [MAILBOX_SPAM, MAILBOX_INBOX, MAILBOX_TRASH].includes(item)) && (
                                <Tooltip label='Archive' placement='bottom'>
                                    <button onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateMailBox(MAILBOX_ARCHIVE)
                                    }}
                                            className='archive-button-icon'>
                                        <ArchiveIcon/>
                                    </button>
                                </Tooltip>
                            )}
                            {!(selectedThread?.mailboxes || []).includes(MAILBOX_TRASH) && (
                                <Tooltip label='Trash' placement='bottom'>
                                    <button onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateMailBox(MAILBOX_TRASH)
                                    }} className='trash-button-icon'>
                                        <TrashIcon/>
                                    </button>
                                </Tooltip>
                            )}
                            <div>
                                <MessageSchedule
                                    showTooltip={true}
                                    isSnooze={true}
                                    date={scheduledDate}
                                    onChange={handleSchedule}
                                />
                            </div>
                            <Menu isOpen={isMoreMenuOpen}
                                  onClose={() => setIsMoreMenuOpen(false)}>
                                <MenuButton
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setIsMoreMenuOpen(!isMoreMenuOpen)
                                    }} className={`mail-box-header-menu-button ${styles.menuIcon}`}
                                    transition={'all 0.5s'} backgroundColor={'transparent'} outline={'none'}
                                    _focusVisible={{boxShadow: 'none'}} _focus={{boxShadow: 'none'}} fontSize={'12px'}
                                    h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon/>}>
                                </MenuButton>
                                <MenuList className={`drop-down-list ${styles.messageHeaderDropdown}`}>
                                    <MenuItem
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            updateMailBox(MAILBOX_UNREAD)
                                        }}><InboxOpenIcon
                                    /> Mark {(selectedThread?.mailboxes || []).includes(MAILBOX_UNREAD) ? 'Read' : 'Unread'}
                                    </MenuItem>
                                    <MenuItem
                                        className={`starred-button-icon ${(selectedThread?.mailboxes || []).includes(MAILBOX_STARRED) ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            updateMailBox(MAILBOX_STARRED)
                                        }}><StarIcon/> {(selectedThread?.mailboxes || []).includes(MAILBOX_STARRED) ? 'Remove' : 'Add'} Star</MenuItem>
                                    <MenuItem
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            muteThread(!selectedThread?.mute)
                                        }}>{!selectedThread?.mute ? <MuteIcon/> : <UnmuteIcon
                                    />} {!selectedThread?.mute ? 'Mute' : 'Unmute'}</MenuItem>
                                    {!(selectedThread?.mailboxes || []).includes(MAILBOX_SPAM) && <MenuItem
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            updateMailBox(MAILBOX_SPAM)
                                        }}><SpamIcon/> Mark Spam</MenuItem>}
                                </MenuList>
                            </Menu>
                        </div>
                    </Flex>
                </Flex>
            </Flex>
        </>

    )
}
