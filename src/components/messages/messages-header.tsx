import {
    Flex,
    Tooltip,
    Heading, createStandaloneToast
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
import {updateMessageState} from "@/redux/messages/action-reducer";
import {Toaster} from "@/components/common";
import {Thread} from "@/models";

const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
import {undoBodyData} from "@/redux/undo-body/action-reducer";
import dynamic from "next/dynamic";

export function MessagesHeader({headerType}: MessageHeaderTypes) {
    const {selectedThread, threads, updateSuccess} = useSelector((state: StateType) => state.threads);
    let {success: membershipSuccess} = useSelector((state: StateType) => state.memberships);
    let {undoBody} = useSelector((state: StateType) => state.undoBody);

    const dispatch = useDispatch();
    const [successMessage, setSuccessMessage] = useState<{ desc: string, title: string, id: string, mailBoxes: string[] }[]>([]);
    const { toast } = createStandaloneToast()
    const [mailBoxName, setMailBoxName] = useState<string>('');

    useEffect(() => {
        if (updateSuccess && successMessage.length > 0) {
            let polyToast = `poly-toast-${new Date().getTime().toString()}`;
            let successToastMessage: any = successMessage[0];
            if (successToastMessage) {
                Toaster({
                    desc: successToastMessage.desc,
                    title: successToastMessage.title || '',
                    type: undoBody ? 'undo_changes': 'success',
                    id: polyToast,
                    ...(undoBody ? {
                        undoUpdateRecordClick: () => {
                            if (successToastMessage && successToastMessage.id) {
                                let body = {
                                    mailboxes: successToastMessage.mailboxes || []
                                }
                                dispatch(undoBodyData(null));
                                dispatch(updateThreads({id: successToastMessage.id, body}));
                                successMessage.push({
                                    desc: 'Thread was moved from ' + mailBoxName.toLowerCase() + '.',
                                    title: successToastMessage?.title || '',
                                    id: successToastMessage?.id,
                                    mailBoxes: successToastMessage?.mailBoxes
                                });
                                setSuccessMessage(successMessage)
                            }
                            toast.close(`${polyToast}`);
                        }
                    }: {})
                })
                successMessage.splice(0, 1);
                setSuccessMessage(successMessage);
                dispatch(updateThreadState({updateSuccess: false}));
                if (successMessage.length > 0) {
                    setTimeout(() => {
                        dispatch(updateThreadState({updateSuccess: true}));
                    }, 100);
                }
            }

        }

    }, [updateSuccess, dispatch, successMessage]);


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
                dispatch(updateMembershipState({success: false}));
            }

        }
    }, [membershipSuccess, dispatch, successMessage]);


    const updateMailBox = (messageBox: string) => {
        setMailBoxName(messageBox)
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
                dispatch(undoBodyData(selectedThread))
                dispatch(updateThreads({id: selectedThread.id, body}));
                successMessage.push({
                    desc: 'Thread was moved to ' + messageBox.toLowerCase() + '.',
                    title: selectedThread?.subject || '',
                    id: selectedThread?.id,
                    mailBoxes: selectedThread?.mailboxes || []
                })
                setSuccessMessage(successMessage)
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
                    {headerType === 'inbox' && <AddToProjectButton/>}
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
