// import {
//     Box,
//     Button,
//     Flex,
//     GridItem,
//     Heading,
//     Input,
//     Menu,
//     MenuButton,
//     MenuItem,
//     MenuList,
//     Text, Textarea
// } from "@chakra-ui/react";
// import styles from "@/styles/project.module.css";
// import {
//     ChevronDownIcon,
//     ChevronUpIcon,
//     CloseIcon,
//     InfoOutlineIcon,
//     TriangleDownIcon,
//     WarningIcon
// } from "@chakra-ui/icons";
// import {ArchiveIcon, FileIcon, LinkIcon, TextIcon, TimeSnoozeIcon, TrashIcon} from "@/icons";
// import Image from "next/image";
// import React from "react";
//
//
// export function ProjectReplyBox() {
//     return (
//         <>
//             <GridItem w='100%' h='100%'>
//                 <Box border={'1px solid rgba(8, 22, 47, 0.16)'} borderRadius={'16px'} h={'100%'}
//                      backgroundColor={'#ffffff'} className={styles.mailBox}>
//                     {/*<Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'} height={'100%'}>*/}
//                     {/*    <Heading as='h3' size='md'>Click on a thread from list to view messages!</Heading>*/}
//                     {/*</Flex>*/}
//
//                     <Flex flexDir={'column'} height={'100%'}>
//                         <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
//                               borderBottom={'1px solid rgba(8, 22, 47, 0.1)'} flex={'none'}
//                               padding={'12px 20px'}>
//                             <Flex alignItems={'center'} gap={2}>
//                                 <div className={styles.closeIcon}><CloseIcon/></div>
//                                 <div className={styles.actionIcon}><ChevronUpIcon/></div>
//                                 <div className={styles.actionIcon}><ChevronDownIcon/></div>
//                             </Flex>
//                             <Flex alignItems={'center'} gap={3} className={styles.headerRightIcon}>
//                                 <div><ArchiveIcon/></div>
//                                 <div><TrashIcon/></div>
//                                 <div><TimeSnoozeIcon/></div>
//                                 <div><WarningIcon className={styles.colorGray}/></div>
//                             </Flex>
//                         </Flex>
//
//                         <Flex direction={'column'} flex={'1'} padding={'24px 20px 20px'}>
//                             <Flex align={'center'} gap={2}>
//                                 <div className={styles.imgWrapper}>
//                                     <Image src={'/image/user.png'} alt={''} width={50} height={50}/>
//                                 </div>
//                                 <Flex direction={'column'} width={'100%'}>
//                                     <Flex align={'center'} gap={'4'} justify={'space-between'}
//                                           paddingBottom={'2px'}>
//                                         <Heading as='h4' fontSize={'15px'} color={'#000000'}>What’s the next
//                                             project phase?</Heading>
//                                         <Text fontSize='11px' color={'0,0,0, 0.4'}>7m ago</Text>
//                                     </Flex>
//                                     <Text fontSize='13px' color={'#000000'} fontWeight={'400'}>Michael Eisner to
//                                         Lee Clow and 4 others</Text>
//                                 </Flex>
//                             </Flex>
//                             <Flex mt={6} flex={1} overflowY={'auto'} maxHeight={'calc(100vh - 580px)'}>
//                                 <div className={styles.mailBoxBackground}>
//                                     <Text color={'#4A4A4A'} fontSize='md' fontWeight={'400'} lineHeight={'1.5'}>Lee, we’re gearing up to
//                                         launch the next Toy Story. Can you spin up a team to start thinking about the
//                                         entire launch execution, especially getting the launch to spread via organic
//                                         social (TikTok)? </Text>
//                                 </div>
//                             </Flex>
//                             <Flex direction={'column'} gap={4}>
//                                 <Flex align={'center'} className={styles.replyButton} gap={2}>
//                                     <Menu>
//                                         <MenuButton backgroundColor={'transparent'} height={'auto'} padding={'0'} fontSize={'13px'} as={Button} rightIcon={<TriangleDownIcon />}> Reply </MenuButton>
//                                         <MenuList>
//                                             <MenuItem>Download</MenuItem>
//                                             <MenuItem>Create a Copy</MenuItem>
//                                             <MenuItem>Mark as Draft</MenuItem>
//                                             <MenuItem>Delete</MenuItem>
//                                             <MenuItem>Attend a Workshop</MenuItem>
//                                         </MenuList>
//                                     </Menu>
//                                     <Input fontSize={'13px'} border={0} backgroundColor={'transparent'} padding={'0'} h={'auto'} borderRadius={0} placeholder='to Lee Clow @chiat.com and 4 others' />
//                                 </Flex>
//                                 <Flex direction={'column'} border={'1px solid #E5E5E5'} borderRadius={'8px'}>
//                                     <div className={styles.replyBoxTags}>
//                                         <Flex justifyContent={'space-between'} padding={'8px 10px'}
//                                               borderBottom={'1px solid #E5E5E5'}>
//                                             <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>
//                                                 <Heading as={'h1'} size={'sm'} fontSize={'13px'} fontWeight={'500'} paddingTop={1} marginRight={1}>CC:</Heading>
//                                                 <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
//                                                     <Button color={'#08162F'} borderColor={'none'} backgroundColor={'rgba(0, 0, 0, 0.04)'}
//                                                             className={`${styles.buttonClass} ${styles.ButtonClassBorder}`} borderRadius={20}
//                                                             padding={'3px 10px'} fontSize={'12px'}
//                                                             rightIcon={<CloseIcon width={'10px !important'}/>}
//                                                             height={'fit-content'}>Design Team</Button>
//                                                     <Button color={'#08162F'} borderColor={'none'} backgroundColor={'rgba(0, 0, 0, 0.04)'}
//                                                             className={styles.buttonClass} borderRadius={20}
//                                                             padding={'3px 10px'} fontSize={'12px'}
//                                                             rightIcon={<CloseIcon width={'10px !important'}/>}
//                                                             height={'fit-content'}>Design Team</Button>
//                                                     <Button color={'#08162F'} borderColor={'none'} backgroundColor={'rgba(0, 0, 0, 0.04)'}
//                                                             className={styles.buttonClass} borderRadius={20}
//                                                             padding={'3px 10px'} fontSize={'12px'}
//                                                             rightIcon={<CloseIcon width={'10px !important'}/>}
//                                                             height={'fit-content'}>Design Team</Button>
//
//                                                     <Input width={'auto'} padding={0} height={'23px'} flex={1}
//                                                            fontSize={'12px'} border={0} className={styles.ccInput}
//                                                            placeholder={'Recipient\'s Email'} />
//                                                 </Flex>
//                                                 <InfoOutlineIcon cursor={'pointer'}/>
//                                             </Flex>
//                                         </Flex>
//                                         <Flex direction={'column'} p={4}>
//                                             <Textarea p={0} border={0} borderRadius={0} className={styles.replayBoxTextArea} fontSize={'13px'} color={'#000000'} resize={'none'} fontWeight={'500'} placeholder='Here is a sample placeholder' />
//                                             <Flex align={'flex-end'} justify={"space-between"} gap={2} order={1}>
//
//                                                 <Flex align={'center'} gap={3} className={styles.replyBoxIcon}>
//                                                     <FileIcon/>
//                                                     <input type='file' id='file' style={{display: 'none'}}/>
//                                                     <LinkIcon/>
//                                                     <TextIcon/>
//                                                     {/*<EmojiIcon/>*/}
//                                                 </Flex>
//
//                                                 <Flex align={'center'} className={styles.replyButtonBottom}>
//                                                     <Button className={styles.replayTextButton} fontSize={'14px'} colorScheme='blue'> Reply all </Button>
//                                                     <Menu>
//                                                         <MenuButton className={styles.replayArrowIcon} as={Button} aria-label='Options'
//                                                                     variant='outline'><ChevronDownIcon/></MenuButton>
//                                                         <MenuList>
//                                                             <MenuItem> Send Later </MenuItem>
//                                                         </MenuList>
//                                                     </Menu>
//
//                                                 </Flex>
//
//                                             </Flex>
//                                         </Flex>
//                                     </div>
//                                 </Flex>
//                             </Flex>
//                         </Flex>
//                     </Flex>
//                 </Box>
//             </GridItem>
//         </>
//     )
// }
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
                        items: !isCompose ? (draft ? draft.to : [selectedMessage.from]) : [],
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

            // setEmailBody('');
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
                recipients: {items: !isCompose && selectedMessage ? [selectedMessage.from] : [], value: ''}
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
    //
    // useEffect(() => {
    //     if (sendDraftSuccess) {
    //         let successObject = {
    //             desc: isOpen ? 'Message is scheduled successfully!' : 'Successful',
    //             type: 'success'
    //         }
    //         if (isOpen) {
    //             onClose();
    //         }
    //         Toaster(successObject)
    //     }
    // }, [isOpen, onClose, sendDraftSuccess])

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
                            <Heading as={'h1'} size={'sm'} paddingTop={1} marginRight={1}>TO:</Heading>
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
