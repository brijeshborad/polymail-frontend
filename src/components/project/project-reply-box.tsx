import styles from "@/styles/Inbox.module.css";
import {
    Box,
    Button,
    createStandaloneToast,
    Flex,
    Heading,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure
} from "@chakra-ui/react";
import React, {ChangeEvent, ChangeEventHandler, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ChevronDownIcon, CloseIcon, InfoOutlineIcon} from "@chakra-ui/icons";
import {SingleDatepicker} from "chakra-dayzed-datepicker";
import {Chip, Toaster, RichTextEditor} from "@/components/common";
import {FileIcon, LinkIcon, TextIcon} from "@/icons";
import {
    uploadAttachment,
    updateMessageState,
} from "@/redux/messages/action-reducer";
import {
    createDraft,
    sendMessage, updateDraftState,
    updatePartialMessage
} from "@/redux/draft/action-reducer";
import {StateType} from "@/types";
import {debounce, isEmail} from "@/utils/common.functions";
import {ReplyBoxType} from "@/types/props-types/replyBox.type";
import dayjs from "dayjs";
import {MessageAttachments} from "@/models";

declare type RecipientsValue = { items: string[], value: string };
declare type RecipientsType = { cc: RecipientsValue, bcc: RecipientsValue, recipients: RecipientsValue };

export function ProjectReplyBox(props: ReplyBoxType) {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [emailBody, setEmailBody] = useState<string>('');
    const [hideShowCCBccFields, setHideShowCCBccFields] = useState<{ cc: boolean, bcc: boolean }>({
        cc: false,
        bcc: false
    })
    const [subject, setSubject] = useState<string>('');
    const [scheduledDate, setScheduledDate] = useState<Date>();
    const [boxUpdatedFirstTime, setBoxUpdatedFirstTime] = useState<boolean>(false);
    const [emailRecipients, setEmailRecipients] = useState<RecipientsType>({
        cc: {items: [], value: ""},
        bcc: {items: [], value: ""},
        recipients: {items: [], value: ""},
    })
    const [attachments, setAttachments] = useState<MessageAttachments[]>([]);

    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {selectedThread} = useSelector((state: StateType) => state.threads);
    const {
        selectedMessage,
        isCompose
    } = useSelector((state: StateType) => state.messages);
    const {
        draft
    } = useSelector((state: StateType) => state.draft);

    const inputFile = useRef<HTMLInputElement | null>(null)

    const dispatch = useDispatch();

    useEffect(() => {
        // Add signature and draft to email body
        if (draft && draft.draftInfo) {
            if (draft.draftInfo.body) {
                if (!isCompose) {
                    setEmailBody(prevState => (draft?.draftInfo?.body || '').concat(prevState));
                } else {
                    // setBoxUpdatedFirstTime(false);
                    setEmailBody(draft?.draftInfo?.body || '');
                }
            }
            if (draft.draftInfo.attachments) {
                setAttachments([
                    ...draft.draftInfo.attachments.map(t => ({
                        filename: t.filename,
                        mimeType: t.mimeType
                    }))
                ]);
            }
        } else {
            // Add signature to email body
            if (selectedAccount && selectedAccount.signature && props.replyType !== 'forward') {
                setEmailBody(selectedAccount.signature);
            }
        }
    }, [draft, isCompose, props.replyType, selectedAccount])


    useEffect(() => {
        if (selectedMessage && !isCompose) {
            let emailSubject = `Re: ${selectedMessage.subject}`;
            if (props.replyType === 'forward') {
                emailSubject = `Fwd: ${selectedMessage.subject}`;
                let decoded = Buffer.from(props.emailPart || '', 'base64').toString('ascii');
                setEmailBody(getForwardContent() + (decoded || '') + (selectedAccount?.signature || ''));
                if (draft && draft.draftInfo && draft.draftInfo.attachments) {
                    setAttachments([
                        ...draft.draftInfo.attachments.map(t => ({
                            filename: t.filename,
                            mimeType: t.mimeType
                        }))
                    ]);
                }
            } else {
                setEmailRecipients((prevState) => ({
                    ...prevState,
                    recipients: {
                        items: !isCompose ? (draft ? draft.to : [selectedMessage.from!]) : [],
                        value: prevState.recipients.value
                    }
                }));

                if (props.replyType === 'reply-all' && selectedMessage.cc) {
                    let items: string[] = (draft ? (draft.cc || []) : selectedMessage.cc)!.filter(t => t);
                    if (items.length > 0) {
                        setEmailRecipients((prevState) => ({
                            ...prevState,
                            cc: {
                                items: items,
                                value: ''
                            }
                        }));
                        setHideShowCCBccFields(prev => ({...prev, cc: true}));
                    }
                }
            }

            // set subject when email is replied or forwarded.
            setSubject(emailSubject || '');
        }
    }, [isCompose, draft, selectedMessage, props.replyType, props.emailPart])

    function getForwardContent() {
        const forwardContent: string = `
             <p style="color: black; background: none">---------- Forwarded message ----------
From: ${selectedMessage?.from}
Date: ${dayjs(selectedMessage?.created, 'ddd, MMM DD, YYYY [at] hh:mm A')}
Subject: ${selectedMessage?.subject}
To: ${selectedMessage?.to}
${selectedMessage?.cc ? 'Cc: ' + (selectedMessage?.cc || []).join(',') : ''}</p><br/><br/><br/>`;
        return forwardContent;
    }

    useEffect(() => {
        setHideShowCCBccFields({cc: false, bcc: false});
        setEmailRecipients((prevState) => ({
            ...prevState,
            cc: {
                items: [],
                value: "",
            },
            bcc: {
                items: [],
                value: "",
            }
        }));
    }, [])


    const handleChange = (evt: ChangeEvent | any, type: string) => {
        setEmailRecipients((prevState) => ({
            ...prevState,
            [type as keyof RecipientsType]: {
                items: [...(prevState[type as keyof RecipientsType].items || [])],
                value: evt.target.value
            }
        }));
    };


    const handlePaste = (evt: ClipboardEvent | any, type: string) => {
        evt.preventDefault();

        let paste = evt.clipboardData.getData("text");
        let emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g);

        if (emails) {
            let toBeAdded = emails.filter((item: string) => !emailRecipients[type as keyof RecipientsType].items.includes(item));
            setEmailRecipients((prevState) => ({
                ...prevState,
                [type as keyof RecipientsType]: {
                    items: [...prevState[type as keyof RecipientsType].items, ...toBeAdded],
                    value: ''
                }
            }));
        }
    };


    const handleKeyDown = (evt: KeyboardEvent | any, type: string) => {
        if (["Enter", "Tab"].includes(evt.key)) {
            evt.preventDefault();
            let value = emailRecipients[type as keyof RecipientsType].value.trim();
            let emailArray = value.split(',');
            emailArray.map(item => {
                if (item && isValid(item, type)) {
                    setEmailRecipients((prevState) => ({
                        ...prevState,
                        [type as keyof RecipientsType]: {
                            items: [...prevState[type as keyof RecipientsType].items, item],
                            value: ''
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
                items: prevState[type as keyof RecipientsType].items.filter(i => i !== item),
                value: ''
            }
        }));
    };


    const addSubject = (event: ChangeEvent | any) => {
        setSubject(event.target.value || '');
    }


    const sendToDraft = (value: string, isValueUpdate: boolean = true) => {
        if (isValueUpdate) {
            if (!boxUpdatedFirstTime) {
                setBoxUpdatedFirstTime(true);
            }
            setEmailBody(value);
        }

        let body = {
            subject: subject || selectedMessage?.subject,
            to: emailRecipients.recipients?.items,
            ...((selectedThread && props.replyType !== 'forward') ? {threadId: selectedThread.id} : {}),
            ...(emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? {cc: emailRecipients.cc?.items} : {}),
            ...(emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? {bcc: emailRecipients.bcc?.items} : {}),
            draftInfo: {
                body: isValueUpdate ? value : emailBody
            }
        }

        debounce(() => {
            if (selectedAccount && selectedAccount.id) {
                if (draft && draft.id) {
                    dispatch(updatePartialMessage({id: draft.id, body}));
                } else {
                    dispatch(createDraft({accountId: selectedAccount.id, body}));
                }
            }
        }, 500);
    }

    const isValid = (email: string, type: string) => {
        let error = null;
        if (emailRecipients[type as keyof RecipientsType].items.includes(email)) {
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

    const {toast} = createStandaloneToast()
    const undoClick = (type: string) => {
        if (draft && draft.id) {
            let params = {};

            if (type === 'undo') {
                params = {
                    undo: true
                }
            } else if (type === 'send-now') {
                params = {
                    now: true
                }
            }
            dispatch(sendMessage({id: draft.id, ...params}));
            toast.close('send-now');
        }

    }

    const sendMessages = (scheduled: boolean = false) => {
        if (draft && draft.id) {
            let params = {};
            if (scheduled) {
                const targetDate = dayjs(scheduledDate).set('hour', 8);
                // Get the current date and time
                const currentDate = dayjs();
                const secondsDifference = targetDate.diff(currentDate, 'second');
                params = {
                    delay: secondsDifference
                }
            } else {
                let undoToaster: any = {
                    id: 'send-now',
                    duration: 1500,
                    render: () => (
                        <Box display={'flex'} alignItems={'center'} color='white' p={3} bg='#000000'
                             borderRadius={'5px'}
                             className={styles.mailSendToaster} fontSize={'14px'} padding={'13px 25px'}>
                            {`Your message has been sent to ${draft.to[0]} ${draft.to.length > 0 ? `and ${draft.to.length === 2 ? draft.to[1] : (draft.to.length - 1 + ' others')}` : ''}`}
                            <Button onClick={() => undoClick('undo')} ml={3} height={"auto"}
                                    padding={'7px 15px'}>Undo</Button>
                            <Button onClick={() => undoClick('send-now')} height={"auto"} padding={'7px 15px'}>Send
                                Now</Button>
                        </Box>
                    ),
                    position: 'bottom'
                }
                toast(undoToaster)
            }
            dispatch(sendMessage({id: draft.id, ...params}));
            if (props.onClose) {
                props.onClose();
            }

            setEmailRecipients({
                cc: {items: [], value: ""},
                bcc: {items: [], value: ""},
                recipients: {items: !isCompose && selectedMessage ? [selectedMessage.from!] : [], value: ''}
            });
            setEmailBody('');
            dispatch(updateDraftState({
                draft: null,
            }));
            dispatch(updateMessageState({
                ...(isCompose ? {isCompose: false} : {})
            }));
        }
    }

    const showCCFields = (type: string) => {
        setHideShowCCBccFields(prev => ({...prev, [type]: true}));
        setEmailRecipients((prevState) => ({
            ...prevState,
            [type as keyof RecipientsType]: {
                items: [...prevState[type as keyof RecipientsType].items],
                value: ''
            }
        }));
    }


    function handleFileUpload(event: ChangeEventHandler | any) {
        const file = event.target.files[0];
        if (draft && draft.id) {
            event.stopPropagation();
            event.preventDefault();
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                if (reader.result) {
                    setAttachments([
                        ...(attachments || []),
                        {
                            filename: event.target.files[0].name,
                            mimeType: event.target.files[0].type
                        }
                    ]);
                    dispatch(uploadAttachment({id: draft.id, file}));
                    sendToDraft('', false);
                }
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        }
    }


    function removeAttachment(index: number) {
        const newArr = [...attachments];
        (newArr || []).splice(index, 1);
        setAttachments([...newArr!]);
    }

    const openCalender = () => {
        onOpen();
        let today = new Date();
        today.setDate(today.getDate() + 1);
        setScheduledDate(today);
    }

    return (
        <div className={styles.mailFooter}>
            <Flex direction={'column'} className={styles.replyBox}>
                <div className={styles.replyBoxTags}>
                    <Flex justifyContent={'space-between'} padding={'8px 10px'}
                          borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>
                        <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>
                            <Heading as={'h1'} size={'sm'} paddingTop={1} marginRight={1}>To:</Heading>
                            <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                                {emailRecipients.recipients.items.map((item: string | undefined, i: number) => (
                                    <Chip text={item} key={i} click={() => handleItemDelete(item!, 'recipients')}/>
                                ))}

                                <Input width={'auto'} padding={0} height={'23px'}
                                       fontSize={'12px'}
                                       value={emailRecipients.recipients.value}
                                       onKeyDown={(e) => handleKeyDown(e, 'recipients')}
                                       onChange={(e) => handleChange(e, 'recipients')}
                                       onPaste={(e) => handlePaste(e, 'recipients')}
                                       border={0} className={styles.ccInput}
                                       placeholder={'Recipient\'s Email'}
                                />
                                {!hideShowCCBccFields.cc &&
                                <span className={styles.ccButton} onClick={() => showCCFields('cc')}>Cc</span>}
                                {!hideShowCCBccFields.bcc &&
                                <span className={styles.ccButton} onClick={() => showCCFields('bcc')}>Bcc</span>}
                            </Flex>
                        </Flex>
                    </Flex>

                    {/*cc*/}
                    {hideShowCCBccFields.cc && <Flex justifyContent={'space-between'} gap={1} padding={'8px 10px'}
                                                     borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>
                        <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>
                            <Heading as={'h1'} size={'sm'} paddingTop={1} marginRight={1}>CC:</Heading>
                            <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                                {emailRecipients.cc.items.map((item: string | undefined, i: number) => (
                                    <Chip text={item} key={i} click={() => handleItemDelete(item!, 'cc')}/>
                                ))}

                                <Input width={'auto'} padding={0} height={'23px'}
                                       fontSize={'12px'}
                                       value={emailRecipients.cc.value}
                                       onKeyDown={(e) => handleKeyDown(e, 'cc')}
                                       onChange={(e) => handleChange(e, 'cc')}
                                       onPaste={(e) => handlePaste(e, 'cc')}
                                       border={0} className={styles.ccInput}
                                />
                            </Flex>
                        </Flex>
                        <InfoOutlineIcon/>
                    </Flex>}

                    {/*bcc*/}
                    {hideShowCCBccFields.bcc && <Flex justifyContent={'space-between'} padding={'8px 10px'}
                                                      borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>
                        <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>
                            <Heading as={'h1'} size={'sm'} paddingTop={1} marginRight={1}>BCC:</Heading>
                            <Flex alignItems={'center'} gap={1} wrap={'wrap'} width={'100%'}>
                                {emailRecipients.bcc.items.map((item: string | undefined, i: number) => (
                                    <Chip text={item} key={i} click={() => handleItemDelete(item!, 'bcc')}/>
                                ))}

                                <Input width={'auto'} padding={0} height={'23px'}
                                       fontSize={'12px'}
                                       value={emailRecipients.bcc.value}
                                       onKeyDown={(e) => handleKeyDown(e, 'bcc')}
                                       onChange={(e) => handleChange(e, 'bcc')}
                                       onPaste={(e) => handlePaste(e, 'bcc')}
                                       border={0} className={styles.ccInput}
                                />
                            </Flex>
                        </Flex>
                        <InfoOutlineIcon/>
                    </Flex>}

                    {/* Subject */}
                    <Flex width={'100%'} className={styles.subject}>
                        <Input width={'100%'} padding={3} height={'23px'}
                               fontSize={'12px'}
                               value={subject}
                               border={0} className={styles.subjectInput}
                               placeholder={'Subject'} onChange={(e) => addSubject(e)}
                        />
                    </Flex>

                </div>

                <Flex direction={'column'} className={styles.replyMessage}>

                    <RichTextEditor className={styles.replyMessageArea} initialUpdated={boxUpdatedFirstTime}
                                    placeholder='Reply with anything you like or @mention someone to share this thread'
                                    value={emailBody} onChange={(e) => sendToDraft(e)}/>

                    {attachments && attachments.length > 0 ? <div style={{marginTop: '20px'}}>
                        {attachments.map((item, index: number) => (
                            <Flex align={'center'} key={index} className={styles.attachmentsFile}>
                                {item.filename}
                                <div className={styles.closeIcon} onClick={() => removeAttachment(index)}><CloseIcon/>
                                </div>
                            </Flex>
                        ))}
                    </div> : null}

                    <Flex align={'flex-end'} justify={"space-between"} gap={2} order={1}>

                        <Flex align={'center'} gap={3}>
                            <FileIcon click={() => inputFile.current?.click()}/>
                            <input type='file' id='file' ref={inputFile} onChange={(e) => handleFileUpload(e)}
                                   style={{display: 'none'}}/>
                            <LinkIcon/>
                            <TextIcon/>
                            {/*<EmojiIcon/>*/}
                        </Flex>

                        <Flex align={'center'} className={styles.replyButton}>
                            <Button className={styles.replayTextButton} colorScheme='blue'
                                    onClick={() => sendMessages()}
                                    isDisabled={!(emailRecipients.recipients.items.length && emailBody)}>
                                Send
                            </Button>
                            <Menu>
                                <MenuButton className={styles.replayArrowIcon} as={Button} aria-label='Options' isDisabled={!(emailRecipients.recipients.items.length && emailBody)}
                                            variant='outline'><ChevronDownIcon/></MenuButton>

                                <MenuList>
                                    <MenuItem onClick={() => openCalender()}> Send Later </MenuItem>
                                </MenuList>
                            </Menu>
                            <Modal isOpen={isOpen} onClose={onClose} isCentered={true} scrollBehavior={'outside'}>
                                <ModalOverlay/>
                                <ModalContent minHeight="440px">
                                    <ModalHeader display="flex" justifyContent="space-between" alignItems="center">
                                        Schedule send
                                    </ModalHeader>
                                    <ModalCloseButton size={'xs'}/>
                                    <ModalBody>

                                        <SingleDatepicker
                                            name="date-input"
                                            date={scheduledDate}
                                            defaultIsOpen={true}
                                            onDateChange={setScheduledDate}
                                        />

                                    </ModalBody>
                                    <ModalFooter>
                                        <Button variant='ghost' onClick={onClose}>Cancel</Button>
                                        <Button colorScheme='blue' mr={3} onClick={() => sendMessages(true)}>
                                            Schedule
                                        </Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>

                        </Flex>

                    </Flex>
                </Flex>
            </Flex>
        </div>
    )
}
