import {
    Flex,
    Heading,
    Image
} from "@chakra-ui/react";

import {
    ArchiveIcon,
    TrashIcon,
    InboxIcon, StarIcon, InboxOpenIcon, UnmuteIcon, SpamIcon
} from "@/icons";
import React, {useState} from "react";
import {updateThreads} from "@/redux/threads/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Thread, UserProjectOnlineStatus} from "@/models";
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
import {messageService, threadService} from "@/services";
import Tooltip from "../common/Tooltip";
import {MuteIcon} from "@/icons/mute.icon";

const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
const MessageSchedule = dynamic(() => import("./message-schedule").then(mod => mod.default));

export function MessagesHeader() {
    const {selectedThread, threads, tabValue} = useSelector((state: StateType) => state.threads);
    const {onlineUsers} = useSelector((state: StateType) => state.commonApis);

    const dispatch = useDispatch();
    const [scheduledDate, setScheduledDate] = useState<string | undefined>();

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
                        body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_ARCHIVE, MAILBOX_TRASH].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        messageService.setSelectedMessage(null);
                        break;
                    case MAILBOX_TRASH:
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_INBOX, MAILBOX_ARCHIVE].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        messageService.setSelectedMessage(null);
                        break;
                    case MAILBOX_ARCHIVE:
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_INBOX, MAILBOX_TRASH].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        messageService.setSelectedMessage(null);
                        break;
                    case MAILBOX_SPAM:
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = [messageBox]
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
                        body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_INBOX, MAILBOX_TRASH].includes(item))
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
                }
                threadService.setThreadState({threads: currentThreads});
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

    if (!selectedThread || !threads || threads.length === 0 || (!tabValue)) {
        return <></>;
    }
    return (
        <>
            <Flex gap={2} align={'center'} justify={'space-between'} padding={'16px 20px 12px'}
                  borderBottom={'1px solid #E5E7EB'}>
                <Flex gap={1}>
                    <Heading as='h6' fontSize={'15px'} color={'#0A101D'} noOfLines={1}
                             fontWeight={600}>{selectedThread?.subject || '(no subject)'}</Heading>
                </Flex>

                <Flex align={'center'}>
                    <Flex gap={3} align={'center'}>
                        <Flex alignItems={'center'} justifyContent={'end'} className={'member-images'}>
                            {(onlineUsers && selectedThread && onlineUsers['threads'][selectedThread.id!] || [])
                                .filter((t: UserProjectOnlineStatus) => t.isOnline).slice(0, 5)
                                .map((item: UserProjectOnlineStatus, index: number) => (
                                        <Tooltip label={item.name || ''} placement='bottom' key={index}>
                                            <div className={'member-photo'}
                                                 style={{background: '#000', border: `2px solid #${item.color}`}}>
                                                {item.avatar && <Image src={item.avatar} width="24" height="24"
                                                                       alt=""/>}
                                            </div>
                                        </Tooltip>
                                    )
                                )
                            }
                        </Flex>
                        <AddToProjectButton allowDefaultSelect={true}/>
                    </Flex>

                    <Flex align={'center'} className={'header-right-icon'}>
                        <div>
                            {!(selectedThread?.mailboxes || []).includes(MAILBOX_UNREAD) && (
                                <Tooltip label='Unread' placement='bottom'>
                                    <button onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateMailBox(MAILBOX_UNREAD)
                                    }}
                                            className={`unread-button-icon`}>
                                        <InboxOpenIcon/>
                                    </button>
                                </Tooltip>
                            )}
                            <Tooltip label='Starred' placement='bottom'>
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateMailBox(MAILBOX_STARRED)
                                }}
                                        className={`starred-button-icon ${(selectedThread?.mailboxes || []).includes(MAILBOX_STARRED) ? 'active' : ''}`}>
                                    <StarIcon/>
                                </button>
                            </Tooltip>
                            <Tooltip label={selectedThread?.mute ? 'Unmute' : 'Mute'} placement='bottom'>
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    muteThread(!selectedThread?.mute)
                                }}
                                        className={`mute-button-icon`}>
                                    {!selectedThread?.mute ? <MuteIcon/> : <UnmuteIcon/>}
                                </button>
                            </Tooltip>
                        </div>
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
                            {!(selectedThread?.mailboxes || []).includes(MAILBOX_ARCHIVE) && (
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
                            <Tooltip label='Snooze' placement='bottom'>
                                <div>
                                    <MessageSchedule
                                        isSnooze={true}
                                        date={scheduledDate}
                                        onChange={handleSchedule}
                                    />
                                </div>
                            </Tooltip>
                            {!(selectedThread?.mailboxes || []).includes(MAILBOX_SPAM) && (
                                <Tooltip label='Spam' placement='bottom'>
                                    <button onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateMailBox(MAILBOX_SPAM)
                                    }} className='trash-button-icon'>
                                        <SpamIcon/>
                                    </button>
                                </Tooltip>
                            )}
                        </div>
                    </Flex>
                </Flex>
            </Flex>
        </>

    )
}
