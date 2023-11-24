import {
    Button,
    Flex, Heading, Input,
    Menu,
    MenuButton, MenuItem,
    MenuList,
    Text
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import Image from "next/image";
import {ChevronDownIcon, CloseIcon} from "@chakra-ui/icons";
import React, {WheelEvent, useCallback, useEffect, useRef, useState} from "react";
import {clearDebounce, debounce, getProjectBanner, getSignatureBanner} from "@/utils/common.functions";
import {DropZone} from "@/components/common";
import {updatePartialMessage, discardDraft} from "@/redux/draft/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {Message as MessageModel, Message, MessageAttachments, MessageDraft, MessageRecipient} from "@/models";
import {removeAttachment, uploadAttachment} from "@/redux/messages/action-reducer";
import {MessageBoxType} from "@/types/props-types/message-box.type";
import {useRouter} from "next/router";
import {getPlainTextFromHtml} from "@/utils/editor-common-functions";
import dynamic from "next/dynamic";
import CollabRichTextEditor from "../common/collab-rich-text-editor";
import {draftService, globalEventService, messageService} from "@/services";
import {RecipientsType} from "@/types/props-types/message-recipients.type";
import {ProgressBar} from "@/components/loader-screen/progress-bar";
import Tooltip from "@/components/common/Tooltip";

const MessageRecipients = dynamic(() => import("./message-recipients").then(mod => mod.default));
const MessageSchedule = dynamic(() => import("./message-schedule").then(mod => mod.default));
// const Time = dynamic(() => import("@/components/common").then(mod => mod.Time));


dayjs.extend(relativeTime)

const blankRecipientValue: MessageRecipient = {
    name: '',
    email: ''
}

let loaderPercentage = 10;

let sendData: { [key: string]: string } = {};
let isCreating: { [key: string]: boolean } = {};

export function MessageReplyBox(props: MessageBoxType) {
    const [emailRecipients, setEmailRecipients] = useState<RecipientsType | any>({
        cc: {items: [], value: blankRecipientValue},
        bcc: {items: [], value: blankRecipientValue},
        recipients: {items: [], value: blankRecipientValue},
    })
    const [subject, setSubject] = useState<string>('');
    // const [emailBody, setEmailBody] = useState<string>('');
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {draft, success: draftSuccess, updatedDraft} = useSelector((state: StateType) => state.draft);
    const {selectedThread} = useSelector((state: StateType) => state.threads);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {selectedMessage, showAttachmentLoader} = useSelector((state: StateType) => state.messages);
    const dispatch = useDispatch();
    const [attachments, setAttachments] = useState<MessageAttachments[]>([]);
    const inputFile = useRef<HTMLInputElement | null>(null)
    const [scheduledDate, setScheduledDate] = useState<string | undefined>();
    const [showEditorToolbar, setShowEditorToolbar] = useState<boolean>(false);
    const [showReplyBox, setShowReplyBox] = useState<boolean>(false);
    const [isReplyDropdownOpen, setIsReplyDropdownOpen] = useState<boolean>(false);
    const [extraClassNames, setExtraClassNames] = useState<string>('');
    const [extraClassNamesForBottom, setExtraClassNamesForBottom] = useState<string>('');
    const [draftIndex, setDraftIndex] = useState<number | null>(null);
    const [isDraftUpdated, setIsDraftUpdated] = useState<boolean>(false);
    const [isContentUpdated, setIsContentUpdated] = useState<boolean>(false);
    const [messageData, setMessageData] = useState<any>(null);
    const [replyType, setReplyType] = useState<string>('reply');
    const [reloadingEditor, setReloadingEditor] = useState<boolean>(false);
    const [isOnTop, setIsOnTop] = useState(true)
    const [deltaY, setDeltaY] = useState(0)

    const editorRef = useRef<any>(null);
    const router = useRouter();
    const divRef = useRef<HTMLDivElement | null>(null);
    const [divHeight, setDivHeight] = useState<number>(0);
    const [emailList, setEmailList] = useState<any>([]);
    const [totalDraftMessages, setTotalDraftMessages] = useState<MessageDraft[]>([]);
    const [totalMessages, setTotalMessages] = useState<MessageDraft[] | null>(null);
    const [waitForDraft, setWaitForDraft] = useState<boolean>(false);

    const isDraftCreatedByCurrentUser = draft?.accountId === selectedAccount?.id

    useEffect(() => {
        if (draftSuccess) {
            if (updatedDraft) {
                if (totalMessages && totalMessages[0] && updatedDraft.threadId !== totalMessages[0].threadId) {
                    return;
                }
                setWaitForDraft(false);
                let finalMessages = [...(totalMessages || [])]
                let findDraft = finalMessages.findIndex((item: Message) => item.id === updatedDraft.id);
                if (findDraft !== -1) {
                    finalMessages[findDraft] = updatedDraft;
                } else {
                    finalMessages.push(updatedDraft);
                }
                setTotalMessages([...finalMessages]);
            }
        }
    }, [draftSuccess, updatedDraft, totalMessages])

    useEffect(() => {
        if (selectedThread) {
            setTotalMessages([...selectedThread?.messages || []]);
            discardMessage(false);
        }
    }, [selectedThread])

    useEffect(() => {
        if (totalMessages) {
            let messages = [...totalMessages];
            let draftMessages = [...messages].filter((item: MessageDraft) => item.mailboxes?.includes('DRAFT') && !item.draftInfo?.discardedBy)
            setTotalDraftMessages([...draftMessages]);
            if (draftIndex === null) {
                setDraftIndex(messages.length);
            }
        }
    }, [totalMessages, draftIndex])

    useEffect(() => {
        if (emailRecipients?.recipients?.items && emailRecipients?.recipients?.items.length > 1) {
            let myArray = [...emailRecipients?.recipients?.items]
            myArray.shift();
            setEmailList(myArray)
        }
    }, [emailRecipients])

    useEffect(() => {
        if (selectedThread && !isContentUpdated) {
            const draftMessage: any = (selectedThread?.messages || []).findLast((msg: Message) => (msg.mailboxes || []).includes('DRAFT'));
            if (draftMessage) {
                if (draftMessage.to && draftMessage.to.length) {
                    setTimeout(() => {
                        setEmailRecipients((prevState: any) => ({
                            ...prevState,
                            recipients: {
                                items: draftMessage.to,
                                value: blankRecipientValue
                            }
                        }));
                    }, 100)
                }
            }
        }
    }, [isContentUpdated, selectedThread])


    useEffect(() => {
        if (divRef.current) {
            setTimeout(() => {
                const height = divRef.current?.offsetHeight || 0;
                setDivHeight(height);
            }, 100)

        }
    }, [showReplyBox, emailRecipients]);

    useEffect(() => {
        if (!showReplyBox) {
            setDivHeight(0)
        }

    }, [showReplyBox, divHeight])

    const validateDraft = (value: string) => {
        return !!(subject || getPlainTextFromHtml(value).trim() || emailRecipients.recipients.items.length > 0 || emailRecipients.cc.items.length > 0 || emailRecipients.bcc.items.length > 0);
    }

    const sendToDraft = (value: string, isValueUpdate: boolean = true) => {
        if (!validateDraft(value)) {
            return;
        }
        if (!showEditorToolbar) {
            return;
        }
        let checkValue = getPlainTextFromHtml(value).trim();
        if (checkValue.trim()) {
            setIsDraftUpdated(true)
        }
        if (isValueUpdate) {
            if (!value.trim()) {
                setExtraClassNames(prevState => prevState.replace('show-shadow', ''));
                setExtraClassNamesForBottom(prevState => prevState.replace('show-shadow-bottom', ''));
            }
            // setEmailBody(value);
            sendData[selectedThread?.id + '-' + draftIndex] = value;
        }

        let finalSubject = subject;
        if (!finalSubject) {
            if (replyType === 'reply' || replyType === 'reply-all') {
                finalSubject = `Re: ${selectedThread?.subject}`
            } else if (replyType === 'forward') {
                finalSubject = `Fwd: ${selectedThread?.subject}`
            }
            // setSubject(finalSubject);
        }

        let messageId = '';
        if (messageData && messageData.id) {
            messageId = messageData.id;
        } else if (selectedMessage && selectedMessage.id) {
            messageId = selectedMessage.id;
        }

        let body: any = {
            subject: finalSubject,
            to: emailRecipients.recipients?.items,
            cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
            bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
            draftInfo: {
                // body: value || emailBody
            },
            messageId,
            ...(props.isProjectView ? {projectId: router.query.project as string} : {}),
            accountId: selectedAccount?.id
        }
        if (draft?.id) {
            setWaitForDraft(false);
            debounce(() => {
                dispatch(updatePartialMessage({body: {id: selectedThread?.id + '-' + draftIndex, body: body}}));
            }, 250);
        } else {
            if (waitForDraft) {
                return;
            }
            setWaitForDraft(true);
            clearDebounce('DRAFT_CREATION');
            debounce(() => {
                dispatch(updatePartialMessage({body: {id: selectedThread?.id + '-' + draftIndex, body: body}}));
            }, 500, 'DRAFT_CREATION');
        }
    }

    useEffect(() => {
        if (!waitForDraft) {
            // console.log(emailBody);
            sendToDraft('', false);
        }
    }, [waitForDraft])

    useEffect(() => {
        // Add signature and draft to email body
        if (draft && draft.id && !isContentUpdated) {
            setIsContentUpdated(true);
            const {subject, to, cc, bcc, draftInfo} = draft;
            if (subject) {
                setSubject(subject)
            }
            if (draftInfo && draftInfo.body) {
                let checkValue = getPlainTextFromHtml(draftInfo.body).trim();
                if (checkValue.trim()) {
                    setIsDraftUpdated(true)
                }
                if (!sendData[selectedThread?.id + '-' + draftIndex]) {
                    sendData[selectedThread?.id + '-' + draftIndex] = draftInfo?.body || '';
                    // setEmailBody(draftInfo?.body || '');
                } else {
                    // setEmailBody(sendData[selectedThread?.id + '-' + draftIndex]);
                }
            }
            if (draftInfo?.attachments?.length) {
                setAttachments([
                    ...draftInfo.attachments.map(t => ({
                        filename: t.filename,
                        mimeType: t.mimeType,
                        isUploaded: true
                    }))
                ]);
            }
            if (to && to.length) {
                setEmailRecipients((prevState: any) => ({
                    ...prevState,
                    recipients: {
                        items: to,
                        value: blankRecipientValue
                    }
                }));
            }
            if (cc && cc.length) {
                setEmailRecipients((prevState: any) => ({
                    ...prevState,
                    cc: {
                        items: cc,
                        value: blankRecipientValue
                    }
                }));
            }
            if (bcc && bcc.length) {
                setEmailRecipients((prevState: any) => ({
                    ...prevState,
                    bcc: {
                        items: bcc,
                        value: blankRecipientValue
                    }
                }));
            }
        }
    }, [draft, isContentUpdated])

    function formatEmailString(emailArray: any) {
        if (Array.isArray(emailArray)) {
            if (emailArray.length === 1) {
                return emailArray[0].email;
            } else if (emailArray.length > 1) {
                return `${emailArray[0].email} and ${emailArray.length - 1} other`;
            }
        }
        return '';
    }

    const getForwardContent = useCallback((content: any) => {
        const to = content?.to;
        const toEmailString = formatEmailString(to);

        const cc = content?.cc; // Changed cc assignment to match the correct prop
        const ccEmailString = formatEmailString(cc);

        const forwardContent: string = `<p></p><p></p><p></p><p></p>
             <p style="color: black; background: none">---------- Forwarded message ----------</br>
From: ${content?.from?.email}</br>
Date: ${dayjs(content?.created).format('ddd, MMM DD, YYYY [at] hh:mm A')}</br>
Subject: ${content?.subject}</br>
To: ${toEmailString}</br>
${content?.cc ? 'Cc: ' + ccEmailString : ''}</p><br/><br/><br/>`;
        return forwardContent;
    }, [])

    useEffect(() => {
        if (selectedMessage && !draft) {
            if (selectedMessage?.from) {
                setEmailRecipients((prevState: RecipientsType) => ({
                    ...prevState,
                    recipients: {
                        items: (selectedMessage?.from?.email === selectedAccount?.email && replyType === 'reply') ? selectedMessage?.to! : [selectedMessage?.from!],
                        value: prevState.recipients.value
                    }
                }));
            }
            if (selectedMessage?.cc?.length) {
                let items: MessageRecipient[] = []
                if (replyType === 'reply-all') {
                    items.push(selectedMessage?.from!)
                    if (selectedMessage?.cc && selectedMessage?.cc.length) {
                        items.push(...selectedMessage?.cc)
                    } else if (selectedMessage?.bcc && selectedMessage?.bcc.length) {
                        items.push(...selectedMessage?.bcc)
                    }
                }
                const filteredArray = (items || []).filter(obj => obj.email !== '' && selectedMessage?.from?.email !== obj.email);
                setEmailRecipients((prevState: RecipientsType) => ({
                    ...prevState,
                    cc: {
                        items: filteredArray,
                        value: prevState.cc.value
                    }
                }));
            }

            if (selectedMessage?.bcc?.length) {
                setEmailRecipients((prevState: RecipientsType) => ({
                    ...prevState,
                    bcc: {
                        items: selectedMessage?.bcc,
                        value: prevState.bcc.value
                    }
                }));
            }

        }
    }, [selectedMessage, replyType, selectedAccount?.email, draft])

    useEffect(() => {
        const propertiesToCheck: (keyof RecipientsType)[] = ['recipients', 'bcc', 'cc'];
        let allValues: MessageRecipient[] = [];
        // add message to draft when user add cc, bcc, recipients and subject
        for (const property of propertiesToCheck) {
            if (emailRecipients && emailRecipients[property] && emailRecipients[property].items && Array.isArray(emailRecipients[property].items)) {
                allValues = [...allValues, ...emailRecipients[property].items];
            }
        }

        if ((allValues.length > 0 && emailRecipients && emailRecipients['recipients'] && emailRecipients['recipients'].items.length > 0) || subject) {
            sendToDraft('', false);
        }
    }, [subject, emailRecipients]);

    function handleFileUpload(files: any, event: any = null) {
        if (!files) return;
        loaderPercentage = 0;
        const file = files[0];
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        const reader = new FileReader();
        if (reader) {
            reader.readAsDataURL(file);
            reader.onload = function () {
                if (reader.result) {
                    if (inputFile.current && inputFile.current?.value) {
                        inputFile.current.value = '';
                    }
                    setAttachments([
                        ...(attachments || []),
                        {
                            filename: file.name,
                            mimeType: file.type,
                            isUploaded: false
                        }
                    ]);

                    if (draft && draft.id) {
                        if (loaderPercentage < 100) {
                            loaderPercentage += 20;
                        }
                        dispatch(uploadAttachment({
                            body: {id: draft.id, file: file},
                            afterSuccessAction: () => {
                                sendToDraft('', false);
                            }
                        }));
                    } else {
                        if (loaderPercentage < 100) {
                            loaderPercentage += 20;
                        }
                        let body: any = {
                            subject: subject,
                            to: emailRecipients.recipients?.items,
                            cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
                            bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
                            // draftInfo: {
                            //     // body: emailBody
                            // },
                            messageId: messageData?.id,
                            accountId: selectedAccount?.id,
                            ...(props.isProjectView ? {projectId: router.query.project as string} : {}),
                        }
                        dispatch(updatePartialMessage({
                            body: {id: selectedThread?.id + '-' + draftIndex, body: body},
                            afterSuccessAction: (draft: any) => {
                                draftService.setReplyDraft(draft);
                                dispatch(uploadAttachment({body: {id: draft.id, file: file}}));
                            }
                        }));
                    }
                }
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        }
    }


    useEffect(() => {
        if (loaderPercentage < 100) {
            loaderPercentage *= 2;
        }
    }, [loaderPercentage])

    useEffect(() => {
        if (!showAttachmentLoader) {
            (attachments || []).map((item: any) => {
                if (!item.isUploaded) {
                    item.isUploaded = true
                }
            })
        }
    }, [showAttachmentLoader])

    function removeAttachmentData(index: number) {
        const newArr = [...attachments];
        (newArr || []).splice(index, 1);
        setAttachments([...newArr!]);
        if (draft && draft.id && draft.draftInfo?.attachments && draft.draftInfo?.attachments[index] && draft.draftInfo?.attachments[index].id) {
            dispatch(removeAttachment({
                body: {id: draft.id!, attachment: draft.draftInfo?.attachments[index].id!},
                afterSuccessAction: () => {
                    dispatch(updatePartialMessage({body: {id: selectedThread?.id + '-' + draftIndex}}));
                }
            }))
        }
    }

    const discardMessage = (isRescue: boolean = false) => {
        delete sendData[selectedThread?.id + '-' + draftIndex];
        if (!isRescue) {
            setIsReplyDropdownOpen(false)
            setShowReplyBox(false);
            setShowEditorToolbar(false)
            // globalEventService.fireEvent({data: '', type: 'richtexteditor.discard'});
            handleEditorScroll();
        }
        if (draft && draft.id) {
            messageService.setDraftCache(draft.id);
            let discardedBy = isRescue ? '' : selectedAccount?.name;
            draftService.instantDraftUpdate({...draft, draftInfo: {...draft?.draftInfo, discardedBy: discardedBy}});
            setDraftIndex(null);
            draftService.setReplyDraft(null);
            setAttachments([]);
            // draftService.discardDraft(draft.id!);
            dispatch(discardDraft({
                body: {id: draft.id, discardedBy: discardedBy},
                // afterSuccessAction: () => {
                //     setIsDraftUpdated(false);
                // }
            }));
        }
    }

    const sendMessages = () => {
        if (draft && draft.id) {
            if (showAttachmentLoader) {
                return;
            }
            setShowReplyBox(false);
            let messageId = '';
            if (messageData && messageData.id) {
                messageId = messageData.id;
            } else if (selectedMessage && selectedMessage.id) {
                messageId = selectedMessage.id;
            }
            let body: any = {
                subject: subject,
                to: emailRecipients.recipients?.items,
                cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
                bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
                draftInfo: {
                    body: sendData[selectedThread?.id + '-' + draftIndex]
                },
                messageId,
                ...(props.isProjectView ? {projectId: router.query.project as string} : {}),
            }
            messageService.sendMessage(false, scheduledDate || '', {...body, id: draft.id});
            draftService.setReplyDraft(null);
            setEmailRecipients({
                cc: {items: [], value: blankRecipientValue},
                bcc: {items: [], value: blankRecipientValue},
                recipients: {items: messageData ? [messageData.from!] : [], value: blankRecipientValue}
            });
            setShowEditorToolbar(false);
            setScheduledDate(undefined)
            // setEmailBody('');
            sendData[selectedThread?.id + '-' + draftIndex] = '';
            setAttachments([]);
            setIsContentUpdated(false);
            setIsDraftUpdated(false);
            setDraftIndex(null);
            delete sendData[selectedThread?.id + '-' + draftIndex];
            globalEventService.fireEvent({data: {body: ''}, type: 'richtexteditor.forceUpdate'});
        }
    }


    const handleBlur = () => {
        // setTimeout(() => {
        //   setShowEditorToolbar(false)
        // }, 500)
    }

    const handleFocus = () => {
        setShowEditorToolbar(true);
        setIsOnTop(true)
        setDeltaY(0)
        globalEventService.fireEvent({data: {}, type: 'richtexteditor.focus'})
    }

    // const getBody = () => {
    //     let body = '';
    //     if (selectedAccount) {
    //         body += getSignatureBanner(selectedAccount);
    //         // ${selectedThread?.projects && selectedThread.projects.length === 1 ? `<!--<p style="font-size: 13px; margin-right: 3px;">at </p><p style="font-size: 13px; text-decoration: underline; margin-right: 3px;">${selectedThread.projects[0].name}</p>-->` : `<p style="font-size: 13px; text-decoration: underline; margin-right: 3px;">others</p>`}
    //         if (selectedThread?.projects?.length) {
    //             body += getProjectBanner(selectedAccount);
    //         }
    //     }
    //     return body;
    // }

    const showRecipientsBox = () => {
        setShowReplyBox((current) => !current);
    }

    const handleSchedule = (date: string | undefined) => {
        setScheduledDate(date);
    }

    const handleEditorScroll = useCallback((watchScrollHeight = false) => {
        if (editorRef.current && editorRef.current.scrollTop > 0) {
            setExtraClassNames(prevState => !prevState.includes('show-shadow') ? prevState + ' show-shadow' : prevState);
        } else {
            setExtraClassNames(prevState => prevState.replace('show-shadow', ''));
        }

        const container = editorRef.current;
        if (container) {
            const size = editorRef.current.getBoundingClientRect()

            if (watchScrollHeight && editorRef.current.scrollTop === 0 && editorRef.current.scrollHeight >= 325 && editorRef.current.scrollHeight > size.height) {
                if (!isOnTop) {
                    clearDebounce('setIsOnTop')
                    debounce(() => {
                        setIsOnTop(true)
                        setDeltaY(0)
                    }, 500, 'setIsOnTop')
                }
            }

            if (isOnTop && editorRef.current.scrollTop > 10) {
                setIsOnTop(false)
            }
            const scrollHeight = container?.scrollHeight;
            const containerHeight = container?.clientHeight;
            const scrollBottom = scrollHeight - containerHeight - editorRef.current.scrollTop;
            if (scrollBottom > 3) {
                setExtraClassNamesForBottom(prevState => !prevState.includes('show-shadow-bottom') ? prevState + ' show-shadow-bottom' : prevState);
            } else {
                setExtraClassNamesForBottom(prevState => prevState.replace('show-shadow-bottom', ''));
            }
        }
    }, [isOnTop])

    useEffect(() => {
        handleEditorScroll();
    }, [handleEditorScroll]);

    useEffect(() => {
        if (isOnTop && deltaY < 0 && showEditorToolbar) {
            setShowEditorToolbar(false)
            setDeltaY(100)
            setIsOnTop(false)
        }
    }, [isOnTop, deltaY, showEditorToolbar])

    useEffect(() => {
        editorRef.current.addEventListener('wheel', (event: WheelEvent) => {
            setDeltaY(event.deltaY)
        })
    }, [])

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsReplyDropdownOpen(false)
        }
        if (incomingEvent === 'draft.undo') {
            handleFocus();
        }
        if (incomingEvent === 'draft.setNull') {
            setDraftIndex(null);
        }
        if (typeof incomingEvent === 'object' && incomingEvent.type) {
            if (incomingEvent.type === 'draft.updateType') {
                globalEventService.blankEvent();
                updateDraftType(incomingEvent.type, incomingEvent.data.messageData);
            }
            if (incomingEvent.type === 'draft.currentMessage') {
                setMessageData(incomingEvent.data);
            }
            if (incomingEvent.type === 'draft.updateIndex') {
                let findMessage = (totalMessages || []).findIndex((item: Message) => item.id === incomingEvent.data.draftId);
                setShowEditorToolbar(true);
                if (draftIndex === findMessage) {
                    return;
                }
                setReloadingEditor(true);
                setTimeout(() => {
                    setReloadingEditor(false);
                    if (findMessage !== -1) {
                        setIsContentUpdated(false);
                        setAttachments([]);
                        setDraftIndex(findMessage);
                        draftService.setReplyDraft((totalMessages || [])[findMessage]);
                        globalEventService.fireEvent({data: {force: true}, type: 'richtexteditor.focus'})
                    }
                }, 50)
            }
        }
    }, [getForwardContent, handleEditorScroll, incomingEvent, isDraftUpdated, selectedAccount, totalMessages]);

    function createNewDraft() {
        draftService.setReplyDraft(null);
        setReloadingEditor(true);
        setDraftIndex(null);
        setShowEditorToolbar(true);
        handleEditorScroll();
        setAttachments([]);
        // setEmailBody('');
        sendData[selectedThread?.id + '-' + draftIndex] = '';
        setIsContentUpdated(false);
        setTimeout(() => {
            setReloadingEditor(false);
            globalEventService.fireEvent({data: {}, type: 'richtexteditor.focus'})
        }, 50)
    }

    function createDraft(value: string) {
        let checkValue = getPlainTextFromHtml(value).trim();
        if (!checkValue) {
            return;
        }
        if (!isCreating[selectedThread?.id + '-' + draftIndex]) {
            isCreating[selectedThread?.id + '-' + draftIndex] = true;
            let messageId = '';
            if (messageData && messageData.id) {
                messageId = messageData.id;
            } else if (selectedMessage && selectedMessage.id) {
                messageId = selectedMessage.id;
            }
            let body: any = {
                subject: subject,
                to: emailRecipients.recipients?.items,
                cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
                bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
                // draftInfo: {
                //     // body: emailBody
                // },
                messageId,
                accountId: selectedAccount?.id,
                ...(props.isProjectView ? {projectId: router.query.project as string} : {}),
            }
            dispatch(updatePartialMessage({body: {id: selectedThread?.id + '-' + draftIndex, body: body}}));
        }
    }

    function typeName(type: string) {
        if (type === 'reply-all') {
            return 'Reply All'
        } else if (type === 'forward') {
            return 'Forward'
        } else {
            return 'Reply'
        }
    }

    function updateDraftType(type: string, messageData: any) {
        setReplyType(type);
        if (type === 'forward') {
            if (!isDraftUpdated) {
                setShowReplyBox(true);
                setEmailRecipients({
                    cc: {items: [], value: blankRecipientValue},
                    bcc: {items: [], value: blankRecipientValue},
                    recipients: {items: [], value: blankRecipientValue}
                });
                setSubject(`Fwd: ${messageData.subject}`);
                let decoded = Buffer.from(messageData.rawBody.data || '', 'base64').toString('utf-8');
                let sentence = '';
                if (selectedThread && selectedThread?.projects && selectedThread?.projects?.length) {
                    sentence = getProjectBanner(selectedAccount);
                }
                let content = getForwardContent(messageData) + (decoded || '') + (selectedAccount ? getSignatureBanner(selectedAccount) : '') + (`${sentence}`);
                // setEmailBody(content);
                sendData[selectedThread?.id + '-' + draftIndex] = content;
                globalEventService.fireEvent({
                    type: 'richtexteditor.forceUpdate',
                    data: {body: content, callBack: () => setShowEditorToolbar(true)}
                })
                debounce(() => {
                    globalEventService.blankEvent()
                    handleEditorScroll();
                }, 200)
            }
        }

        if (type === 'reply-all') {
            if (!isDraftUpdated) {
                setSubject(`Re: ${messageData.subject}`);
                if (messageData?.from) {
                    setEmailRecipients((prevState: RecipientsType) => ({
                        ...prevState,
                        recipients: {
                            items: (messageData?.from?.email === selectedAccount?.email) ? messageData?.to! : [messageData?.from!],
                            value: prevState.recipients.value
                        }
                    }));
                }
                let items: MessageRecipient[] = []
                items.push(...messageData?.to!)
                if (messageData?.cc && messageData?.cc.length) {
                    items.push(...messageData?.cc)
                } else if (messageData?.bcc && messageData?.bcc.length) {
                    items.push(...messageData?.bcc)
                }
                const filteredArray = (items || []).filter(obj => obj.email !== '');
                setEmailRecipients((prevState: RecipientsType) => ({
                    ...prevState,
                    cc: {
                        items: filteredArray,
                        value: prevState.cc.value
                    }
                }));

                if (messageData?.bcc?.length) {
                    setEmailRecipients((prevState: RecipientsType) => ({
                        ...prevState,
                        bcc: {
                            items: messageData?.bcc,
                            value: prevState.bcc.value
                        }
                    }));
                }
            }
        }

        if (type === 'reply') {
            if (!isDraftUpdated) {
                setSubject(`Re: ${selectedThread?.subject}`);
                if (messageData?.from) {
                    setEmailRecipients((prevState: RecipientsType) => ({
                        ...prevState,
                        recipients: {
                            items: (messageData?.from?.email === selectedAccount?.email) ? messageData?.to! : [messageData?.from!],
                            value: prevState.recipients.value
                        },
                        cc: {items: [], value: blankRecipientValue},
                        bcc: {items: [], value: blankRecipientValue},
                    }));
                }
            }
        }
    }

    const hideAndShowReplyBox = (type: string = '', messageData: MessageModel | any) => {
        setMessageData(messageData);
        updateDraftType(type, messageData);
    }

    return (
        <Flex backgroundColor={'#FFFFFF'} position={'sticky'} mt={'20px'} bottom={0} boxShadow={'0 21px 0px 0 #fff'}>
            <DropZone onFileUpload={handleFileUpload} forReply={true}>
                <Flex
                    maxHeight={'450px'} direction={'column'} backgroundColor={'#FFFFFF'} width={'100%'}
                    onBlur={() => handleBlur()}>
                    <Flex borderRadius={8} border={'1px solid #F3F4F6'} direction={'column'} paddingX={4} paddingY={2}>
                        {totalDraftMessages.length > 0 &&
                        <Flex align={'center'} justifyContent={'space-between'} pb={2}
                              borderBottom={'1px solid #F3F4F6'}>
                            <Flex gap={2}>
                                <Flex alignItems={'center'} justifyContent={'end'}
                                      className={'member-images subheader-images'}>
                                    {totalDraftMessages.slice(0, 5).map((item: MessageDraft, index: number) => (
                                        <Tooltip label={item?.draftInfo?.createdBy || ''} placement='bottom'
                                                 key={index}>
                                            <div className={'member-photo'}
                                                 style={{background: '#000'}}>
                                                {item?.draftInfo?.createdByAvatarURL &&
                                                <Image src={item?.draftInfo?.createdByAvatarURL} width="24" height="24"
                                                       alt=""/>}
                                            </div>
                                        </Tooltip>
                                    ))}
                                    {totalDraftMessages.slice(5, totalDraftMessages.length - 1).length > 0 &&
                                    <div className={'member-photo'}
                                         style={{background: '#000', border: `1px solid #000`}}>
                                        +{totalDraftMessages.slice(5, totalDraftMessages.length - 1).length}
                                    </div>}
                                </Flex>
                                <Text fontSize={'13px'} color={'#6B7280'}>
                                    Draft
                                </Text>
                            </Flex>
                            {props.isProjectView &&
                            <Button fontSize={'13px'} fontWeight={'500'} border={'1px solid #FFFFFF'}
                                    onClick={() => createNewDraft()}
                                    background={'#F3F4F6'} borderRadius={'34px'} padding={'6px 8px'}
                                    height={'fit-content'}>
                                Create new draft
                            </Button>}
                        </Flex>}
                        <Flex
                            align={'center'} justify={'space-between'} mt={totalDraftMessages.length > 0 ? '5px' : 0}
                            gap={4} position={"relative"}
                            zIndex={isReplyDropdownOpen ? 8 : 6}>
                            <Flex align={'center'} gap={1}>
                                <Menu isOpen={isReplyDropdownOpen} onClose={() => setIsReplyDropdownOpen(false)}>
                                    <MenuButton
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setIsReplyDropdownOpen(true)
                                        }}
                                        color={'#6B7280'} variant='link' size='xs'
                                        as={Button} rightIcon={<ChevronDownIcon/>}
                                    >
                                        {typeName(replyType)}
                                    </MenuButton>
                                    <MenuList className={'drop-down-list reply-dropdown'}>
                                        {replyType === 'reply-all' ?
                                            <MenuItem
                                                onClick={() => hideAndShowReplyBox('reply', selectedMessage)}> Reply</MenuItem> :
                                            <MenuItem
                                                onClick={() => hideAndShowReplyBox('reply-all', selectedMessage)}> Reply
                                                All</MenuItem>
                                        }
                                        {replyType === 'forward' ?
                                            <MenuItem
                                                onClick={() => hideAndShowReplyBox('reply', selectedMessage)}> Reply</MenuItem> :
                                            <MenuItem
                                                onClick={() => {
                                                    hideAndShowReplyBox('forward', selectedMessage)
                                                    handleFocus()
                                                }}> Forward</MenuItem>
                                        }
                                    </MenuList>
                                </Menu>
                                <Flex align={'center'} gap={1}>
                                    {!!emailRecipients?.recipients?.items?.length &&
                                    <Flex fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                                          fontWeight={400}>
                                        {emailRecipients?.recipients?.items[0].email}&nbsp;
                                        <div className={styles.otherMail} style={{cursor: 'pointer'}} onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}>
                                            <Tooltip
                                                closeOnClick={'no'}
                                                placement="bottom"
                                                label={(emailList || []).map((item: any, index: number) => (
                                                    <p key={index}>{item.email}</p>))}>
                                                <Text as='u'>
                                                    {emailRecipients?.recipients?.items?.length - 1 > 0 && `and ${emailRecipients?.recipients?.items?.length - 1} others`}
                                                </Text>
                                            </Tooltip>
                                        </div>
                                    </Flex>
                                    }
                                </Flex>
                                <Button className={styles.editButton} color={'#374151'} backgroundColor={'#F3F4F6'}
                                        borderRadius={'20px'} lineHeight={1} size='xs'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            showRecipientsBox()
                                            if (!showReplyBox) {
                                                handleFocus()
                                            }
                                        }}> {showReplyBox ? 'Close' : 'Edit'} </Button>
                            </Flex>
                            <Flex
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleFocus();
                                    globalEventService.fireEvent({data: null, type: 'richtexteditor.focus'});
                                }}
                                grow={1} justifyContent={'flex-end'}
                            >
                                {/*<Text*/}
                                {/*    as={'h1'} fontSize='11px' color={'#6B7280'} display={'flex'} gap={'2px'}*/}
                                {/*    className={styles.mailSaveTime}>*/}
                                {/*    {(!draft?.updated || !isDraftUpdated) && ''}*/}
                                {/*    {(draft?.updated && isDraftUpdated) &&*/}
                                {/*    <>*/}
                                {/*        Saved <Time time={draft?.updated || ''} isShowFullTime={false}*/}
                                {/*                    showTimeInShortForm={true}/>&nbsp;ago*/}
                                {/*    </>*/}
                                {/*    }*/}
                                {/*</Text>*/}
                            </Flex>
                        </Flex>
                        {showReplyBox &&
                        <div ref={divRef} style={{marginTop: '5px'}}>
                            <Flex width={'100%'} mb={1} flex={'none'} backgroundColor={'#FFFFFF'}
                                  border={'1px solid #E5E7EB'} borderRadius={8} gap={2} padding={'4px 16px'}
                                  className={styles.replyBoxCC}>
                                <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
                                         color={'#374151'}>Subject:</Heading>
                                <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                                    <Input width={'auto'} display='inline-flex' padding={0} height={'20px'}
                                           flex={'1 0 auto'}
                                           fontSize={'12px'} border={0} className={styles.ccInput}
                                           value={subject} onChange={(e) => setSubject(e.target.value)}
                                           placeholder={`Enter Subject`}
                                    />
                                </Flex>
                            </Flex>
                            <MessageRecipients
                                emailRecipients={emailRecipients}
                                updateValues={(values) => {
                                    setIsDraftUpdated(true);
                                    setEmailRecipients({...values})
                                }}
                            />
                        </div>
                        }
                        <Flex
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleFocus()
                            }}
                            direction={'column'} position={"relative"} flex={1} overflow={'none'}>
                            <Flex direction={'column'} maxH={`calc(315px - ${divHeight}px)`} zIndex={6} ref={editorRef}
                                  overflowY={'auto'} className={`editor-bottom-shadow`}
                                  onScroll={() => handleEditorScroll(true)}>
                                {/*onWheel={(event) => {*/}
                                {/*    if (event.deltaX <= 0) {*/}
                                {/*        handleEditorScroll()*/}
                                {/*    }*/}
                                {/*}}*/}
                                <div style={{display: !showEditorToolbar ? 'block' : 'none'}}>
                                    <Input padding={0} height={'fit-content'} border={"none"} cursor={'pointer'}
                                           outline={'none'} boxShadow={'none'} _focusVisible={{boxShadow: 'none'}}
                                           fontSize={'13px'} _placeholder={{color: '#adb5bd'}}
                                           placeholder={'Hit tab to reply with anything you\'d like'}/>
                                </div>
                                {!reloadingEditor &&
                                (selectedThread && draftIndex !== null) && (
                                    // <div style={{display: showEditorToolbar ? 'block' : 'none'}}>
                                        <div className={`${showEditorToolbar ? 'editor-toolbar-show' : ''} editor-toolbar-hide`}>
                                        <CollabRichTextEditor
                                            id={selectedThread.id + '-' + draftIndex}
                                            isAutoFocus={true}
                                            isCompose={false}
                                            // onCreate={() => sendToDraft('')}
                                            content={draft?.draftInfo?.body}
                                            placeholder="Hit tab to reply with anything you'd like"
                                            isToolbarVisible={showEditorToolbar}
                                            onChange={(value) => {
                                                handleEditorScroll();
                                                sendData[selectedThread?.id + '-' + draftIndex] = value;
                                                if (!draft?.id) {
                                                    createDraft(value);
                                                } else {
                                                    draftService.liveUpdateDraft(draft, value);
                                                }
                                                // sendToDraft(value)
                                            }}
                                            className={`${extraClassNames} ${extraClassNamesForBottom}`}
                                            emailSignature={selectedAccount ? getSignatureBanner(selectedAccount) : undefined}
                                            projectShare={selectedThread?.projects?.length ? getProjectBanner(selectedAccount) : undefined}
                                            extendToolbar={(
                                                <>
                                                    <Flex
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            inputFile.current?.click();
                                                            loaderPercentage = 0;
                                                        }}
                                                        align={'center'} justify={'center'} cursor={'pointer'}
                                                        className={styles.attachIcon}
                                                    >
                                                        <Image priority src="/image/icon/attach.svg" alt="emoji"
                                                               width={13}
                                                               height={13}/>
                                                        Attach
                                                        <input type='file' id='file' ref={inputFile}
                                                               onClick={(e) => e.stopPropagation()}
                                                               onChange={(e) => handleFileUpload(e.target.files, e)}
                                                               style={{display: 'none'}}/>
                                                    </Flex>
                                                </>
                                            )}
                                        />
                                    </div>
                                )}

                                {attachments && attachments.length > 0 ? <div style={{marginTop: '20px'}}>
                                    {attachments.map((item, index: number) => (
                                        <Flex align={'center'} key={index} className={styles.attachmentsFile}>
                                            {item.filename}
                                            <Flex ml={'auto'} gap={3} className={'attachments-progress-bar'}>
                                                {(showAttachmentLoader && !item.isUploaded) &&
                                                <ProgressBar loaderPercentage={loaderPercentage}/>}
                                                <div className={styles.closeIcon}
                                                     onClick={() => removeAttachmentData(index)}>
                                                    <CloseIcon/>
                                                </div>
                                            </Flex>
                                        </Flex>
                                    ))}
                                </div> : null}

                            </Flex>
                            <Flex direction={'column'} className={`${styles.composeBox} ${showEditorToolbar ? 'editor-toolbar-show' : ''} editor-toolbar-hide`} width={'fit-content'}
                                  marginLeft={'auto'} mr={'6px'} boxShadow={'none'}>
                                <Flex align={'center'} className={styles.replyButton} position={'relative'} zIndex={6}>
                                    {isDraftCreatedByCurrentUser && (
                                        <Button
                                            className={styles.replyTextDiscardButton}
                                            outline={'none'} boxShadow={'none'} _focusVisible={{boxShadow: 'none'}}
                                            fontSize={14} lineHeight={16} height={'38px'}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                discardMessage(!!draft?.draftInfo?.discardedBy)
                                            }}
                                        > {draft?.draftInfo?.discardedBy ? 'Rescue' : 'Discard'} </Button>
                                    )}
                                    <Flex className={styles.messageSendButton}>
                                        <Button
                                            isDisabled={showAttachmentLoader || (!draft?.id)}
                                            className={styles.replyTextButton}
                                            colorScheme='blue'
                                            fontSize={14} lineHeight={16}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                sendMessages()
                                            }}
                                        >
                                            {scheduledDate ? (
                                                <>Send {dayjs(scheduledDate).from(dayjs())} @ {dayjs(scheduledDate).format('hh:mmA')}</>
                                            ) : (
                                                <>Send</>
                                            )}
                                        </Button>

                                        <MessageSchedule disabled={showAttachmentLoader || (!draft?.id)}
                                                         date={scheduledDate} onChange={handleSchedule}/>
                                    </Flex>
                                </Flex>
                            </Flex>
                            {/*{showEditorToolbar &&*/}
                            {/*<Flex direction={'column'} className={styles.composeBox} width={'fit-content'}*/}
                            {/*      marginLeft={'auto'} mr={'6px'} boxShadow={'none'}>*/}
                            {/*    <Flex align={'center'} className={styles.replyButton} position={'relative'} zIndex={6}>*/}
                            {/*        {isDraftCreatedByCurrentUser && (*/}
                            {/*            <Button*/}
                            {/*                className={styles.replyTextDiscardButton}*/}
                            {/*                outline={'none'} boxShadow={'none'} _focusVisible={{boxShadow: 'none'}}*/}
                            {/*                fontSize={14} lineHeight={16} height={'38px'}*/}
                            {/*                onClick={(e) => {*/}
                            {/*                    e.preventDefault();*/}
                            {/*                    e.stopPropagation();*/}
                            {/*                    discardMessage(!!draft?.draftInfo?.discardedBy)*/}
                            {/*                }}*/}
                            {/*            > {draft?.draftInfo?.discardedBy ? 'Rescue' : 'Discard'} </Button>*/}
                            {/*        )}*/}
                            {/*        <Flex className={styles.messageSendButton}>*/}
                            {/*            <Button*/}
                            {/*                isDisabled={showAttachmentLoader || (!draft?.id)}*/}
                            {/*                className={styles.replyTextButton}*/}
                            {/*                colorScheme='blue'*/}
                            {/*                fontSize={14} lineHeight={16}*/}
                            {/*                onClick={(e) => {*/}
                            {/*                    e.preventDefault();*/}
                            {/*                    e.stopPropagation();*/}
                            {/*                    sendMessages()*/}
                            {/*                }}*/}
                            {/*            >*/}
                            {/*                {scheduledDate ? (*/}
                            {/*                    <>Send {dayjs(scheduledDate).from(dayjs())} @ {dayjs(scheduledDate).format('hh:mmA')}</>*/}
                            {/*                ) : (*/}
                            {/*                    <>Send</>*/}
                            {/*                )}*/}
                            {/*            </Button>*/}

                            {/*            <MessageSchedule disabled={showAttachmentLoader || (!draft?.id)}*/}
                            {/*                             date={scheduledDate} onChange={handleSchedule}/>*/}
                            {/*        </Flex>*/}
                            {/*    </Flex>*/}
                            {/*</Flex>*/}
                            {/*}*/}
                        </Flex>
                    </Flex>
                </Flex>
            </DropZone>
        </Flex>
    )
}
