import {
    Box,
    Button, createStandaloneToast,
    Flex, Heading,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import Image from "next/image";
import {ChevronDownIcon, CloseIcon} from "@chakra-ui/icons";
import {FileIcon, LinkIcon, TextIcon} from "@/icons";
import React, {ChangeEvent, ChangeEventHandler, useEffect, useRef, useState} from "react";
import {debounce, isEmail} from "@/utils/common.functions";
import {Chip, RichTextEditor, Time, Toaster} from "@/components/common";
import {createDraft, sendMessage, updateDraftState, updatePartialMessage} from "@/redux/draft/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import dayjs from "dayjs";
import {MessageAttachments} from "@/models";
import {uploadAttachment} from "@/redux/messages/action-reducer";
import {SingleDatepicker} from "chakra-dayzed-datepicker";
import {MessageBoxType} from "@/types/props-types/message-box.type";

declare type RecipientsValue = { items: string[], value: string };
declare type RecipientsType = { cc: RecipientsValue, bcc: RecipientsValue, recipients: RecipientsValue };

export function MessageReplyBox(props: MessageBoxType) {
    const [emailRecipients, setEmailRecipients] = useState<RecipientsType>({
        cc: {items: [], value: ""},
        bcc: {items: [], value: ""},
        recipients: {items: [], value: ""},
    })
    const [subject, setSubject] = useState<string>('');
    const [emailBody, setEmailBody] = useState<string>('');
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {draft} = useSelector((state: StateType) => state.draft);
    const dispatch = useDispatch();
    const [attachments, setAttachments] = useState<MessageAttachments[]>([]);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const inputFile = useRef<HTMLInputElement | null>(null)
    const [scheduledDate, setScheduledDate] = useState<Date>();
    const [hideEditorToolbar, setHideEditorToolbar] = useState<boolean>(false);
    const [replyBoxHide, setReplyBoxHide] = useState<boolean>(false);
    const [boxUpdatedFirstTime, setBoxUpdatedFirstTime] = useState<boolean>(false);

    const isValid = (email: string, type: string) => {
        let error = null;
        if ((emailRecipients[type as keyof RecipientsType].items || []).includes(email)) {
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
            !!emailArray.length && emailArray.map(item => {
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

    const sendToDraft = (value: string, isValueUpdate: boolean = true) => {
        if (isValueUpdate) {
            if (!boxUpdatedFirstTime) {
                setBoxUpdatedFirstTime(true);
            }
            setEmailBody(value);
        }

        let body = {
            subject: subject,
            to: emailRecipients.recipients?.items,
            cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
            bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
            draftInfo: {
                body: value || emailBody
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

    useEffect(() => {
        // Add signature and draft to email body
        if (draft && draft.draftInfo) {
            if (draft.draftInfo.body) {
                setEmailBody(draft?.draftInfo?.body || '');
            }
            if (draft?.draftInfo?.attachments?.length) {
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
    }, [draft, props.replyType, selectedAccount])

    useEffect(() => {
        if (props.messageData) {
            let emailSubject = `Re: ${props.messageData.subject}`;
            if (props.replyType === 'forward') {
                emailSubject = `Fwd: ${props.messageData.subject}`;
                let decoded = Buffer.from(props.emailPart || '', 'base64').toString('ascii');
                setEmailBody(getForwardContent() + (decoded || '') + (selectedAccount?.signature || ''));
                if (draft && draft.draftInfo && draft?.draftInfo?.attachments?.length) {
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
                        items: draft ? (draft.to || []) : [props.messageData?.from!],
                        value: prevState.recipients.value
                    }
                }));

                if (props.replyType === 'reply-all' && props.messageData.cc) {
                    let items: string[] = (draft ? (draft.cc || []) : props.messageData.cc)!.filter(t => t);
                    if (items.length > 0) {
                        setEmailRecipients((prevState) => ({
                            ...prevState,
                            cc: {
                                items: items,
                                value: ''
                            }
                        }));
                        // setHideShowCCBccFields(prev => ({...prev, cc: true}));
                    }
                }
            }

            // set subject when email is replied or forwarded.
            setSubject(emailSubject || '');

        }
    }, [props.messageData, props.replyType, props.emailPart])

    function getForwardContent() {
        const forwardContent: string = `
             <p style="color: black; background: none">---------- Forwarded message ----------
From: ${props.messageData?.from}
Date: ${dayjs(props.messageData?.created, 'ddd, MMM DD, YYYY [at] hh:mm A')}
Subject: ${props.messageData?.subject}
To: ${props.messageData?.to}
${props.messageData?.cc ? 'Cc: ' + (props.messageData?.cc || []).join(',') : ''}</p><br/><br/><br/>`;
        return forwardContent;
    }

    useEffect(() => {
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

    useEffect(() => {
        if (!draft) {
            setBoxUpdatedFirstTime(false);
        }
    }, [draft])

    useEffect(() => {
        const propertiesToCheck: (keyof RecipientsType)[] = ['recipients', 'bcc', 'cc'];
        let allValues: string[] = [];
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
                if (draft && draft.to && draft.to.length) {
                    let undoToaster: any = {
                        id: 'send-now',
                        duration: 1500,
                        render: () => (
                            <Box display={'flex'} alignItems={'center'} color='black' p={3} bg='#FFFFFF'
                                 border={'1px solid #E5E7EB'} borderRadius={'8px'} className='mailSendToaster'
                                 fontSize={'14px'} padding={'13px 25px'} boxShadow={'0 0 12px 0 rgba(0,0,0, 0.08)'}>
                                {`Your message has been sent to ${draft.to[0]}${draft.to.length > 1 ? ` and ${draft.to.length - 1} other${draft.to.length === 2 ? '' : 's'}` : ''}`}
                                <Button onClick={() => undoClick('undo')} ml={3} height={"auto"}
                                        padding={'7px 15px'}>Undo</Button>
                                <Button onClick={() => undoClick('send-now')} height={"auto"} padding={'7px 15px'}>Send
                                    Now</Button>
                            </Box>
                        ),
                        position: 'bottom-left'
                    }

                    toast(undoToaster)
                }
            }
            dispatch(sendMessage({id: draft.id, ...params}));
            onClose();
            // if (props.onClose) {
            //     props.onClose();
            // }

            setEmailRecipients({
                cc: {items: [], value: ""},
                bcc: {items: [], value: ""},
                recipients: {items: props.messageData ? [props.messageData.from!] : [], value: ''}
            });
            setEmailBody('');
            dispatch(updateDraftState({
                draft: null,
            }));
        }
    }


    const handleBlur = () => {
        setTimeout(() => {
            setHideEditorToolbar(false)
        }, 500)
    }

    const handleFocus = () => {
        setTimeout(() => {
            setHideEditorToolbar(true)
        }, 500)
    }

    const showRecipientsBox = () => {
        setReplyBoxHide((current) => !current)
    }

    return (
        <Flex maxHeight={'450px'} direction={'column'} paddingBottom={4} mt={'auto'}
             backgroundColor={'#FFFFFF'}  width={'100%'} position={'sticky'}
              bottom={"-20px"} onFocus={() => handleFocus()} onBlur={() => handleBlur()}>
        <Flex borderRadius={8} gap={4} border={'1px solid #F3F4F6'} direction={'column'} padding={4} >
            <Flex align={'center'} justify={'space-between'} gap={4} pb={4}
                  borderBottom={'1px solid #F3F4F6'}>
                <Flex gap={1} align={'center'}>
                    <Flex className={`${styles.memberImages} ${styles.smallMemberImage}`}>
                        <div className={styles.memberPhoto}>
                            <Image src="/image/user.png" width="24" height="24" alt=""/>
                        </div>
                        <div className={styles.memberPhoto}>
                            <Image src="/image/user.png" width="24" height="24" alt=""/>
                        </div>
                        <Flex align={'center'} justify={'center'} fontSize={'9px'} color={'#082561'}
                              className={styles.memberPhoto}>
                            +4
                        </Flex>
                    </Flex>
                    <Text fontSize='xs' color={'#374151'} fontWeight={500}>Draft</Text>
                </Flex>
                <Button className={styles.createNewDraft} backgroundColor={'#F3F4F6'} h={'auto'}
                        padding={'4px 8px'} borderRadius={'30px'} color={'#374151'} fontSize={'12px'}
                        fontWeight={500} lineHeight={'normal'}> Create new draft </Button>
            </Flex>
            <Flex align={'center'} justify={'space-between'} gap={4}>
                <Flex align={'center'} gap={1}>
                    <Button color={'#6B7280'} variant='link' size='xs'
                            rightIcon={<ChevronDownIcon/>}> Reply to </Button>
                    <Flex align={'center'} gap={1}>
                        <div className={styles.mailUserImage}>

                        </div>

                        {!!emailRecipients?.recipients?.items?.length &&
                        <Flex fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                              fontWeight={400}>
                            {emailRecipients?.recipients?.items[0]}&nbsp; <Text
                            as='u'>{emailRecipients?.recipients?.items?.length - 1 > 0 && `and ${emailRecipients?.recipients?.items?.length - 1} others`} </Text>
                        </Flex>
                        }
                    </Flex>
                    <Button className={styles.editButton} color={'#374151'} backgroundColor={'#F3F4F6'}
                            borderRadius={'20px'} lineHeight={1} size='xs'
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                showRecipientsBox()
                            }}> {!replyBoxHide ? 'Edit' : 'Close'} </Button>
                </Flex>
                <Text fontSize='11px' color={'#6B7280'} display={'flex'} gap={'2px'} className={styles.mailSaveTime}>Saved {draft ? <Time time={draft?.created || ''} isShowFullTime={false} showTimeInShortForm={true}/> : '0 s'} ago</Text>
            </Flex>
            {replyBoxHide && <Flex className={styles.mailRecipientsBox} flex={'none'} backgroundColor={'#FFFFFF'}
                                   border={'1px solid #E5E7EB'} direction={'column'}
                                   borderRadius={8}>
                <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                    <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
                             color={'#374151'}>To:</Heading>
                    <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                        {!!emailRecipients?.recipients?.items?.length && emailRecipients.recipients.items.map((item: string | undefined, i: number) => (
                            <Chip text={item} key={i} click={() => handleItemDelete(item!, 'recipients')}/>
                        ))}

                        <Input width={'auto'} padding={0} height={'20px'} flex={'1 0 auto'}
                               fontSize={'12px'} border={0} className={styles.ccInput}
                               value={emailRecipients.recipients.value}
                               onKeyDown={(e) => handleKeyDown(e, 'recipients')}
                               onChange={(e) => handleChange(e, 'recipients')}
                               onPaste={(e) => handlePaste(e, 'recipients')}
                               placeholder={'Recipient\'s Email'}
                        />
                    </Flex>
                </Flex>
                <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                    <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
                             color={'#374151'}>Cc:</Heading>
                    <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                        {!!emailRecipients?.cc?.items?.length && emailRecipients.cc.items.map((item: string | undefined, i: number) => (
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
                <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                    <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
                             color={'#374151'}>Bcc:</Heading>
                    <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                        {!!emailRecipients?.bcc?.items?.length && emailRecipients.bcc.items.map((item: string | undefined, i: number) => (
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
            </Flex>}


            <Flex direction={'column'} position={"relative"} flex={1}>
                <Flex direction={'column'} maxH={'285px'} overflow={'auto'} className={styles.replyBoxEditor}>
                    <RichTextEditor
                        className={`reply-message-area message-reply-box ${hideEditorToolbar ? 'hide-toolbar' : ''}`}
                        initialUpdated={boxUpdatedFirstTime}
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
                </Flex>
                {hideEditorToolbar && <Flex direction={'column'} className={styles.composeModal}>
                    <Flex align={'flex-end'} justify={'space-between'} gap={2}>
                        <Flex gap={2} className={styles.replyBoxIcon}>
                            <FileIcon click={() => inputFile.current?.click()}/>
                            <input type='file' id='file' ref={inputFile} onChange={(e) => handleFileUpload(e)}
                                   style={{display: 'none'}}/>
                            <LinkIcon/>
                            <TextIcon/>
                            {/*<EmojiIcon/>*/}
                        </Flex>
                        <Flex align={'center'} className={styles.replyButton}>
                            <Button className={styles.replyTextButton} colorScheme='blue'
                                    onClick={() => sendMessages()}> Send </Button>
                            <Menu>
                                <MenuButton className={styles.replyArrowIcon} as={Button}
                                            aria-label='Options'
                                            variant='outline'><ChevronDownIcon/></MenuButton>
                                <MenuList className={'drop-down-list'}>
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
                                        <SingleDatepicker name="date-input"
                                                          date={scheduledDate}
                                                          defaultIsOpen={true}
                                                          onDateChange={setScheduledDate}/>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button variant='ghost' onClick={onClose}>Cancel</Button>
                                        <Button colorScheme='blue' mr={3}
                                                onClick={() => sendMessages(true)}> Schedule </Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </Flex>
                    </Flex>
                </Flex>
                }
            </Flex>
        </Flex>
        </Flex>
    )
}
