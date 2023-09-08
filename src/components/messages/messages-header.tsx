import {
    Flex,
    Tooltip,
    Heading
} from "@chakra-ui/react";

import {
    ArchiveIcon,
    TimeSnoozeIcon,
    TrashIcon,
    InboxIcon
} from "@/icons";
import React, {useEffect, useState} from "react";
import {updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {updateMembershipState} from "@/redux/memberships/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType, MessageHeaderTypes} from "@/types";
import {getAllProjects} from "@/redux/projects/action-reducer";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {Toaster} from "@/components/common";
import {Thread} from "@/models";
import {AddToProjectButton} from "@/components/common";

export function MessagesHeader({herderType}: MessageHeaderTypes) {
    const {selectedThread, threads, updateSuccess} = useSelector((state: StateType) => state.threads);
    let {success: membershipSuccess} = useSelector((state: StateType) => state.memberships);

    const dispatch = useDispatch();
    const [successMessage, setSuccessMessage] = useState<{ desc: string, title: string } | null>(null);


    useEffect(() => {
        dispatch(getAllProjects());
    }, [dispatch]);


    useEffect(() => {
        if (updateSuccess && successMessage) {
            Toaster({
                desc: successMessage.desc,
                title: successMessage.title || '',
                type: 'success'
            })
            setSuccessMessage(null)
            dispatch(updateThreadState({updateSuccess: false}));
        }
    }, [updateSuccess, dispatch, successMessage]);


    useEffect(() => {
        if (membershipSuccess && successMessage) {
            Toaster({
                desc: successMessage.desc,
                title: successMessage.title || '',
                type: 'success'
            })
            setSuccessMessage(null)
            dispatch(updateMembershipState({success: false}));
        }
    }, [membershipSuccess, dispatch, successMessage]);


    const updateMailBox = (messageBox: string) => {
        if (selectedThread && selectedThread.id) {
            if (messageBox) {
                let currentThreads = [...threads || []] as Thread[];
                let threadData = {...(selectedThread) || {}} as Thread;
                let index1 = currentThreads.findIndex((item: Thread) => item.id === threadData?.id);

                let body = {
                    mailboxes: selectedThread.mailboxes || []
                };
                let remove_from_list = false
                switch (messageBox) {
                    case "INBOX":
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => !["ARCHIVE", "TRASH"].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        dispatch(updateMessageState({selectedMessage: null}));
                        break;
                    case "TRASH":
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => !["INBOX", "ARCHIVE"].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        dispatch(updateMessageState({selectedMessage: null}));
                        break;
                    case "ARCHIVE":
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => !["INBOX", "TRASH"].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        dispatch(updateMessageState({selectedMessage: null}));
                        break;
                    case "STARRED":
                    case "UNREAD":
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            body.mailboxes = body.mailboxes.filter((item: string) => item !== messageBox)
                        } else {
                            body.mailboxes = [...body.mailboxes, messageBox]
                        }
                        break;
                }

                currentThreads[index1] = {
                    ...currentThreads[index1],
                    mailboxes: body.mailboxes || []
                }

                if (remove_from_list) {
                    currentThreads.splice(index1, 1)
                }

                dispatch(updateThreadState({
                    threads: currentThreads,
                    selectedThread: currentThreads[index1],
                    success: true
                }));
                dispatch(updateThreads({id: selectedThread.id, body}));
                setSuccessMessage({
                    desc: 'Thread was moved to ' + messageBox.toLowerCase() + '.',
                    title: selectedThread?.subject || '',
                })
            }
        }
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
                    {herderType === 'inbox' && <AddToProjectButton />}
                    {!(selectedThread?.mailboxes || []).includes("INBOX") && (
                        <Tooltip label='Inbox' placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => updateMailBox('INBOX')}>
                                <InboxIcon/>
                            </div>
                        </Tooltip>
                    )}
                    {!(selectedThread?.mailboxes || []).includes("ARCHIVE") && (
                        <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => updateMailBox('ARCHIVE')}>
                                <ArchiveIcon/>
                            </div>
                        </Tooltip>
                    )}
                    {!(selectedThread?.mailboxes || []).includes("TRASH") && (
                        <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => updateMailBox('TRASH')}>
                                <TrashIcon/>
                            </div>
                        </Tooltip>
                    )}
                    <Tooltip label='Snooze' placement='bottom' bg='gray.300' color='black'>
                        <div onClick={() => updateMailBox('SNOOZE')}>
                            <TimeSnoozeIcon/>
                        </div>
                    </Tooltip>
                </Flex>
            </Flex>
        </>

    )
}
