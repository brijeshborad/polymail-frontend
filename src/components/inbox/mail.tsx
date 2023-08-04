import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {Box, Flex, Heading, Text, Button, Tooltip, Textarea, Input, Spinner} from "@chakra-ui/react";
import {ChevronDownIcon, ChevronUpIcon, CloseIcon, InfoOutlineIcon, TriangleDownIcon} from "@chakra-ui/icons";
import {Time} from "@/components";
import {ArchiveIcon, FolderIcon, TrashIcon, TimeSnoozeIcon, FileIcon, LinkIcon, TextIcon, EmojiIcon} from "@/icons";
import Image from "next/image";
import {Chip} from "@/components/chip";
import {MailTabProps, StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getAllMessages, getMessageParts} from "@/redux/messages/action-reducer";
import {getSyncAccount} from "@/redux/accounts/action-reducer";
import {Message} from "@/models";
import {SpinnerUI} from '@/components/spinner'
export function Mail(props: MailTabProps) {

    const [content, setContent] = useState<Message>(null);
    const [index, setIndex] = useState<number | null>(null);
    const [showLoader, setShowLoader] = useState<boolean>(false);
    const {messages, error, message} = useSelector((state: StateType) => state.messages);
    const {account, selectedAccount} = useSelector((state: StateType) => state.accounts);

    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedAccount && selectedAccount.id) {
            dispatch(getSyncAccount({id: selectedAccount.id}));
        }
    }, [selectedAccount])

    useEffect(() => {
        if (account) {
            console.log('--------------=========' , account)
        }

    }, [account])

    const getAllThreadMessages = useCallback(() => {
        dispatch(getAllMessages({thread: props.id}));
    }, [dispatch, props.id])

    useEffect(() => {
        if (props.id) {
            setIndex(null)
            getAllThreadMessages();
        }
    }, [props.id, getAllThreadMessages])

    useEffect(() => {
        if (messages && messages.length > 0) {
            setIndex(val => !val ? messages.length - 1 : val);
        }
    }, [messages])
    const [emailPart, setEmailPart] = useState("");

    useEffect(() => {
        if (message && message.data) {
            let decoded = Buffer.from(message.data, 'base64').toString('ascii');
            setEmailPart(decoded);
            setShowLoader(true)
        }
    }, [message])

    useEffect(() => {
        if (index !== null) {
            setContent(messages[index]);
        }
    }, [index, messages])
    useEffect(() => {
        if (content) {
            dispatch(getMessageParts({id: content.id}));

        }
    }, [content])

    const showPreThreads = (type) => {
        if (type === 'up') {
            if (index > 0) {
                setIndex(prevState => prevState - 1);
            }
        } else if (type === 'down') {
            if (messages.length - 1 !== index) {
                setIndex(prevState => prevState + 1);
            }
        }
    }

    const [state, setState] = useState({
        items: [],
        value: "",
        error: null
    });

    const [bcc, setBcc] = useState({
        items: [],
        value: "",
        error: null
    });

    const [recipients, setRecipients] = useState({
        items: [],
        value: "",
        error: null
    });


    const isInList = (email, type) => {
        if (type == 'cc') {
            return state?.items?.includes(email);
        } else if (type === 'bcc') {
            return bcc?.items?.includes(email);
        } else if (type === 'recipients') {
            return bcc?.items?.includes(email);
        }
    }
    const isEmail = (email) => {
        return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email);
    }
    const isValid = (email, type) => {
        let error = null;
        if (isInList(email, type)) {
            error = `This email has already been added.`;
        }

        if (!isEmail(email)) {
            error = `This email has not been valid.`;
        }

        if (error) {
            if (type === 'cc') {
                setState((prevState) => ({
                    items: [...prevState.items],
                    value: prevState.value,
                    error: error
                }));
            } else if (type === 'bcc') {
                setBcc((prevState) => ({
                    items: [...prevState.items],
                    value: prevState.value,
                    error: error
                }));
            } else if (type === 'recipients') {
                setRecipients((prevState) => ({
                    items: [...prevState.items],
                    value: prevState.value,
                    error: error
                }));
            }
            return false;
        }

        return true;
    }

    const handleChange = (evt) => {
        setState(prevState => {
            return {
                items: [...prevState.items],
                value: evt.target.value,
                error: null
            }
        });
    };
    const handlePaste = (evt) => {
        evt.preventDefault();

        let paste = evt.clipboardData.getData("text");
        let emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g);

        if (emails) {
            let toBeAdded = emails.filter(email => !isInList(email, 'cc'));
            setState((prevState) => ({
                items: [...prevState.items, ...toBeAdded],
                value: "",
                error: null
            }));
        }
    };
    const handleKeyDown = evt => {
        if (["Enter", "Tab"].includes(evt.key)) {
            evt.preventDefault();
            let value = state.value.trim();
           let emailArray = value.split(',');
            emailArray.map(item => {
                if (item && isValid(item, 'cc')) {
                    setState((prevState) => ({
                        items: [...prevState.items, item],
                        value: "",
                        error: null
                    }));
                }
            })
        }
    };
    const handleDelete = (item) => {
         setState({
             items: state.items.filter(i => i !== item),
             value: "",
             error: null
         });
     };


    const handleBcc = (evt) => {
        setBcc(prevState => {
            return {
                items: [...prevState.items],
                value: evt.target.value,
                error: null
            }
        });
    };
    const handlePasteBcc = evt => {
        evt.preventDefault();

        let paste = evt.clipboardData.getData("text");
        let emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g);

        if (emails) {
            let toBeAdded = emails.filter(email => !isInList(email, 'bcc'));
            setBcc((prevState) => ({
                items: [...prevState.items, ...toBeAdded],
                value: "",
                error: null
            }));
        }
    };
    const handleKeyDownBcc = evt => {
        if (["Enter", "Tab"].includes(evt.key)) {
            evt.preventDefault();
            let value = bcc.value.trim();
            let emailArray = value.split(',');
            emailArray.map(item => {
                if (item && isValid(item, 'bcc')) {
                    setBcc((prevState) => ({
                        items: [...prevState.items, item],
                        value: "",
                        error: null
                    }));
                }
            })
        }
    };
    const handleDeleteBcc = (item) => {
        setBcc({
            items: bcc.items.filter(i => i !== item),
            value: "",
            error: null
        });
    };


    const handleRecipients = (evt) => {
        setRecipients(prevState => {
            return {
                items: [...prevState.items],
                value: evt.target.value,
                error: null
            }
        });
    };
    const handlePasteRecipients = evt => {
        evt.preventDefault();

        let paste = evt.clipboardData.getData("text");
        let emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g);

        if (emails) {
            let toBeAdded = emails.filter(email => !isInList(email, 'recipients'));
            setRecipients((prevState) => ({
                items: [...prevState.items, ...toBeAdded],
                error: null,
                value: ''
            }));
        }
    };
    const handleKeyDownRecipients = evt => {
        if (["Enter", "Tab"].includes(evt.key)) {
            evt.preventDefault();
            let value = recipients.value.trim();
            let emailArray = value.split(',');
            emailArray.map(item => {
                if (item && isValid(item, 'recipients')) {
                    setRecipients((prevState) => ({
                        items: [...prevState.items, item],
                        value: "",
                        error: null,
                    }));
                }
            })
        }
    };
    const handleDeleteRecipients = (item) => {
        setRecipients({
            items: recipients.items.filter(i => i !== item),
            value: "",
            error: null,
        });
    };

    const [email, setEmail] = useState<string>('');

    const addReplayEmail = (event) => {
        if (!isEmail(event.target.value)) {
            return `${event.target.value} is not a valid email address.`;
        } else {
            setEmail(event.target.value);
        }
    }
    return (
        <Box className={styles.mailBox}>
            <Flex className={styles.mailBoxHeight} justifyContent={'space-between'} flexDir={'column'} height={'100%'}>
                <div>
                    <div>
                        <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                              borderBottom={'1px solid rgba(8, 22, 47, 0.1)'}
                              marginBottom={'15'} padding={'12px 20px'}>
                            <Flex alignItems={'center'} gap={2}>
                                <div className={styles.closeIcon} onClick={() => props.show(false)}><CloseIcon/></div>
                                <div className={`${styles.actionIcon} ${index === 0 ? styles.disabled : ''}`}
                                     onClick={() => showPreThreads('up')}><ChevronUpIcon/></div>
                                <div
                                    className={`${styles.actionIcon} ${messages?.length - 1 !== index ? '' : styles.disabled}`}
                                    onClick={() => showPreThreads('down')}><ChevronDownIcon/></div>


                            </Flex>
                            <Flex alignItems={'center'} gap={3} className={styles.headerRightIcon}>
                                {showLoader && <Text className={styles.totalMessages}>
                                    {index + 1} / {messages.length}
                                </Text>}
                                <Button className={styles.addToProject} leftIcon={<FolderIcon/>}>Add to Project <span
                                    className={styles.RightContent}>⌘P</span></Button>
                                <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>
                                    <div>
                                        <ArchiveIcon/>
                                    </div>
                                </Tooltip>
                                <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>
                                    <div>
                                        <TrashIcon/>
                                    </div>
                                </Tooltip>
                                <Tooltip label='Snooze' placement='bottom' bg='gray.300' color='black'>
                                    <div>
                                        <TimeSnoozeIcon/>
                                    </div>
                                </Tooltip>

                            </Flex>
                        </Flex>
                        {!showLoader && <SpinnerUI />}
                        {showLoader && <Flex alignItems={'center'} wrap={'wrap'} justifyContent={'space-between'} gap={2}
                                           padding={'10px 20px'}>
                            <Flex alignItems={'center'}>
                                <Image src={'/image/user.png'} alt={''} width={50} height={50}/>
                                <Flex flexDir={'column'} marginLeft={'5'}>
                                    <Heading as='h4' size='md'>{content?.subject || ''}</Heading>
                                    <Text fontSize='sm'>Michel Eisner to Lee Clow and 4 others</Text>
                                </Flex>
                            </Flex>
                            <div className={styles2.receiveTime}>
                                <Time time={content?.created || ''}/>
                            </div>
                        </Flex> }
                    </div>
                    {showLoader && <div className={styles.mailBody}>
                        <div dangerouslySetInnerHTML={{__html: emailPart}} >
                        </div>
                    </div>}

                </div>
                <div className={styles.mailFooter}>
                    <Flex marginBottom={4} className={styles.mailReplay}>
                        <Heading as={'h1'} pt={'6px'} size={'sm'}>Reply</Heading>
                        <TriangleDownIcon mt={'9px'} />
                        <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} className={styles.replyBoxCC}>
                            {!!recipients?.items?.length && recipients.items.map(item => (
                                <Chip text={item} click={() => handleDeleteRecipients(item)}/>
                            ))}

                            <Input width={'auto'} padding={0} height={'23px'}
                                   fontSize={'12px'}
                                   value={recipients.value}
                                   onKeyDown={handleKeyDownRecipients}
                                   onChange={handleRecipients}
                                   onPaste={handlePasteRecipients}
                                   border={0} className={styles.ccInput}
                                   placeholder={'Recipient\'s Email'}
                            />
                            {recipients.error && <p className={styles.error}>{recipients.error}</p>}
                        </Flex>
                    </Flex>
                    <Box className={styles.replyBox}>
                        {/*<Flex justifyContent={'space-between'} padding={'8px 10px'}*/}
                        {/*      borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>*/}
                        {/*    <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>*/}
                        {/*        <Heading as={'h1'} size={'sm'} pt={'6px'} marginRight={1}>CC:</Heading>*/}
                        {/*        <Flex alignItems={'center'} wrap={'wrap'} width={'100%'}>*/}
                        {/*            {!!state?.items?.length && state.items.map(item => (*/}
                        {/*                <Chip text={item} click={() => handleDelete(item)}/>*/}
                        {/*            ))}*/}

                        {/*            <Input width={'auto'} padding={0} height={'23px'}*/}
                        {/*                   fontSize={'12px'}*/}
                        {/*                   value={state.value}*/}
                        {/*                   onKeyDown={handleKeyDown}*/}
                        {/*                   onChange={handleChange}*/}
                        {/*                   onPaste={handlePaste}*/}
                        {/*                   border={0} className={styles.ccInput}*/}
                        {/*            />*/}
                        {/*            {state.error && <p className={styles.error}>{state.error}</p>}*/}
                        {/*        </Flex>*/}
                        {/*    </Flex>*/}
                        {/*    <InfoOutlineIcon/>*/}
                        {/*</Flex>*/}

                        {/*<Flex alignItems={'center'} justifyContent={'space-between'} padding={'8px 10px'}*/}
                        {/*      borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>*/}
                        {/*    <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>*/}
                        {/*        <Heading as={'h1'} pt={'6px'} size={'sm'} marginRight={1}>BCC:</Heading>*/}
                        {/*        <Flex alignItems={'center'} wrap={'wrap'} width={'100%'}>*/}
                        {/*            {!!bcc?.items?.length && bcc.items.map(item => (*/}
                        {/*                <Chip text={item} click={() => handleDeleteBcc(item)}/>*/}
                        {/*            ))}*/}

                        {/*            <Input*/}
                        {/*                width={'auto'} padding={0} height={'23px'}*/}
                        {/*                fontSize={'12px'}*/}
                        {/*                value={bcc.value}*/}
                        {/*                placeholder=""*/}
                        {/*                onKeyDown={handleKeyDownBcc}*/}
                        {/*                onChange={handleBcc}*/}
                        {/*                onPaste={handlePasteBcc}*/}
                        {/*                border={0} className={styles.ccInput}*/}
                        {/*            />*/}
                        {/*            {bcc.error && <p className={styles.error}>{bcc.error}</p>}*/}
                        {/*        </Flex>*/}

                        {/*    </Flex>*/}
                        {/*    <InfoOutlineIcon/>*/}
                        {/*</Flex>*/}


                        <div className={styles.replayMessage}>

                            <Textarea className={styles.replayMessageArea} padding={0}
                                      placeholder='Reply with anything you like or @mention someone to share this thread'/>
                            <Flex align={'flex-end'} justify={"space-between"} gap={2}>
                                <Flex align={'center'} gap={3}>
                                    <FileIcon/>
                                    <LinkIcon/>
                                    <TextIcon/>
                                    <EmojiIcon/>
                                </Flex>
                                <Button className={styles.replyButton} colorScheme='blue'
                                        rightIcon={<ChevronDownIcon/>}>Reply all</Button>
                            </Flex>
                        </div>
                    </Box>
                </div>
            </Flex>
        </Box>
    )
}
