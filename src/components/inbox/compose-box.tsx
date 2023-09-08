import {
    Box,
    Button, createStandaloneToast,
    Flex, Heading, Input, InputGroup, InputLeftElement, Menu, MenuButton, MenuItem, MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text, useDisclosure
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {DisneyIcon, FileIcon, FolderIcon, LinkIcon, TextIcon} from "@/icons";
import {ChevronDownIcon, CloseIcon, SearchIcon, SmallAddIcon} from "@chakra-ui/icons";
import React, {ChangeEvent, ChangeEventHandler, useEffect, useRef, useState} from "react";
import {StateType} from "@/types";
import {debounce, isEmail} from "@/utils/common.functions";
import {Chip, RichTextEditor, Time, Toaster} from "@/components/common";
import {createDraft, sendMessage, updateDraftState, updatePartialMessage} from "@/redux/draft/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import dayjs from "dayjs";
import {uploadAttachment} from "@/redux/messages/action-reducer";
import {SingleDatepicker} from "chakra-dayzed-datepicker";
import {MessageAttachments, Project} from "@/models";
import CreateNewProject from "@/components/project/create-new-project";

declare type RecipientsValue = { items: string[], value: string };
declare type RecipientsType = { cc: RecipientsValue, bcc: RecipientsValue, recipients: RecipientsValue };
export function ComposeBox(props: any) {
    const [emailRecipients, setEmailRecipients] = useState<RecipientsType>({
        cc: {items: [], value: ""},
        bcc: {items: [], value: ""},
        recipients: {items: [], value: ""},
    })
    const [subject, setSubject] = useState<string>('');
    const [emailBody, setEmailBody] = useState<string>('');
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const { draft } = useSelector((state: StateType) => state.draft);
    const dispatch = useDispatch();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {isOpen: isOpenProject, onOpen: onOpenProject, onClose: onCloseProject} = useDisclosure();
    const [scheduledDate, setScheduledDate] = useState<Date>();
    const {toast} = createStandaloneToast()
    const [attachments, setAttachments] = useState<MessageAttachments[]>([]);
    const inputFile = useRef<HTMLInputElement | null>(null)
    let {projects} = useSelector((state: StateType) => state.projects);

    useEffect(() => {
        if (props.messageDetails) {
            const { subject, to, cc, bcc, draftInfo } = props.messageDetails;

            if (subject) {
                setSubject(subject)
            }

            if (to && to.length) {
                setEmailRecipients((prevState) => ({
                    ...prevState,
                    recipients: {
                        items: to,
                        value: ''
                    }
                }));
            }
            if (cc && cc.length) {
                setEmailRecipients((prevState) => ({
                    ...prevState,
                    cc: {
                        items: cc,
                        value: ''
                    }
                }));
            }
            if (bcc && bcc.length) {
                setEmailRecipients((prevState) => ({
                    ...prevState,
                    bcc: {
                        items: bcc,
                        value: ''
                    }
                }));            }


            if (draftInfo && draftInfo.body) {
                setEmailBody(draftInfo.body);
            }
        }
    }, [props.messageDetails])

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

    const addSubject = (event: ChangeEvent | any) => {
        setSubject(event.target.value || '');
    }

    const sendToDraft = (value: string, isValueUpdate: boolean = true) => {
        if (isValueUpdate) {
            setEmailBody(value);
        }

        let body = {
            subject: subject,
            to: emailRecipients.recipients?.items,
            cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
            bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
            draftInfo: {
                body: value
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
                                <Button onClick={() => undoClick('send-now')} height={"auto"} padding={'7px 15px'}>Send Now</Button>
                            </Box>
                        ),
                        position: 'bottom-left'
                    }
                    toast(undoToaster)
                }
            }
            dispatch(sendMessage({id: draft.id, ...params}));
            onClose();

            if (props.onClose) {
                props.onClose();
            }

            setEmailRecipients({
                cc: {items: [], value: ""},
                bcc: {items: [], value: ""},
                recipients: {items: [], value: ''}
            });
            setEmailBody('');
            setSubject('');
            dispatch(updateDraftState({
                draft: null,
            }));
        }
    }

    useEffect(() => {
        if (selectedAccount && selectedAccount.signature) {
            setEmailBody(selectedAccount.signature);
        }
    }, [selectedAccount])

    const openCalender = () => {
        onOpen();
        let today = new Date();
        today.setDate(today.getDate() + 1);
        setScheduledDate(today);
    }

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

    return (
        <>
            <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
                <ModalOverlay backgroundColor={'rgba(229, 231, 235, 0.50)'} backdropFilter={'blur(16px)'}/>
                <ModalContent className={styles.composeModal} maxWidth={'893px'} height={'708px'} maxHeight={'708px'}
                              borderRadius={16} border={'1px solid #E5E7EB'}>
                    <ModalHeader display={'flex'} borderBottom={'1px solid #E5E7EB'} color={'#0A101D'}
                                 fontWeight={'500'} fontSize={'12px'} padding={'18px 20px'}>Draft&nbsp;<Text display={'flex'} gap={'2px'} className={styles.mailSaveTime}
                        color={'#6B7280'} fontWeight={'400'}> (Saved to drafts {props.messageDetails ? <Time time={props.messageDetails?.created || ''} isShowFullTime={false} showTimeInShortForm={true}/> : '0 s'} ago)</Text></ModalHeader>
                    <ModalCloseButton color={'#6B7280'} fontSize={'13px'} top={'21px'} right={'20px'}/>
                    <ModalBody padding={0}>
                        <Flex direction={'column'} h={'100%'}>
                            <Flex align={'center'} justify={'space-between'} gap={3} padding={'16px 20px'}
                                  borderBottom={'1px solid #E5E7EB'}>
                                <Input className={styles.subjectInput} placeholder='Enter subject title' size='lg'  onChange={(e) => addSubject(e)}
                                       flex={1} fontWeight={'700'} padding={'0'} border={'0'} h={'auto'} defaultValue={subject || ''}
                                       borderRadius={'0'} lineHeight={1} color={'#0A101D'}/>
                                <Menu>
                                    <MenuButton className={styles.addToProject} leftIcon={<FolderIcon/>} borderRadius={'50px'}
                                                backgroundColor={'#2A6FFF'} color={'#FFFFFF'} as={Button}
                                                boxShadow={'0 0 3px 0 rgba(38, 109, 240, 0.12)'} padding={'4px 4px 4px 8px'}
                                                fontSize={'12px'} fontWeight={500} h={'fit-content'}>Add to Project <span className={styles.RightContent}>⌘P</span></MenuButton>
                                    <MenuList className={`${styles.addToProjectList} drop-down-list`}>

                                        <div className={'dropdown-searchbar'}>
                                            <InputGroup>
                                                <InputLeftElement h={'27px'} pointerEvents='none'>
                                                    <SearchIcon/>
                                                </InputLeftElement>
                                                <Input placeholder='Search project' />
                                            </InputGroup>
                                        </div>

                                        {projects && !!projects.length && (projects || []).map((item: Project, index: number) => (
                                            <MenuItem gap={2} key={index}>
                                                <DisneyIcon/> {item.name}
                                            </MenuItem>

                                        ))}

                                        <div className={styles.addNewProject}>
                                            <Button backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                                                    justifyContent={'flex-start'} onClick={onOpenProject}>
                                                <div className={styles.plusIcon}>
                                                    <SmallAddIcon/>
                                                </div>
                                                Create New Project
                                            </Button>
                                        </div>
                                    </MenuList>
                                </Menu>
                            </Flex>
                            <Box flex={'1'} p={5}>
                                <Flex direction={"column"} border={'1px solid #F3F4F6'} borderRadius={8} h={'100%'} padding={'16px'} gap={4}>
                                    <Flex flex={'none'} backgroundColor={'#FFFFFF'} border={'1px solid #E5E7EB'} direction={'column'} borderRadius={8}>
                                        <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                                            <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1} color={'#374151'}>To:</Heading>
                                            <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                                                {/*<Button className={styles.replyBoxCCTag} rightIcon={<ChevronDownIcon />}> Lee Clow </Button>*/}
                                                {/*<Input width={'auto'} padding={0} height={'20px'} flex={'1 0 auto'}*/}
                                                {/*       fontSize={'12px'} border={0} className={styles.ccInput} placeholder={'Recipient\'s Email'}/>*/}
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
                                            <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1} color={'#374151'}>CC:</Heading>
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
                                            <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1} color={'#374151'}>BCC:</Heading>
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
                                    </Flex>

                                    <Flex flex={1} direction={'column'} position={'relative'}>
                                        <Flex direction={'column'} className={styles.replyBoxEditor}>
                                            <RichTextEditor className={'reply-message-area'} initialUpdated={true}
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
                                        <Flex direction={'column'}>
                                            <Flex align={'flex-end'} justify={'space-between'} gap={2}>
                                                <Flex gap={2} className={styles.replyBoxIcon}>
                                                    <Flex align={'center'} gap={3}>
                                                        <FileIcon click={() => inputFile.current?.click()}/>
                                                        <input type='file' id='file' ref={inputFile} onChange={(e) => handleFileUpload(e)}
                                                               style={{display: 'none'}}/>
                                                        <LinkIcon/>
                                                        <TextIcon/>
                                                    </Flex>
                                                </Flex>
                                                <Flex align={'center'} className={styles.replyButton}>
                                                    <Button className={styles.replyTextButton} colorScheme='blue' onClick={() => sendMessages()}> Send </Button>
                                                    <Menu>
                                                        <MenuButton className={styles.replyArrowIcon} as={Button} aria-label='Options'
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
                                                                <SingleDatepicker
                                                                    date={scheduledDate}
                                                                    defaultIsOpen={true}
                                                                    onDateChange={setScheduledDate}
                                                                    name="date-input" />
                                                            </ModalBody>
                                                            <ModalFooter>
                                                                <Button variant='ghost' onClick={onClose}>Cancel</Button>
                                                                <Button colorScheme='blue' mr={3} onClick={() => sendMessages(true)}> Schedule </Button>
                                                            </ModalFooter>
                                                        </ModalContent>
                                                    </Modal>
                                                </Flex>
                                            </Flex>
                                        </Flex>

                                    </Flex>
                                </Flex>
                            </Box>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>

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

            <CreateNewProject onOpen={onOpenProject} isOpen={isOpenProject} onClose={onCloseProject}/>

        </>
    )
}
