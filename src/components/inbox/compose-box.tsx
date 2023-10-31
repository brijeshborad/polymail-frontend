import {
    Box,
    Button,
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
import {clearDebounce, debounce, getProjectBanner, getSignatureBanner} from "@/utils/common.functions";
import {updatePartialMessage} from "@/redux/draft/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import dayjs from "dayjs";
import {deleteMessage, removeAttachment, uploadAttachment} from "@/redux/messages/action-reducer";
import {MessageAttachments, MessageRecipient} from "@/models";
import {DropZone, Toaster} from "@/components/common";
import {RecipientsType} from "@/types/props-types/message-recipients.type";
import dynamic from "next/dynamic";
import {useRouter} from "next/router";
import CollabRichTextEditor from "../common/collab-rich-text-editor";
import Image from "next/image";
import {getPlainTextFromHtml} from "@/utils/editor-common-functions";
import {commonService, draftService, globalEventService, messageService, threadService} from "@/services";
import {ProgressBar} from "@/components/loader-screen/progress-bar";

const CreateNewProject = dynamic(() => import('@/components/project/create-new-project').then(mod => mod.default));
const Time = dynamic(() => import("@/components/common").then(mod => mod.Time));
const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
const MessageRecipients = dynamic(() => import("../messages/message-recipients").then(mod => mod.default));
const MessageSchedule = dynamic(() => import("../messages/message-schedule").then(mod => mod.default));

const blankRecipientValue: MessageRecipient = {
    name: '',
    email: ''
}

let loaderPercentage = 10;

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
    const {tabValue} = useSelector((state: StateType) => state.threads);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const dispatch = useDispatch();
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
    const [isDraftUpdated, setIsDraftUpdated] = useState<boolean>(false);
    const router = useRouter();
    const [isContentSet, setIsContentSet] = useState<boolean>(false);
    const {showAttachmentLoader} = useSelector((state: StateType) => state.messages);

    useEffect(() => {
        if (incomingEvent === 'draft.undo') {
            setIsDraftUpdated(false);
        }
    }, [incomingEvent])

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
                // globalEventService.fireEvent({
                //     data: {body: draftInfo.body || ''},
                //     type: 'richtexteditor.forceUpdateWithOnChange'
                // });
                setEmailBody(draftInfo.body);
            }

            if (draftInfo && draftInfo.attachments && draftInfo.attachments.length > 0) {
                setAttachments([
                    ...draftInfo.attachments.map(t => ({
                        filename: t.filename,
                        mimeType: t.mimeType,
                        isUploaded: true

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
        let body = {
            subject: subject,
            to: emailRecipients.recipients?.items,
            cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
            bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
            draftInfo: {
                body: checkValue ? value : emailBody
            },
            ...(props.isProjectView ? {projectId: router.query.project as string} : {}),
            accountId: selectedAccount?.id
        }

        debounce(() => {
            dispatch(updatePartialMessage({
                body: {
                    id: composeDraft?.threadId + '-' + 0,
                    body: body,
                    fromCompose: true,
                    isDraftTab: props.tabValue === 'DRAFT'
                }
            }))
        }, 250);
    }

    function validateSendMessage() {
        if (emailRecipients.recipients.items.length === 0) {
            Toaster({
                title: 'Invalid recipients',
                desc: 'Please enter at least 1 email in the `to` field.',
                type: 'error'
            })
            return false;
        }
        return true;
    }

    const sendMessages = () => {
        if (!validateSendMessage()) {
            return;
        }

        if (showAttachmentLoader) {
            return;
        }
        if (composeDraft && composeDraft.id) {
            let body = {
                subject: subject,
                to: emailRecipients.recipients?.items,
                cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
                bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
                draftInfo: {
                    body: emailBody
                },
                ...(props.isProjectView ? {projectId: router.query.project as string} : {}),
            }
            messageService.sendMessage(true, scheduledDate || '', {
                ...body,
                id: composeDraft.id
            }, props.tabValue === 'DRAFT')
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
                threadService.performThreadsUpdateForDraftTab(composeDraft)
            } else {
                commonService.toggleComposingWithThreadSelection(false, true);
            }
            draftService.backupComposeDraftForUndo();
        }
    }


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

    function handleFileUpload(files: any, event: any) {
        if (!files) return;
        loaderPercentage = 0;

        const file = files[0];
        if (composeDraft && composeDraft.id) {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            const reader = new FileReader();
            if (reader) {
                reader.readAsDataURL(file);
                reader.onload = function () {


                    if (reader.result) {
                        setAttachments([
                            ...(attachments || []),
                            {
                                filename: file.name,
                                mimeType: file.type,
                                isUploaded: false
                            }
                        ]);

                        if (loaderPercentage < 100) {
                            loaderPercentage += 20;
                        }

                        dispatch(uploadAttachment({
                            body: {id: composeDraft.id, file: file},
                            afterSuccessAction: () => {
                                dispatch(updatePartialMessage({
                                    body: {
                                        id: composeDraft.threadId + '-' + 0,
                                        fromCompose: true,
                                        isDraftTab: props.tabValue === 'DRAFT'
                                    }
                                }));
                            }
                        }));
                    }
                };
                reader.onerror = function (error) {
                    console.log('Error: ', error);
                };
            }
        }
    }

    useEffect(() => {
        debounce(() => {
            if (loaderPercentage < 100) {
                loaderPercentage *= 2;
            }
        }, 0)
    }, [loaderPercentage])

    useEffect(() => {
        if (!showAttachmentLoader) {
            (attachments || []).map((item: any) => {
                if (!item.isUploaded) {
                    item.isUploaded = true
                    clearDebounce();
                }
            })
        }
    }, [showAttachmentLoader])

    function removeAttachmentsData(index: number) {
        const newArr = [...attachments];
        (newArr || []).splice(index, 1);
        setAttachments([...newArr!]);
        if (composeDraft && composeDraft.id && composeDraft.draftInfo?.attachments && composeDraft.draftInfo?.attachments[index] && composeDraft.draftInfo?.attachments[index].id) {
            dispatch(removeAttachment({
                body: {id: composeDraft.id!, attachment: composeDraft.draftInfo?.attachments[index].id!},
                afterSuccessAction: () => {
                    dispatch(updatePartialMessage({
                        body: {
                            id: composeDraft.threadId + '-' + 0,
                            fromCompose: true,
                            isDraftTab: props.tabValue === 'DRAFT'
                        }
                    }));
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
        globalEventService.fireEvent({data: {body: null}, type: 'richtexteditor.forceUpdate'});
        if (tabValue === 'DRAFT') {
            threadService.setSelectedThread(null)
            threadService.performThreadsUpdateForDraftTab(composeDraft)
        }
        draftService.setComposeDraft(null);
        draftService.setResumeDraft(null);
        if (composeDraft && composeDraft.id) {
            messageService.setDraftCache(composeDraft.id);
            dispatch(deleteMessage({body: {id: composeDraft.id}}));
        }
    }

    const modalCloseConfirmation = (type: string) => {
        if (type === 'yes') {
            performUpdate();
        }
        onCloseDraftConformationModal();
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
                            {!composeDraft && !isDraftUpdated && ''}
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
                            <AddToProjectButton allowDefaultSelect={true}/>
                        </div>

                    </Flex>

                    <DropZone onFileUpload={handleFileUpload}>
                        <Flex w={'100%'} gap={4} padding={4} direction={'column'} border={'1px solid #F3F4F6'}
                              borderRadius={8}>
                            <MessageRecipients
                                emailRecipients={emailRecipients}
                                updateValues={(values) => {
                                    setIsDraftUpdated(true);
                                    setEmailRecipients({...values})
                                }}
                            />
                            <Flex flex={1} direction={'column'} position={'relative'}>
                                <Flex flex={1} direction={'column'} ref={editorRef} className={`editor-bottom-shadow compose-editor`}
                                      maxH={'calc(100vh - 500px)'} overflowY={'auto'}
                                      onScroll={() => handleEditorScroll()} zIndex={6}
                                >
                                    {composeDraft?.threadId && <CollabRichTextEditor
                                        id={composeDraft?.threadId + '-' + 0}
                                        isAutoFocus={true}
                                        content={composeDraft?.draftInfo?.body}
                                        onCreate={() => sendToDraft('')}
                                        onChange={(value) => sendToDraft(value)}
                                        placeholder='Reply with anything you like or @mention someone to share this thread'
                                        isToolbarVisible={true}
                                        className={`compose-view ${extraClassNames} ${extraClassNamesForBottom}`}
                                        emailSignature={selectedAccount ? getSignatureBanner(selectedAccount) : undefined}
                                        projectShare={composeDraft?.projects?.length ? getProjectBanner(selectedAccount) : undefined}
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
                                                    <Flex ml={'auto'} gap={3} className={'attachments-progress-bar'}>
                                                        {(showAttachmentLoader && !item.isUploaded) &&
                                                        <ProgressBar loaderPercentage={loaderPercentage}/>}
                                                        <div className={styles.closeIcon}
                                                             onClick={() => removeAttachmentsData(index)}><CloseIcon/>
                                                        </div>
                                                    </Flex>
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
                                        <Button isDisabled={showAttachmentLoader} className={styles.replyTextButton}
                                                colorScheme='blue'
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
