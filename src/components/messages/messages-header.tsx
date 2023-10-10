import {
    Flex,
    Heading,
    Image
} from "@chakra-ui/react";

import {
    ArchiveIcon,
    TrashIcon,
    InboxIcon
} from "@/icons";
import React, {useEffect, useState} from "react";
import {updateThreads} from "@/redux/threads/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType, MessageHeaderTypes} from "@/types";
import {Toaster} from "@/components/common";
import {Thread, UserProjectOnlineStatus} from "@/models";
import dynamic from "next/dynamic";
import {
    MAILBOX_ARCHIVE,
    MAILBOX_INBOX,
    MAILBOX_SNOOZED,
    MAILBOX_STARRED,
    MAILBOX_TRASH,
    MAILBOX_UNREAD
} from "@/utils/constants";
import dayjs from "dayjs";
import {generateToasterId} from "@/utils/common.functions";
import {membershipService, messageService, threadService} from "@/services";
import Tooltip from "../common/Tooltip";

const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
const MessageSchedule = dynamic(() => import("./message-schedule").then(mod => mod.default));

export function MessagesHeader({headerType}: MessageHeaderTypes) {
    const {selectedThread, threads} = useSelector((state: StateType) => state.threads);
    let {success: membershipSuccess} = useSelector((state: StateType) => state.memberships);
    const {onlineUsers} = useSelector((state: StateType) => state.commonApis);

    const dispatch = useDispatch();
    const [successMessage, setSuccessMessage] = useState<{ desc: string, title: string, id: string, mailboxes: string[], threads: Thread[], thread: Thread | null }[]>([]);
    const [scheduledDate, setScheduledDate] = useState<string | undefined>();


    useEffect(() => {
        if (membershipSuccess && successMessage) {
            let successToastMessage: any = successMessage[0];
            if (successToastMessage) {
                Toaster({
                    desc: successToastMessage.desc,
                    title: successToastMessage.title || '',
                    type: 'success'
                })
                successMessage.splice(0, 1);
                setSuccessMessage(successMessage);
                membershipService.setMembershipState({success: false})
            }

        }
    }, [membershipSuccess, successMessage]);


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
                    case MAILBOX_STARRED:
                    case MAILBOX_UNREAD:
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            body.mailboxes = body.mailboxes.filter((item: string) => item !== messageBox)
                        } else {
                            body.mailboxes = [...body.mailboxes, messageBox]
                        }
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
                    currentThreads.splice(index1, 1)
                }
                threadService.setThreadState({threads: currentThreads, selectedThread: currentThreads[index1]});
                let polyToast = generateToasterId();
                dispatch(updateThreads({
                    body: {
                        id: selectedThread.id,
                        body: body
                    },
                    toaster: {
                        success: {
                            type: 'undo_changes',
                            desc: 'Thread was moved to ' + messageBox.toLowerCase() + '.',
                            title: selectedThread?.subject || '',
                            id: polyToast,
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
                                    selectedThread: (threads || [])[0]
                                })
                            }
                        },
                        showToasterAfterUndoClick: true
                    }
                }));
            }
        }
    }

    const handleSchedule = (date: string | undefined) => {
        setScheduledDate(date);
        updateMailBox(MAILBOX_SNOOZED, date);
    }

    return (
        <>
            <Flex gap={2} align={'center'} justify={'space-between'} padding={'16px 20px 12px'}
                  borderBottom={'1px solid #E5E7EB'}>
                <Flex gap={1}>
                    <Heading as='h6' fontSize={'15px'} color={'#0A101D'}
                             fontWeight={600}>{selectedThread?.subject || '(no subject)'}</Heading>
                </Flex>

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
                    {headerType === 'inbox' && <AddToProjectButton/>}
                    {!(selectedThread?.mailboxes || []).includes(MAILBOX_INBOX) && (
                        <Tooltip label='Inbox' placement='bottom'>
                            <button onClick={() => updateMailBox(MAILBOX_INBOX)} className='inbox-button-icon'>
                                <InboxIcon/>
                            </button>
                        </Tooltip>
                    )}
                    {!(selectedThread?.mailboxes || []).includes(MAILBOX_ARCHIVE) && (
                        <Tooltip label='Archive' placement='bottom'>
                            <button onClick={() => updateMailBox(MAILBOX_ARCHIVE)} className='archive-button-icon'>
                                <ArchiveIcon/>
                            </button>
                        </Tooltip>
                    )}
                    {!(selectedThread?.mailboxes || []).includes(MAILBOX_TRASH) && (
                        <Tooltip label='Trash' placement='bottom'>
                            <button onClick={() => updateMailBox(MAILBOX_TRASH)} className='trash-button-icon'>
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
                </Flex>
            </Flex>
        </>

    )
}
