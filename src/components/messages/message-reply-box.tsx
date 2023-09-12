import {
    Button,
    createStandaloneToast,
    Flex,
    Grid,
    GridItem,
    Input,
    Menu,
    MenuButton,
    MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Radio,
    RadioGroup,
    Select,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import Image from "next/image";
import {ChevronDownIcon, CloseIcon} from "@chakra-ui/icons";
import {FileIcon, TextIcon} from "@/icons";
import React, {ChangeEvent, ChangeEventHandler, useEffect, useRef, useState} from "react";
import {debounce, isEmail} from "@/utils/common.functions";
import {RichTextEditor, Time, Toaster} from "@/components/common";
import {createDraft, sendMessage, updateDraftState, updatePartialMessage} from "@/redux/draft/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import dayjs from "dayjs";
import {MessageAttachments} from "@/models";
import {uploadAttachment} from "@/redux/messages/action-reducer";
import {SingleDatepicker} from "chakra-dayzed-datepicker";
import {MessageBoxType} from "@/types/props-types/message-box.type";
import MessageRecipients from "./message-recipients";
import {RecipientsType} from "@/types/props-types/message-recipients.type";

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
    const {isOpen, onClose} = useDisclosure();
    const inputFile = useRef<HTMLInputElement | null>(null)
    const [scheduledDate, setScheduledDate] = useState<Date>();
    const [hideEditorToolbar, setHideEditorToolbar] = useState<boolean>(false);
    const [isShowText, _setIsShowText] = useState<boolean>(false);
    const [replyBoxHide, setReplyBoxHide] = useState<boolean>(false);
    const [boxUpdatedFirstTime, setBoxUpdatedFirstTime] = useState<boolean>(false);
    const [extraClassNames, setExtraClassNames] = useState<string>('');
    const editorRef = useRef<any>(null);
    const {toast} = createStandaloneToast()
    const monthArray = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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

    // const openCalender = () => {
    //     onOpen();
    //     let today = new Date();
    //     today.setDate(today.getDate() + 1);
    //     setScheduledDate(today);
    // }


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
                    Toaster({
                        desc: `Your message has been sent to ${draft?.to && draft?.to[0]}${draft?.to && draft?.to?.length > 1 ? ` and ${draft?.to && draft?.to?.length - 1} other${draft?.to && draft?.to?.length === 2 ? '' : 's'}` : ''}`,
                        type: 'send_confirmation',
                        title: draft?.subject || '',
                        undoClick: (type: string) => {
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
                            dispatch(sendMessage({id: draft.id!, ...params}));
                            toast.close('poly-toast');
                        }
                    })
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

    const [value, setValue] = React.useState('')


    const openCalender = (value: string) => {
        setValue(value)
        let tomorrowDate = new Date();

        if (value === '1') {
            tomorrowDate.setDate(tomorrowDate.getDate() + 1)
            tomorrowDate.setHours(8);
            tomorrowDate.setMinutes(0);
            tomorrowDate.setMilliseconds(0);
            setScheduledDate(tomorrowDate);
        } else if (value === '2') {
            tomorrowDate.setDate(tomorrowDate.getDate() + 1)
            tomorrowDate.setHours(13);
            tomorrowDate.setMinutes(0);
            tomorrowDate.setMilliseconds(0);
            setScheduledDate(tomorrowDate);
        } else if (value === '3') {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const daysUntilNextMonday = 1 + (7 - dayOfWeek) % 7;
            const nextMonday = new Date(today);
            nextMonday.setDate(today.getDate() + daysUntilNextMonday);
            setScheduledDate(nextMonday);
        }
    }

    function handleEditorScroll(event: any) {
        if (event.target.scrollTop > 0) {
            setExtraClassNames(prevState => !prevState.includes('show-shadow') ? prevState + ' show-shadow' : prevState);
        } else {
            setExtraClassNames(prevState => prevState.replace('show-shadow', ''));
        }
    }

    return (
        <Flex backgroundColor={'#FFFFFF'} position={'sticky'} mt={'auto'} bottom={'-20px'} paddingBottom={props.parentHasScroll ? 5 : 0}>
            <Flex maxHeight={'450px'} direction={'column'} backgroundColor={'#FFFFFF'} width={'100%'}
                  onFocus={() => handleFocus()} onBlur={() => handleBlur()}>
                <Flex borderRadius={8} gap={4} border={'1px solid #F3F4F6'} direction={'column'} padding={4}>
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
                        <Text as={'h1'} fontSize='11px' color={'#6B7280'} display={'flex'} gap={'2px'}
                              className={styles.mailSaveTime}>Saved {draft ?
                            <Time time={draft?.created || ''} isShowFullTime={false}
                                  showTimeInShortForm={true}/> : '0 s'} ago</Text>
                    </Flex>
                    {replyBoxHide &&
                    <Flex className={styles.mailRecipientsBox} flex={'none'} backgroundColor={'#FFFFFF'}
                          border={'1px solid #E5E7EB'} direction={'column'}
                          borderRadius={8}>
                        <MessageRecipients
                            emailRecipients={emailRecipients}
                            handleKeyDown={handleKeyDown}
                            handleChange={handleChange}
                            handlePaste={handlePaste}
                            handleItemDelete={handleItemDelete}
                        />
                    </Flex>}


                    <Flex direction={'column'} position={"relative"} flex={1}>
                        <Flex direction={'column'} maxH={'285px'} overflow={'auto'} ref={editorRef} className={styles.replyBoxEditor}
                              onScroll={handleEditorScroll}>
                            <RichTextEditor
                                className={`reply-message-area message-reply-box ${hideEditorToolbar ? 'hide-toolbar' : ''} ${isShowText ? 'input-value-shadow' : ''} ${extraClassNames}`}
                                initialUpdated={boxUpdatedFirstTime}
                                placeholder='Reply with anything you like or @mention someone to share this thread'
                                value={emailBody} onChange={(e) => sendToDraft(e)}/>
                            {attachments && attachments.length > 0 ? <div style={{marginTop: '20px'}}>
                                {attachments.map((item, index: number) => (
                                    <Flex align={'center'} key={index} className={styles.attachmentsFile}>
                                        {item.filename}
                                        <div className={styles.closeIcon} onClick={() => removeAttachment(index)}>
                                            <CloseIcon/>
                                        </div>
                                    </Flex>
                                ))}
                            </div> : null}
                        </Flex>
                        {hideEditorToolbar &&
                        <Flex direction={'column'} className={styles.composeModal}>
                            <Flex align={'flex-end'} justify={'space-between'} gap={2}>
                                <Flex gap={2} className={styles.replyBoxIcon} mb={'-3px'} position={'relative'} zIndex={5} ml={'170px'}>
                                    <Flex width={'20px'} h={'20px'} align={'center'} justify={'center'} cursor={'pointer'} className={styles.replyIcon}>
                                        <FileIcon click={() => inputFile.current?.click()}/>
                                    </Flex>
                                    <input type='file' id='file' ref={inputFile} onChange={(e) => handleFileUpload(e)}
                                           style={{display: 'none'}}/>
                                    {/*<LinkIcon/>*/}
                                    <Flex width={'20px'} h={'20px'} align={'center'} justify={'center'} cursor={'pointer'} className={styles.replyIcon}>
                                        <TextIcon/>
                                    </Flex>
                                    {/*<EmojiIcon/>*/}
                                </Flex>
                                <Flex align={'center'} className={styles.replyButton}>
                                    <Button className={styles.replyTextButton} colorScheme='blue'
                                            onClick={() => sendMessages()}> Send </Button>
                                    <Menu isLazy={true} lazyBehavior={"keepMounted"}>
                                        <MenuButton className={styles.replyArrowIcon} as={Button}
                                                    aria-label='Options'
                                                    variant='outline'><ChevronDownIcon/></MenuButton>
                                        <MenuList className={'custom-dropdown'} width={'360px'}>
                                            <Flex padding={'12px 12px 11px'} align={'center'}
                                                  justifyContent={'space-between'} borderBottom={'1px solid #F3F4F6'}>
                                                <Text fontSize='13px' color={'#374151'} letterSpacing={'-0.13px'}
                                                      lineHeight={'normal'}>Schedule send (CEST)</Text>
                                                <Button h={'20px'} minW={'20px'} className={styles.dropDownCloseIcon}
                                                        backgroundColor={'transparent'} padding={0} color={'#6B7280'}
                                                        colorScheme='blue'><CloseIcon/> </Button>
                                            </Flex>

                                            <Flex mt={4} direction={'column'} gap={4} px={3}
                                                  className={'radio-group-button'}>
                                                <RadioGroup onChange={(e) => openCalender(e)} value={value}>
                                                    <Radio value='1' onClick={() => sendMessages(true)}>Tomorrow
                                                        morning <span>(Aug, 26, 8:00AM)</span></Radio>
                                                    <Radio value='2' onClick={() => sendMessages(true)}>Tomorrow
                                                        afternoon <span>(Aug, 26, 1:00PM)</span></Radio>
                                                    <Radio value='3' onClick={() => sendMessages(true)}>Monday
                                                        morning <span>(Aug, 28, 8:00AM)</span></Radio>
                                                </RadioGroup>
                                                <Flex w={'100%'} pt={4} pb={3} borderTop={'1px solid #F3F4F6'}>
                                                    {/*<Button className={'custom-time-date'} border={'1px solid #374151'}*/}
                                                    {/*        lineHeight={1} borderRadius={8} color={'#374151'} h={'auto'}*/}
                                                    {/*        backgroundColor={'#FFFFFF'} fontSize={'14px'}  padding={'10px 12px'}>*/}
                                                    {/*    Custom time & date </Button>*/}
                                                    <Menu>
                                                        <MenuButton className={'custom-time-date'}
                                                                    border={'1px solid #374151'}
                                                                    lineHeight={1} borderRadius={8} color={'#374151'}
                                                                    h={'auto'}
                                                                    backgroundColor={'#FFFFFF'} fontSize={'14px'}
                                                                    padding={'10px 12px'}>
                                                            Custom time & date </MenuButton>
                                                        <MenuList className={'custom-dropdown'} width={'360px'}>
                                                            <Flex padding={'12px 12px 11px'} align={'center'}
                                                                  justifyContent={'space-between'}
                                                                  borderBottom={'1px solid #F3F4F6'}>
                                                                <Text fontSize='13px' color={'#374151'}
                                                                      letterSpacing={'-0.13px'}
                                                                      lineHeight={'normal'}>Custom time & date</Text>
                                                                <Button h={'20px'} minW={'20px'}
                                                                        className={'dropdown-close-icon'}
                                                                        backgroundColor={'transparent'} padding={0}
                                                                        color={'#6B7280'}
                                                                        colorScheme='blue'><CloseIcon/> </Button>
                                                            </Flex>

                                                            <Flex mt={4} direction={'column'} gap={4} px={3}
                                                                  className={'radio-group-button'}>
                                                                <Flex direction={'column'} className={'custom-time'}>
                                                                    <Flex mt={4} direction={'column'} gap={4} px={3}
                                                                          className={'radio-group-button'}>
                                                                        <Flex direction={'column'}
                                                                              className={'custom-time'}>
                                                                            <Text fontSize={'13px'} fontWeight={500}
                                                                                  mb={2}
                                                                                  color={'#0A101D'}
                                                                                  letterSpacing={'-0.13px'}
                                                                                  lineHeight={'normal'}>Time</Text>

                                                                            <Grid templateColumns='repeat(3, 1fr)'
                                                                                  gap={3}>
                                                                                <GridItem w='100%'>
                                                                                    <Input border={'1px solid #E5E7EB'}
                                                                                           fontSize={'13px'}
                                                                                           fontWeight={400}
                                                                                           lineHeight={1}
                                                                                           padding={'10px 16px'}
                                                                                           h={'auto'}
                                                                                           backgroundColor={'#FFFFFF'}
                                                                                           borderRadius={8}
                                                                                           placeholder='1:30'/>
                                                                                </GridItem>
                                                                                <GridItem w='100%'>
                                                                                    <Select border={'1px solid #E5E7EB'}
                                                                                            fontSize={'13px'}
                                                                                            fontWeight={400}
                                                                                            lineHeight={1} h={'auto'}
                                                                                            backgroundColor={'#FFFFFF'}
                                                                                            borderRadius={8}>
                                                                                        <option value='option1'>PM
                                                                                        </option>
                                                                                        <option value='option2'>AM
                                                                                        </option>
                                                                                    </Select>
                                                                                </GridItem>
                                                                                <GridItem w='100%'>
                                                                                    <Select border={'1px solid #E5E7EB'}
                                                                                            fontSize={'13px'}
                                                                                            fontWeight={400}
                                                                                            lineHeight={1} h={'auto'}
                                                                                            backgroundColor={'#FFFFFF'}
                                                                                            borderRadius={8}>
                                                                                        <option value='option1'>CEST
                                                                                        </option>
                                                                                        <option value='option2'>AM
                                                                                        </option>
                                                                                    </Select>
                                                                                </GridItem>
                                                                            </Grid>
                                                                        </Flex>

                                                                        <Flex direction={'column'}
                                                                              className={'custom-time'}>
                                                                            <Text fontSize={'13px'} fontWeight={500}
                                                                                  mb={2}
                                                                                  color={'#0A101D'}
                                                                                  letterSpacing={'-0.13px'}
                                                                                  lineHeight={'normal'}>Date</Text>

                                                                            <Grid templateColumns='repeat(3, 1fr)'
                                                                                  gap={3}>
                                                                                <GridItem w='100%'>
                                                                                    <Select
                                                                                        border={'1px solid #E5E7EB'}
                                                                                        fontSize={'13px'}
                                                                                        fontWeight={400}
                                                                                        lineHeight={1} h={'auto'}
                                                                                        backgroundColor={'#FFFFFF'}
                                                                                        borderRadius={8}>
                                                                                        {monthArray && monthArray.map((item: string, index: number) => (
                                                                                            <option value={item}
                                                                                                    key={index}>{item}</option>
                                                                                        ))}
                                                                                    </Select>
                                                                                </GridItem>
                                                                                <GridItem w='100%'>
                                                                                    <Input
                                                                                        border={'1px solid #E5E7EB'}
                                                                                        fontSize={'13px'}
                                                                                        fontWeight={400}
                                                                                        lineHeight={1}
                                                                                        padding={'10px 16px'}
                                                                                        h={'auto'}
                                                                                        backgroundColor={'#FFFFFF'}
                                                                                        borderRadius={8}
                                                                                        placeholder='23'/>
                                                                                </GridItem>
                                                                                <GridItem w='100%'>
                                                                                    <Input
                                                                                        border={'1px solid #E5E7EB'}
                                                                                        fontSize={'13px'}
                                                                                        fontWeight={400}
                                                                                        lineHeight={1}
                                                                                        padding={'10px 16px'}
                                                                                        h={'auto'}
                                                                                        backgroundColor={'#FFFFFF'}
                                                                                        borderRadius={8}
                                                                                        placeholder='2023'/>
                                                                                </GridItem>
                                                                            </Grid>
                                                                        </Flex>

                                                                        <Flex w={'100%'} pt={4} pb={3} gap={3}
                                                                              justify={'flex-end'}
                                                                              borderTop={'1px solid #F3F4F6'}>
                                                                            <Button className={'custom-time-date'}
                                                                                    border={'1px solid #374151'}
                                                                                    lineHeight={1} borderRadius={8}
                                                                                    color={'#374151'} h={'auto'}
                                                                                    backgroundColor={'#FFFFFF'}
                                                                                    fontSize={'14px'}
                                                                                    padding={'10px 12px'}>
                                                                                Cancel </Button>

                                                                            <Button className={'schedule-button'}
                                                                                    border={'1px solid #374151'}
                                                                                    lineHeight={1} borderRadius={8}
                                                                                    color={'#FFFFFF'} h={'auto'}
                                                                                    backgroundColor={'#1F2937'}
                                                                                    fontSize={'14px'}
                                                                                    padding={'10px 12px'}>
                                                                                Schedule </Button>
                                                                        </Flex>
                                                                    </Flex>
                                                                </Flex>
                                                            </Flex>
                                                        </MenuList>
                                                    </Menu>
                                                </Flex>
                                            </Flex>
                                        </MenuList>
                                    </Menu>
                                    <Modal isOpen={isOpen} onClose={onClose} isCentered={true}
                                           scrollBehavior={'outside'}>
                                        <ModalOverlay/>
                                        <ModalContent minHeight="440px">
                                            <ModalHeader display="flex" justifyContent="space-between"
                                                         alignItems="center">
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
                            </Flex>
                            )
                            }
