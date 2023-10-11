import {
    Box,
    Button, createStandaloneToast,
    Flex, Heading, Input,
    Modal,
    ModalBody,
    ModalContent, ModalFooter,
    ModalOverlay,
    Text, useDisclosure
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {CloseIcon} from "@chakra-ui/icons";
import React, {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import {StateType} from "@/types";
import {debounce, generateToasterId, isEmail, makeCollabId} from "@/utils/common.functions";
import {createDraft, sendMessage, updatePartialMessage} from "@/redux/draft/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import dayjs from "dayjs";
import {deleteMessage, removeAttachment, uploadAttachment} from "@/redux/messages/action-reducer";
import {MessageAttachments, MessageRecipient, Thread} from "@/models";
import {DropZone, Toaster} from "@/components/common";
import {RecipientsType} from "@/types/props-types/message-recipients.type";
import dynamic from "next/dynamic";
import {updateCommonState} from "@/redux/common-apis/action-reducer";
import {updateThreadState} from "@/redux/threads/action-reducer";
import {useRouter} from "next/router";
import {fireEvent} from "@/redux/global-events/action-reducer";
import CollabRichTextEditor from "../common/collab-rich-text-editor";
import Image from "next/image";
import {getPlainTextFromHtml} from "@/utils/editor-common-functions";
import {commonService, draftService, globalEventService, threadService} from "@/services";
import {getCacheMessages, setCacheMessages} from "@/utils/cache.functions";

const CreateNewProject = dynamic(() => import('@/components/project/create-new-project').then(mod => mod.default));
const Time = dynamic(() => import("@/components/common").then(mod => mod.Time));
const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
const MessageRecipients = dynamic(() => import("../messages/message-recipients").then(mod => mod.default));
const MessageSchedule = dynamic(() => import("../messages/message-schedule").then(mod => mod.default));

const blankRecipientValue: MessageRecipient = {
    name: '',
    email: ''
}

export function ComposeBox(props: any) {
    const [emailRecipients, setEmailRecipients] = useState<RecipientsType>({
        cc: {
            items: [],
            value: blankRecipientValue
        },
        bcc: {
            items: [],
            value: blankRecipientValue
        },
        recipients: {
            items: [],
            value: blankRecipientValue
        },
    })
    const [subject, setSubject] = useState<string>('');
    const [emailBody, setEmailBody] = useState<string>('');
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {composeDraft} = useSelector((state: StateType) => state.draft);
    const {tabValue, threads, selectedThread} = useSelector((state: StateType) => state.threads);
    const dispatch = useDispatch();
    const {onClose} = useDisclosure();
    const {isOpen: isOpenProject, onOpen: onOpenProject, onClose: onCloseProject} = useDisclosure();
    const {
        isOpen: isDraftConformationModal,
        onOpen: onOpenDraftConformationModal,
        onClose: onCloseDraftConformationModal
    } = useDisclosure();
    const [scheduledDate, setScheduledDate] = useState<string>();
    const [attachments, setAttachments] = useState<MessageAttachments[]>([]);
    const [extraClassNames, setExtraClassNames] = useState<string>('');
    const [extraClassNamesForBottom, setExtraClassNamesForBottom] = useState<string>('');
    const inputFile = useRef<HTMLInputElement | null>(null);
    const editorRef = useRef<any>(null);
    const {toast} = createStandaloneToast();
    const [isDraftUpdated, setIsDraftUpdated] = useState<boolean>(false);
    const [waitForDraft, setWaitForDraft] = useState<boolean>(false);
    const router = useRouter();
    const [collabId, setCollabId] = useState<string | undefined>(composeDraft?.draftInfo?.collabId);
    const [isContentSet, setIsContentSet] = useState<boolean>(false);

    useEffect(() => {
        if (!collabId) {
            const newCollabId = makeCollabId(10)
            draftService.setComposeDraft({
                ...composeDraft,
                draftInfo: {
                    ...composeDraft?.draftInfo,
                    collabId: newCollabId
                }
            });
            setCollabId(newCollabId)
        }
    }, [collabId])

    useEffect(() => {
        if (composeDraft && composeDraft.id && !isContentSet) {
            const {subject, to, cc, bcc, draftInfo} = composeDraft;
            if (subject) {
                setSubject(subject)
            }
            if (to && to.length) {
                setEmailRecipients((prevState) => ({
                    ...prevState,
                    recipients: {
                        items: to,
                        value: blankRecipientValue
                    }
                }));
            }
            if (cc && cc.length) {
                setEmailRecipients((prevState) => ({
                    ...prevState,
                    cc: {
                        items: cc,
                        value: blankRecipientValue
                    }
                }));
            }
            if (bcc && bcc.length) {
                setEmailRecipients((prevState) => ({
                    ...prevState,
                    bcc: {
                        items: bcc,
                        value: blankRecipientValue
                    }
                }));
            }


            if (draftInfo && draftInfo.body) {
                let checkValue = getPlainTextFromHtml(draftInfo.body).trim();
                if (checkValue.trim()) {
                    setIsDraftUpdated(true)
                }
                globalEventService.fireEvent({data: draftInfo.body, type: 'richtexteditor.forceUpdateWithOnChange'});
                setEmailBody(draftInfo.body);
            }

            if (draftInfo && draftInfo.attachments && draftInfo.attachments.length > 0) {
                setAttachments([
                    ...draftInfo.attachments.map(t => ({
                        filename: t.filename,
                        mimeType: t.mimeType
                    }))
                ]);
            }
            setIsContentSet(true);
            setIsDraftUpdated(true);
            if (props.isProjectView) {
                draftService.addComposeToProject()
            }
        }
    }, [composeDraft, isContentSet, props.isProjectView])

    const isValid = (email: string, type: string) => {
        let error = null;
        if ((emailRecipients[type as keyof RecipientsType].items || []).map(r => r.email).includes(email)) {
            error = `This email has already been added.`;
        }

        if (!isEmail(email)) {
            error = `This email has not been valid.`;
        }

        if (error) {
            let validationError = {
                desc: error,
                title: 'Email validation error',
                type: 'error'
            }
            Toaster(validationError)
            return false;
        }

        return true;
    }
    const handleChange = (evt: ChangeEvent | any, type: string) => {
        if (evt.target.value) {
            setIsDraftUpdated(true)
        }
        setEmailRecipients((prevState) => ({
            ...prevState,
            [type as keyof RecipientsType]: {
                items: [...(prevState[type as keyof RecipientsType].items || [])],
                value: {
                    name: '',
                    email: evt.target.value
                }
            }
        }));
    };

    useEffect(() => {
        if (waitForDraft && composeDraft && composeDraft.id) {
            setWaitForDraft(false);
            sendToDraft('', false);
        }
    }, [waitForDraft, composeDraft])

    const handleAutoCompleteSelect = (value: any, type: string) => {
        if (value.email && isValid(value.email, type)) {
            setEmailRecipients((prevState: RecipientsType) => ({
                ...prevState,
                [type as keyof RecipientsType]: {
                    items: [...prevState[type as keyof RecipientsType].items, {
                        name: value.name,
                        email: value.email
                    }],
                    value: blankRecipientValue
                }
            }));
        }
    };

    const handlePaste = (evt: ClipboardEvent | any, type: string) => {
        evt.preventDefault();

        let paste = evt.clipboardData.getData("text");
        let emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g);

        if (emails) {
            let toBeAdded = emails.filter((item: string) => !emailRecipients[type as keyof RecipientsType].items.map(r => r.email).includes(item));
            setEmailRecipients((prevState) => ({
                ...prevState,
                [type as keyof RecipientsType]: {
                    items: [...prevState[type as keyof RecipientsType].items, ...toBeAdded],
                    value: blankRecipientValue
                }
            }));
        }
    };


    const handleKeyDown = (evt: KeyboardEvent | any, type: string) => {
        if (["Enter", "Tab"].includes(evt.key)) {
            evt.preventDefault();
            let value = emailRecipients[type as keyof RecipientsType].value.email.trim();

            let emailArray = value.split(',');
            !!emailArray.length && emailArray.map((email: string) => {
                if (email && isValid(email, type)) {
                    setEmailRecipients((prevState) => ({
                        ...prevState,
                        [type as keyof RecipientsType]: {
                            items: [...prevState[type as keyof RecipientsType].items, {
                                name: '',
                                email: email
                            }],
                            value: blankRecipientValue
                        }
                    }));
                }
            })
        }
    };


    const handleItemDelete = (item: string, type: string) => {
        setEmailRecipients((prevState) => ({
            ...prevState,
            [type as keyof RecipientsType]: {
                items: prevState[type as keyof RecipientsType].items.map(i => i.email).filter(i => i !== item),
                value: blankRecipientValue
            }
        }));
    };

    const addSubject = (event: ChangeEvent | any) => {
        if (event.target.value) {
            setIsDraftUpdated(true)
        }
        setSubject(event.target.value || '');
    }

    const validateDraft = (value: string) => {
        return !!(subject || getPlainTextFromHtml(value).trim() || emailRecipients.recipients.items.length > 0 || emailRecipients.cc.items.length > 0 || emailRecipients.bcc.items.length > 0);
    }

    const sendToDraft = (value: string, isValueUpdate: boolean = true) => {
        if (!validateDraft(value)) {
            return;
        }
        let checkValue = getPlainTextFromHtml(value).trim();
        if (checkValue.trim()) {
            setIsDraftUpdated(true)
        }
        if (isValueUpdate) {
            if (!checkValue.trim()) {
                setExtraClassNames(prevState => prevState.replace('show-shadow', ''));
                setExtraClassNamesForBottom(prevState => prevState.replace('show-shadow-bottom', ''));
            }
            setEmailBody(value);
        }

        const collaborationId = collabId ? collabId : makeCollabId(10);
        let body = {
            subject: subject,
            to: emailRecipients.recipients?.items,
            cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
            bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
            draftInfo: {
                collabId: collaborationId,
                body: checkValue ? value : emailBody
            },
            messageId: props.messageData?.id,
            ...(props.isProjectView ? {projectId: router.query.project as string} : {}),
        }

        debounce(() => {
            if (selectedAccount && selectedAccount.id) {
                if (waitForDraft) {
                    return;
                }
                if (composeDraft && composeDraft.id) {
                    dispatch(updatePartialMessage({body: {id: composeDraft.id, body: body, fromCompose: true}}));
                } else {
                    setWaitForDraft(true);
                    setCollabId(collaborationId)
                    dispatch(createDraft({body: {accountId: selectedAccount.id, body: body, fromCompose: true}}));
                }
            }
        }, 250);
    }

    const sendMessages = () => {
        if (composeDraft && composeDraft.id) {
            draftService.backupComposeDraftForUndo();
            let params = {};
            let polyToast = generateToasterId();

            if (scheduledDate) {
                const targetDate = dayjs(scheduledDate)
                // Get the current date and time
                const currentDate = dayjs();
                const secondsDifference = targetDate.diff(currentDate, 'second');
                params = {
                    delay: secondsDifference
                }


                dispatch(sendMessage({body: {id: composeDraft.id, ...params}}));

                Toaster({
                    desc: `Your message has been scheduled`,
                    type: 'send_confirmation',
                    title: 'Your message has been scheduled',
                    id: polyToast,
                    undoClick: (type: string) => {
                        let params = {};

                        if (type === 'undo') {
                            params = {
                                undo: true
                            }
                            commonService.toggleComposing(true);
                            draftService.restoreBackupComposeDraft();
                            setIsContentSet(false);
                        } else if (type === 'send-now') {
                            params = {
                                now: true
                            }
                        }
                        dispatch(sendMessage({body: {id: composeDraft.id!, ...params}}));
                        toast.close(`${polyToast}`);
                    }
                })

            } else {
                if (composeDraft && composeDraft.to && composeDraft.to.length) {
                    Toaster({
                        desc: `Your message has been sent to ${composeDraft?.to && composeDraft?.to[0].email}${composeDraft?.to && composeDraft?.to?.length > 1 ? ` and ${composeDraft?.to && composeDraft?.to?.length - 1} other${composeDraft?.to && composeDraft?.to?.length === 2 ? '' : 's'}` : ''}`,
                        type: 'send_confirmation',
                        title: composeDraft?.subject || '',
                        id: polyToast,
                        undoClick: (type: string) => {
                            let params = {};

                            if (type === 'undo') {
                                params = {
                                    undo: true
                                }
                                commonService.toggleComposing(true);
                                draftService.restoreBackupComposeDraft();
                                setIsContentSet(false);
                            } else if (type === 'send-now') {
                                params = {
                                    now: true
                                }
                            }
                            dispatch(sendMessage({body: {id: composeDraft.id!, ...params}}));
                            toast.close(`${polyToast}`);
                        }
                    })
                }
            }
            changeThreadData();
            dispatch(sendMessage({body: {id: composeDraft.id!, ...params}}));
            onClose();

            if (props.onClose) {
                props.onClose();
            }

            setEmailRecipients({
                cc: {
                    items: [],
                    value: blankRecipientValue
                },
                bcc: {
                    items: [],
                    value: blankRecipientValue
                },
                recipients: {
                    items: [],
                    value: blankRecipientValue
                }
            });
            setEmailBody('');
            setSubject('');

            if (props.tabValue === 'DRAFT') {
                (threads || []).map((item: Thread) => {
                    if (item.id === composeDraft.threadId) {
                        const newThreadArray = (threads || []).filter(obj => obj.id !== composeDraft.threadId);
                        dispatch(updateThreadState({threads: newThreadArray, selectedThread: newThreadArray[0]}));
                        dispatch(updateCommonState({isComposing: true}));
                    }
                })
            } else {
                dispatch(updateCommonState({isComposing: false, allowThreadSelection: true}));
            }

            draftService.setComposeDraft(null);
            draftService.setResumeDraft(null);
        }
    }

    useEffect(() => {
        if (selectedAccount && selectedAccount.signature) {
            let sentence = '';
            if (selectedThread?.projects && selectedThread?.projects?.length) {
                sentence = `<p style="padding: 5px 10px !important; background-color: #EBF83E; display: block; width: fit-content; border-radius: 4px; color: #0A101D; font-weight: 500; line-height: 1;">${selectedAccount?.name || ''} is sharing this email thread (and future replies) with others ${selectedThread?.projects && selectedThread.projects.length === 1 ? `at ${selectedThread.projects[0].name} on Polymail` : 'on Polymail'}</p>`;
            }

            setEmailBody(`<p></p><p>${selectedAccount.signature}</p><p></p>${sentence}`);
        }
    }, [selectedAccount, props.isOpen, selectedThread])


    const handleSchedule = (date: string | undefined) => {
        setScheduledDate(date);
    }

    useEffect(() => {
        const propertiesToCheck: (keyof RecipientsType)[] = ['recipients', 'bcc', 'cc'];
        let allValues: MessageRecipient[] = [];
        // add message to draft when user add cc, bcc, recipients and subject
        for (const property of propertiesToCheck) {
            if (emailRecipients && emailRecipients[property] && emailRecipients[property].items) {
                allValues = [...allValues, ...emailRecipients[property].items];
            }
        }
        if ((allValues.length > 0 && emailRecipients && emailRecipients['recipients'] && emailRecipients['recipients'].items.length > 0) || subject) {
            sendToDraft('', false);
        }
    }, [emailRecipients.recipients.items, emailRecipients.cc.items, emailRecipients.bcc.items, subject]);

    useEffect(() => {
        if (composeDraft && composeDraft.id) {
            draftService.setResumeDraft(composeDraft);
            let cacheMessages = getCacheMessages();
            setCacheMessages({
                ...cacheMessages,
                [composeDraft.id!]: {
                    ...cacheMessages[composeDraft.id!],
                    data: Buffer.from(composeDraft?.draftInfo!.body || '').toString('base64'),
                    attachments: composeDraft?.draftInfo?.attachments || []
                }
            })
        }
    }, [composeDraft])


    function handleFileUpload(files: any, event: any) {
        const file = files[0];
        if (composeDraft && composeDraft.id) {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {


                if (reader.result) {
                    setAttachments([
                        ...(attachments || []),
                        {
                            filename: file.name,
                            mimeType: file.type
                        }
                    ]);
                    dispatch(uploadAttachment({
                        body: {id: composeDraft.id, file: file},
                        afterSuccessAction: () => {
                            dispatch(updatePartialMessage({body: {id: composeDraft.id, fromCompose: true}}));
                        }
                    }));
                }
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        }
    }

    function removeAttachmentsData(index: number) {
        const newArr = [...attachments];
        (newArr || []).splice(index, 1);
        setAttachments([...newArr!]);
        if (composeDraft && composeDraft.id && composeDraft.draftInfo?.attachments && composeDraft.draftInfo?.attachments[index] && composeDraft.draftInfo?.attachments[index].id) {
            dispatch(removeAttachment({
                body: {id: composeDraft.id!, attachment: composeDraft.draftInfo?.attachments[index].id!},
                afterSuccessAction: () => {
                    dispatch(updatePartialMessage({body: {id: composeDraft.id, fromCompose: true}}));
                }
            }))
        }
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
            if (scrollBottom > 1) {
                setExtraClassNamesForBottom(prevState => !prevState.includes('show-shadow-bottom') ? prevState + ' show-shadow-bottom' : prevState);
            } else {
                setExtraClassNamesForBottom(prevState => prevState.replace('show-shadow-bottom', ''));
            }
        }

    }, []);

    const onCloseClick = () => {
        if (!isDraftUpdated) {
            performUpdate();
        } else {
            onOpenDraftConformationModal()
        }
    }

    function performUpdate() {
        commonService.toggleComposingWithThreadSelection(false, tabValue !== 'DRAFT');
        draftService.setComposeDraft(null);
        draftService.setResumeDraft(null);
        globalEventService.fireEvent({data: null, type: 'richtexteditor.forceUpdate'});
        if (tabValue === 'DRAFT') {
            threadService.setSelectedThread(null)
        }
        changeThreadData();
        if (composeDraft && composeDraft.id) {
            dispatch(deleteMessage({body: {id: composeDraft.id}}));
        }
    }

    const modalCloseConfirmation = (type: string) => {
        if (type === 'yes') {
            performUpdate();
        }
        onCloseDraftConformationModal();
    }

    const changeThreadData = () => {
        if (props.passSelectedThreadData) {
            let thread = (threads || []).find((thread: Thread) => thread.id === props.passSelectedThreadData.id);
            dispatch(updateThreadState({
                selectedThread: thread || (threads || [])[0]
            }));
        }
    }

    return (
        <>
            <Box className={`${styles.mailBox} ${styles.composeBox}`}
                 height={'calc(100vh - 165px)'} overflow={'hidden'} borderRadius={'15px'}>

                <Flex padding={'16px 20px'} align={'center'} justify={'space-between'} gap={3}
                      className={styles.composeHeader} borderBottom={'1px solid #E5E7EB'}>
                    <Flex gap={1} align={'center'}>
                        <Heading as='h6' fontSize={'12px'} color={'#0A101D'} fontWeight={500}
                                 lineHeight={1}>Draft </Heading>
                        <Text fontSize='xs' lineHeight={1} color={'#6B7280'} display={'flex'} alignItems={'center'}
                              fontWeight={400}>
                            {!composeDraft && !isDraftUpdated && 'Not Saved'}
                            {composeDraft && isDraftUpdated &&
                            <>
                                (Saved to drafts&nbsp;{(composeDraft?.updated) ?
                                <Time as={'span'} time={composeDraft?.updated || ''} isShowFullTime={false}
                                      showTimeInShortForm={true}/> : '0s'}&nbsp;ago)
                            </>
                            }
                        </Text>
                    </Flex>
                    <Flex color={'#6B7280'} fontSize={'13px'} h={'20px'} w={'20px'} align={'center'} justify={'center'}
                          cursor={'pointer'} onClick={() => onCloseClick()}> <CloseIcon/> </Flex>
                </Flex>

                <Flex direction={'column'} flex={1}>
                    <Flex align={'center'} justify={'space-between'} gap={3} padding={'16px 20px'}
                          borderBottom={'1px solid #E5E7EB'}>
                        <Input className={styles.subjectInput} placeholder='Enter subject title' fontSize={'15px'}
                               flex={1} fontWeight={'600'} padding={'0'} border={'0'} h={'auto'}
                               borderRadius={'0'} lineHeight={1} color={'#0A101D'}
                               onChange={(e) => addSubject(e)} value={subject || ''}/>
                        <div>
                            <AddToProjectButton/>
                        </div>

                    </Flex>

                    <DropZone onFileUpload={handleFileUpload}>
                        <Flex w={'100%'} gap={4} padding={4} direction={'column'} border={'1px solid #F3F4F6'}
                              borderRadius={8}>
                            <MessageRecipients
                                emailRecipients={emailRecipients}
                                handleKeyDown={handleKeyDown}
                                handleChange={handleChange}
                                handlePaste={handlePaste}
                                handleAutoCompleteSelect={handleAutoCompleteSelect}
                                handleItemDelete={handleItemDelete}
                            />
                            <Flex flex={1} direction={'column'} position={'relative'}>
                                <Flex flex={1} direction={'column'} ref={editorRef} className={`editor-bottom-shadow`}
                                      maxH={'calc(100vh - 500px)'} overflowY={'auto'}
                                      onScroll={() => handleEditorScroll()} zIndex={6}
                                      onClick={() => dispatch(fireEvent({
                                          event: {
                                              data: null,
                                              type: 'richtexteditor.focus'
                                          }
                                      }))}
                                >
                                    {collabId && <CollabRichTextEditor
                                        id={'compose-draft-' + collabId}
                                        isAutoFocus={true}
                                        content={emailBody}
                                        onCreate={() => sendToDraft('')}
                                        onChange={(value) => sendToDraft(value)}
                                        placeholder='Reply with anything you like or @mention someone to share this thread'
                                        isToolbarVisible={true}
                                        className={`compose-view ${extraClassNames} ${extraClassNamesForBottom}`}
                                        emailSignature={selectedAccount ? `<p></p>${selectedAccount?.signature}` : undefined}
                                        projectShare={composeDraft?.projects?.length ? `<div style="display: flex; background-color: #EBF83E; width: fit-content; border-radius: 4px; color: #0A101D font-weight: 500; line-height: 1; padding: 5px 10px">
                                <p style="font-size: 13px; margin-right: 3px;"> ${selectedAccount?.name || ''} is sharing this email thread (and future replies) with</p>
                                <p style="font-size: 13px; text-decoration: underline; margin-right: 3px;">others</p>
                                <p style="font-size: 13px; margin-right: 3px;">on</p>
                                <p style="font-size: 13px; text-decoration: underline">Polymail</p>
                              </div>` : undefined}
                                        extendToolbar={(
                                            <>
                                                <Flex
                                                    onClick={() => inputFile.current?.click()}
                                                    align={'center'} justify={'center'} cursor={'pointer'}
                                                    className={styles.attachIcon}
                                                >
                                                    <Image src="/image/icon/attach.svg" alt="emoji" width={13}
                                                           height={13}/>
                                                    Attach
                                                    <input type='file' id='file' ref={inputFile}
                                                           onChange={(e) => handleFileUpload(e.target.files, e)}
                                                           style={{display: 'none'}}/>
                                                </Flex>
                                            </>
                                        )}
                                    />}
                                    {attachments && attachments.length > 0 ?
                                        <div style={{marginTop: '20px'}}>
                                            {attachments.map((item, index: number) => (
                                                <Flex align={'center'} key={index} className={styles.attachmentsFile}>
                                                    {item.filename}
                                                    <div className={styles.closeIcon}
                                                         onClick={() => removeAttachmentsData(index)}><CloseIcon/></div>
                                                </Flex>
                                            ))}
                                        </div> : null}
                                </Flex>

                                <Flex align={'flex-end'} justify={'space-between'} gap={2}>
                                    <Flex gap={2} className={styles.replyBoxIcon} mb={'-3px'} position={'relative'}
                                          zIndex={5} ml={'170px'}>
                                    </Flex>
                                    <Flex align={'center'} className={styles.replyButton}>
                                        <Button
                                            className={styles.replyTextDiscardButton}
                                            fontSize={14} lineHeight={16}
                                            onClick={() => onCloseClick()}
                                        >
                                            Discard
                                        </Button>
                                        <Button className={styles.replyTextButton} colorScheme='blue'
                                                onClick={() => sendMessages()}>
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
                        </Flex>
                    </DropZone>
                </Flex>
            </Box>

            <CreateNewProject onOpen={onOpenProject} isOpen={isOpenProject} onClose={onCloseProject}/>

            <Modal isOpen={isDraftConformationModal} onClose={onOpenDraftConformationModal} isCentered>
                <ModalOverlay backgroundColor={'rgba(229, 231, 235, 0.50)'} backdropFilter={'blur(16px)'}/>
                <ModalContent className={'confirm-modal'} borderRadius={12} boxShadow={'0 0 12px 0 rgba(0,0,0, 0.08)'}
                              padding={'12px'} maxW={'420px'}>
                    <ModalBody padding={'12px 12px 24px'}>
                        <Heading as='h5' fontSize={'15px'} color={'#0A101D'} lineHeight={1.21}>Are you sure?</Heading>
                        <Text color={'#6B7280'} mt={1} fontSize='13px'>This action cannot be undone</Text>
                    </ModalBody>

                    <ModalFooter className={'confirm-modal-footer'} borderTop={'1px solid #F3F4F6'} px={0} pb={0}>
                        <Button className={'cancel-button footer-button'} colorScheme='blue' mr={3}
                                onClick={() => modalCloseConfirmation('no')}>Cancel</Button>
                        <Button className={'confirm-button footer-button'} variant='ghost'
                                onClick={() => modalCloseConfirmation('yes')}>Confirm</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
