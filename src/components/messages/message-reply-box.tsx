import {
    Button,
    Flex,
    Menu,
    MenuButton, MenuItem,
    MenuList,
    Text
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import Image from "next/image";
import {ChevronDownIcon, CloseIcon} from "@chakra-ui/icons";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {debounce, getProjectBanner, getSignatureBanner, makeCollabId} from "@/utils/common.functions";
import {DropZone} from "@/components/common";
import {createDraft, updateDraftState, updatePartialMessage} from "@/redux/draft/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {Message, MessageAttachments, MessageDraft, MessageRecipient} from "@/models";
import {deleteMessage, removeAttachment, uploadAttachment} from "@/redux/messages/action-reducer";
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
const Time = dynamic(() => import("@/components/common").then(mod => mod.Time));


dayjs.extend(relativeTime)

const blankRecipientValue: MessageRecipient = {
    name: '',
    email: ''
}

let loaderPercentage = 10;
let isInitialSet = true;

export function MessageReplyBox(props: MessageBoxType) {
    const [emailRecipients, setEmailRecipients] = useState<RecipientsType | any>({
        cc: {items: [], value: blankRecipientValue},
        bcc: {items: [], value: blankRecipientValue},
        recipients: {items: [], value: blankRecipientValue},
    })
    const [subject, setSubject] = useState<string>('');
    const [emailBody, setEmailBody] = useState<string>('');
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {draft} = useSelector((state: StateType) => state.draft);
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
    const [waitForDraft, setWaitForDraft] = useState<boolean>(false);
    const [collabId, setCollabId] = useState<string | undefined>(undefined)
    const [isDraftUpdated, setIsDraftUpdated] = useState<boolean>(false);
    const [isContentUpdated, setIsContentUpdated] = useState<boolean>(false);
    const [messageData, setMessageData] = useState<any>(null);
    const [replyType, setReplyType] = useState<string>('reply');

    const editorRef = useRef<any>(null);
    const router = useRouter();
    const divRef = useRef<HTMLDivElement | null>(null);
    const [divHeight, setDivHeight] = useState<number>(0);
    const [emailList, setEmailList] = useState<any>([]);

    useEffect(() => {
        if (!collabId) {
            const draftMessage = (selectedThread?.messages || []).findLast((msg: Message) => (msg.mailboxes || []).includes('DRAFT'));
            let newCollabId = makeCollabId(10);
            if (draftMessage) {
                if (draftMessage.draftInfo?.collabId) {
                    newCollabId = draftMessage.draftInfo?.collabId;
                }
            }
            dispatch(updateDraftState({
                draft: {
                    ...draft,
                    draftInfo: {
                        ...draft?.draftInfo,
                        collabId: newCollabId
                    }
                }
            }))

            setCollabId(newCollabId)
        }
    }, [dispatch, collabId, selectedThread])

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
        if (isInitialSet) {
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
            setEmailBody(value);
        }

        let body: any = {
            subject: subject,
            to: emailRecipients.recipients?.items,
            cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
            bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
            draftInfo: {
                body: value || emailBody,
                collabId
            },
            messageId: messageData?.id,
            ...(props.isProjectView ? {projectId: router.query.project as string} : {}),
        }
        debounce(() => {
            if (selectedAccount && selectedAccount.id) {
                if (waitForDraft) {
                    return;
                }
                if (!showEditorToolbar) {
                    return;
                }
                if (draft && draft.id) {
                    dispatch(updatePartialMessage({body: {id: draft.id, body: body}}));
                } else {
                    setWaitForDraft(true);
                    dispatch(createDraft({body: {accountId: selectedAccount.id, body: body}}));
                }
            }
        }, 250);
    }

    useEffect(() => {
        if (waitForDraft && draft && draft.id) {
            setWaitForDraft(false);
            sendToDraft('', false);
        }
    }, [waitForDraft, draft])

    useEffect(() => {
        // Add signature and draft to email body
        if (draft && draft.id && !isContentUpdated) {
            setIsContentUpdated(true);
            const {subject, to, cc, bcc, draftInfo} = draft;
            if (subject) {
                setSubject(subject)
            }
            if (draftInfo && draftInfo.collabId) {
                setCollabId(draftInfo.collabId);
            }
            if (draftInfo && draftInfo.body) {
                let checkValue = getPlainTextFromHtml(draftInfo.body).trim();
                if (checkValue.trim()) {
                    setIsDraftUpdated(true)
                    setTimeout(() => {
                        globalEventService.fireEvent({
                            data: {body: draftInfo?.body || '', callBack: () => setShowEditorToolbar(true)},
                            type: 'richtexteditor.forceUpdateWithOnChange'
                        });
                    }, 500);
                }
                setEmailBody(draftInfo?.body || '');
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
            setTimeout(() => {
                isInitialSet = false;
            }, 500)
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
                const filteredArray = (items || []).filter(obj => obj.email !== '');
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
                        setWaitForDraft(true);
                        let body: any = {
                            subject: subject,
                            to: emailRecipients.recipients?.items,
                            cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
                            bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
                            draftInfo: {
                                body: emailBody,
                                collabId
                            },
                            messageId: messageData?.id,
                            ...(props.isProjectView ? {projectId: router.query.project as string} : {}),
                        }
                        dispatch(createDraft({
                            body: {accountId: selectedAccount?.id, body: body},
                            afterSuccessAction: (draft: any) => {
                                draftService.setReplyDraft(draft);
                                if (loaderPercentage < 100) {
                                    loaderPercentage += 20;
                                }
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
                    dispatch(updatePartialMessage({body: {id: draft.id}}));
                }
            }))
        }
    }

    const discardMessage = () => {
        setIsReplyDropdownOpen(false)
        setShowReplyBox(false);
        setShowEditorToolbar(false)
        globalEventService.fireEvent({data: '', type: 'richtexteditor.discard'});
        handleEditorScroll();
        if (draft && draft.id) {
            draftService.setReplyDraft(null);
            setAttachments([]);
            draftService.discardDraft(draft.id!);
            dispatch(deleteMessage({
                body: {id: draft.id},
                afterSuccessAction: () => {
                    setIsDraftUpdated(false);
                }
            }));
        }
    }

    const sendMessages = () => {
        if (draft && draft.id) {
            if (showAttachmentLoader) {
                return;
            }
            setShowReplyBox(false);
            let body: any = {
                subject: subject,
                to: emailRecipients.recipients?.items,
                cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
                bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
                draftInfo: {
                    body: emailBody,
                    collabId
                },
                messageId: messageData?.id,
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
            setEmailBody('');
            setAttachments([]);
            setIsContentUpdated(false);
            setIsDraftUpdated(false);
            globalEventService.fireEvent({data: {body: ''}, type: 'richtexteditor.forceUpdate'});
        }
    }


    const handleBlur = () => {
        // setTimeout(() => {
        //   setShowEditorToolbar(false)
        // }, 500)
    }

    const initialValuesChanges = () => {
        const draftMessage = (selectedThread?.messages || []).findLast((msg: Message) => (msg.mailboxes || []).includes('DRAFT'));
        if (draftMessage) {
            if (!draft?.id) {
                isInitialSet = true;
                setTimeout(() => {
                    isInitialSet = false;
                }, 500)
                if (!getPlainTextFromHtml(draftMessage.draftInfo?.body || '').trim()) {
                    setTimeout(() => {
                        globalEventService.fireEvent({data: {body: getBody(), callBack: () => {
                                setShowEditorToolbar(true);
                            }
                        }, type: 'richtexteditor.forceUpdateInitial'})
                    }, 10)
                }
                draftService.setReplyDraft(draftMessage as MessageDraft);
                setIsContentUpdated(false);
            }
        } else {
            if (!draft?.id) {
                isInitialSet = true;
                setTimeout(() => {
                    isInitialSet = false;
                }, 500)
                draftService.setReplyDraft({...draft, draftInfo: {...(draft?.draftInfo || {}), body: getBody()}});
                setTimeout(() => {
                    globalEventService.fireEvent({data: {body: getBody(), callBack: () => {
                                setShowEditorToolbar(true);
                            }
                        }, type: 'richtexteditor.forceUpdateInitial'})
                }, 10)


            }
        }
    }

    const handleFocus = () => {
        globalEventService.fireEvent('iframe.clicked');
    }

    const getBody = () => {
        let body = '';
        if (selectedAccount) {
            body += getSignatureBanner(selectedAccount);
            // ${selectedThread?.projects && selectedThread.projects.length === 1 ? `<!--<p style="font-size: 13px; margin-right: 3px;">at </p><p style="font-size: 13px; text-decoration: underline; margin-right: 3px;">${selectedThread.projects[0].name}</p>-->` : `<p style="font-size: 13px; text-decoration: underline; margin-right: 3px;">others</p>`}
            if (selectedThread?.projects?.length) {
                body += getProjectBanner(selectedAccount);
            }
        }
        return body;
    }

    const showRecipientsBox = () => {
        setShowReplyBox((current) => !current);
    }

    const handleSchedule = (date: string | undefined) => {
        setScheduledDate(date);
    }

    const handleEditorScroll = useCallback(() => {
        if (editorRef.current && editorRef.current.scrollTop > 0) {
            setExtraClassNames(prevState => !prevState.includes('show-shadow') ? prevState + ' show-shadow' : prevState);
        } else {
            setExtraClassNames(prevState => prevState.replace('show-shadow', ''));
        }

        const container = editorRef.current;
        if (container) {
            const scrollHeight = container?.scrollHeight;
            const containerHeight = container?.clientHeight;
            const scrollBottom = scrollHeight - containerHeight - editorRef.current.scrollTop;
            if (scrollBottom > 3) {
                setExtraClassNamesForBottom(prevState => !prevState.includes('show-shadow-bottom') ? prevState + ' show-shadow-bottom' : prevState);
            } else {
                setExtraClassNamesForBottom(prevState => prevState.replace('show-shadow-bottom', ''));
            }
        }
    }, [])

    useEffect(() => {
        handleEditorScroll();
    }, [handleEditorScroll]);

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsReplyDropdownOpen(false)
        }
        if (incomingEvent === 'draft.undo') {
            initialValuesChanges();
            handleFocus();
        }
        if (typeof incomingEvent === 'object' && incomingEvent.type) {
            if (incomingEvent.type === 'draft.updateType') {
                setReplyType(incomingEvent.data.type);
                if (incomingEvent.data.type === 'forward') {
                    if (!isDraftUpdated) {
                        setShowReplyBox(true);
                        setEmailRecipients({
                            cc: {items: [], value: blankRecipientValue},
                            bcc: {items: [], value: blankRecipientValue},
                            recipients: {items: [], value: blankRecipientValue}
                        });
                        setSubject(`Fwd: ${incomingEvent.data.messageData.subject}`);
                        let decoded = Buffer.from(incomingEvent.data.messageData.body.data || '', 'base64').toString('utf-8');
                        let sentence = '';
                        if (selectedThread && selectedThread?.projects && selectedThread?.projects?.length) {
                            sentence = getProjectBanner(selectedAccount);
                        }
                        let content = getForwardContent(incomingEvent.data.messageData) + (decoded || '') + (selectedAccount ? getSignatureBanner(selectedAccount) : '') + (`${sentence}`);
                        setEmailBody(content);
                        globalEventService.fireEvent({type: 'richtexteditor.forceUpdate', data: {body: content, callBack: () => setShowEditorToolbar(true)}})
                        debounce(() => {
                            handleEditorScroll();
                        }, 200)
                    }
                }

                if (incomingEvent.data.type === 'reply-all') {
                    if (!isDraftUpdated) {
                        if (incomingEvent.data.messageData?.from) {
                            setEmailRecipients((prevState: RecipientsType) => ({
                                ...prevState,
                                recipients: {
                                    items: (incomingEvent.data.messageData?.from?.email === selectedAccount?.email && replyType === 'reply') ? incomingEvent.data.messageData?.to! : [incomingEvent.data.messageData?.from!],
                                    value: prevState.recipients.value
                                }
                            }));
                        }
                        if (incomingEvent.data.messageData?.cc?.length) {
                            let items: MessageRecipient[] = []
                            if (replyType === 'reply-all') {
                                items.push(incomingEvent.data.messageData?.from!)
                                if (incomingEvent.data.messageData?.cc && incomingEvent.data.messageData?.cc.length) {
                                    items.push(...incomingEvent.data.messageData?.cc)
                                } else if (incomingEvent.data.messageData?.bcc && incomingEvent.data.messageData?.bcc.length) {
                                    items.push(...incomingEvent.data.messageData?.bcc)
                                }
                            }
                            const filteredArray = (items || []).filter(obj => obj.email !== '');
                            setEmailRecipients((prevState: RecipientsType) => ({
                                ...prevState,
                                cc: {
                                    items: filteredArray,
                                    value: prevState.cc.value
                                }
                            }));
                        }

                        if (incomingEvent.data.messageData?.bcc?.length) {
                            setEmailRecipients((prevState: RecipientsType) => ({
                                ...prevState,
                                bcc: {
                                    items: incomingEvent.data.messageData?.bcc,
                                    value: prevState.bcc.value
                                }
                            }));
                        }
                    }
                }
            }
            if (incomingEvent.type === 'draft.currentMessage') {
                setMessageData(incomingEvent.data);
            }
        }
    }, [getForwardContent, handleEditorScroll, incomingEvent, isDraftUpdated, selectedAccount, selectedThread]);

    return (
        <Flex backgroundColor={'#FFFFFF'} position={'sticky'} mt={'20px'} bottom={0} boxShadow={'0 21px 0px 0 #fff'}>
            <Flex
                maxHeight={'450px'} direction={'column'} backgroundColor={'#FFFFFF'} width={'100%'}
                onBlur={() => handleBlur()}>
                <Flex borderRadius={8} gap={4} border={'1px solid #F3F4F6'} direction={'column'} padding={4}>
                    <Flex
                        align={'center'} justify={'space-between'} gap={4} position={"relative"}
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
                                    {props.replyTypeName || 'Reply'}
                                </MenuButton>
                                <MenuList className={'drop-down-list reply-dropdown'}>
                                    {replyType === 'reply-all' ?
                                        <MenuItem
                                            onClick={() => props.hideAndShowReplyBox ? props.hideAndShowReplyBox('reply', selectedMessage) : null}> Reply</MenuItem> :
                                        <MenuItem
                                            onClick={() => props.hideAndShowReplyBox ? props.hideAndShowReplyBox('reply-all', selectedMessage) : null}> Reply
                                            All</MenuItem>
                                    }
                                    {replyType === 'forward' ?
                                        <MenuItem
                                            onClick={() => props.hideAndShowReplyBox ? props.hideAndShowReplyBox('reply', selectedMessage) : null}> Reply</MenuItem> :
                                        <MenuItem
                                            onClick={() => {
                                                if (props.hideAndShowReplyBox) {
                                                    props.hideAndShowReplyBox('forward', selectedMessage)
                                                    handleFocus()
                                                }
                                            }}> Forward</MenuItem>
                                    }
                                </MenuList>
                            </Menu>
                            <Flex align={'center'} gap={1}>
                                {!!emailRecipients?.recipients?.items?.length &&
                                <Flex fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                                      fontWeight={400}>
                                    {emailRecipients?.recipients?.items[0].email}&nbsp;
                                    <div className={styles.otherMail} style={{cursor: 'pointer'}}>
                                        <Tooltip
                                            placement="bottom"
                                            label={(emailList || []).map((item: any, index: number) => (<p key={index}>{item.email}</p>))}>
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
                            onClick={() => {
                                handleFocus();
                                globalEventService.fireEvent({data: null, type: 'richtexteditor.focus'});
                            }}
                            onFocus={() => handleFocus()}
                            grow={1} justifyContent={'flex-end'}
                        >
                            <Text
                                as={'h1'} fontSize='11px' color={'#6B7280'} display={'flex'} gap={'2px'}
                                className={styles.mailSaveTime}>
                                {(!draft?.updated || !isDraftUpdated) && 'Not Saved'}
                                {(draft?.updated && isDraftUpdated) &&
                                <>
                                    Saved <Time time={draft?.updated || ''} isShowFullTime={false}
                                                showTimeInShortForm={true}/>&nbsp;ago
                                </>
                                }
                            </Text>
                        </Flex>
                    </Flex>
                    <DropZone onFileUpload={handleFileUpload} forReply={true}>
                        {showReplyBox &&
                        <div ref={divRef}>
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
                            onFocus={() => handleFocus()}
                            direction={'column'} position={"relative"} flex={1} overflow={'none'}>
                            <Flex direction={'column'} maxH={`calc(315px - ${divHeight}px)`} zIndex={6} ref={editorRef}
                                  overflowY={'auto'} className={`editor-bottom-shadow`}
                                  onScroll={() => handleEditorScroll()}>
                                {(selectedThread && collabId) && (
                                    <CollabRichTextEditor
                                        id={'thread-' + collabId}
                                        onCreate={() => sendToDraft('')}
                                        placeholder="Hit enter to reply with anything you'd like"
                                        isToolbarVisible={showEditorToolbar}
                                        onChange={(value) => sendToDraft(value)}
                                        className={`${extraClassNames} ${extraClassNamesForBottom}`}
                                        onFocus={() => initialValuesChanges()}
                                        emailSignature={selectedAccount ? getSignatureBanner(selectedAccount) : undefined}
                                        projectShare={selectedThread?.projects?.length ? getProjectBanner(selectedAccount) : undefined}
                                        extendToolbar={(
                                            <>
                                                <Flex
                                                    onClick={() => {
                                                        inputFile.current?.click();
                                                        loaderPercentage = 0;
                                                    }}
                                                    align={'center'} justify={'center'} cursor={'pointer'}
                                                    className={styles.attachIcon}
                                                >
                                                    <Image priority src="/image/icon/attach.svg" alt="emoji" width={13}
                                                           height={13}/>
                                                    Attach
                                                    <input type='file' id='file' ref={inputFile}
                                                           onChange={(e) => handleFileUpload(e.target.files, e)}
                                                           style={{display: 'none'}}/>
                                                </Flex>
                                            </>
                                        )}
                                    />
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
                            {showEditorToolbar &&
                            <Flex direction={'column'} className={styles.composeBox} width={'fit-content'}
                                  marginLeft={'auto'} mr={'6px'}>
                                <Flex align={'center'} className={styles.replyButton} position={'relative'} zIndex={6}>
                                    <Button
                                        className={styles.replyTextDiscardButton}
                                        fontSize={14} lineHeight={16} height={'38px'}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            discardMessage()
                                        }}
                                    > Discard </Button>
                                    <Flex className={styles.messageSendButton}>
                                        <Button
                                            isDisabled={showAttachmentLoader}
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

                                        <MessageSchedule date={scheduledDate} onChange={handleSchedule}/>
                                    </Flex>
                                </Flex>
                            </Flex>
                            }
                        </Flex>
                    </DropZone>
                </Flex>
            </Flex>
        </Flex>
    )
}
