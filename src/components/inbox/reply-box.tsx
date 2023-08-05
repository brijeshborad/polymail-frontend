import styles from "@/styles/Inbox.module.css";
import {Box, Button, Flex, Heading, Input, Textarea} from "@chakra-ui/react";
import {Chip} from "@/components/chip";
import {ChevronDownIcon, InfoOutlineIcon} from "@chakra-ui/icons";
import {EmojiIcon, FileIcon, LinkIcon, TextIcon} from "@/icons";
import React, {useEffect, useState} from "react";
import {createDraft, sendMessage, updatePartialMessage} from "@/redux/messages/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";


export function ReplyBox(props) {
    const [isToEmailAdded, setIsToEmailAdded] = useState<boolean>(false);
    const [emailBody, setEmailBody] = useState<any>(null);
    const {account, selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {message, selectedMessage, draft} = useSelector((state: StateType) => state.messages);

    const dispatch = useDispatch();

    const [recipients, setRecipients] = useState({
        items: [],
        value: "",
        error: null
    });
    const [cc, setCC] = useState({
        items: [],
        value: "",
        error: null
    });
    const [bcc, setBcc] = useState({
        items: [],
        value: "",
        error: null
    })

    useEffect(() => {
        if (recipients && recipients.items && recipients.items.length && emailBody) {
            setIsToEmailAdded(true);
        } else {
            setIsToEmailAdded(false)
        }
    }, [recipients, emailBody])

    useEffect(() => {
        if (props.currentMessage) {
            setRecipients((prevState) => ({
                items: [props.currentMessage.from],
                value: prevState.value,
                error: prevState.error
            }));
            setEmailBody(null);
        }

    }, [props.currentMessage])

    const isInList = (email, type) => {
        if (type == 'cc') {
            return cc?.items?.includes(email);
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
                setCC((prevState) => ({
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
        setCC(prevState => {
            return {
                items: [...prevState.items],
                value: evt.target.value,
                error: null
            }
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

    const handlePaste = (evt) => {
        evt.preventDefault();

        let paste = evt.clipboardData.getData("text");
        let emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g);

        if (emails) {
            let toBeAdded = emails.filter(email => !isInList(email, 'cc'));
            setCC((prevState) => ({
                items: [...prevState.items, ...toBeAdded],
                value: "",
                error: null
            }));
        }
    };

    const handleKeyDown = evt => {
        if (["Enter", "Tab"].includes(evt.key)) {
            evt.preventDefault();
            let value = cc.value.trim();
            let emailArray = value.split(',');
            emailArray.map(item => {
                if (item && isValid(item, 'cc')) {
                    setCC((prevState) => ({
                        items: [...prevState.items, item],
                        value: "",
                        error: null
                    }));
                }
            })
        }
    };

    const handleDelete = (item) => {
        setCC({
            items: cc.items.filter(i => i !== item),
            value: "",
            error: null
        });
    };

    const sendToDraft = (event) => {
        setEmailBody(event.target.value);

        if (selectedAccount && selectedAccount.id) {
            if (draft && draft.id) {
                let body = {
                    subject: selectedMessage.subject,
                    to: recipients?.items,
                    body: event.target.value,
                }

                dispatch(updatePartialMessage({id: draft.id, body}));
            } else {
                dispatch(createDraft({id: selectedAccount.id}));
            }
        }
    }

    const sendMessages = () => {
        if (draft && draft.id) {
            dispatch(sendMessage({id: draft.id}));
            setRecipients({
                items: [],
                value: "",
                error: null
            })
            setEmailBody(null)
        }
    }


    return (
        <div className={styles.mailFooter}>
            <Flex marginBottom={4} className={styles.mailReply} alignItems={'center'}>
                <Heading as={'h1'} pr={'10px'} size={'sm'}>To</Heading>
                {/*<TriangleDownIcon mt={'9px'}/>*/}
                <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} className={styles.replyBoxCC} gap={2}>
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
                <Flex justifyContent={'space-between'} padding={'8px 10px'}
                      borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>
                    <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>
                        <Heading as={'h1'} size={'sm'} pt={'6px'} marginRight={1}>CC:</Heading>
                        <Flex alignItems={'center'} wrap={'wrap'} width={'100%'}>
                            {!!cc?.items?.length && cc.items.map(item => (
                                <Chip text={item} click={() => handleDelete(item)}/>
                            ))}

                            <Input width={'auto'} padding={0} height={'23px'}
                                   fontSize={'12px'}
                                   value={cc.value}
                                   onKeyDown={handleKeyDown}
                                   onChange={handleChange}
                                   onPaste={handlePaste}
                                   border={0} className={styles.ccInput}
                            />
                            {cc.error && <p className={styles.error}>{cc.error}</p>}
                        </Flex>
                    </Flex>
                    <InfoOutlineIcon/>
                </Flex>

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
                              placeholder='Reply with anything you like or @mention someone to share this thread'
                                value={emailBody}
                              onBlur={(e) => sendToDraft(e)}
                    />

                    <Flex align={'flex-end'} justify={"space-between"} gap={2}>
                        <Flex align={'center'} gap={3}>
                            <FileIcon/>
                            <LinkIcon/>
                            <TextIcon/>
                            <EmojiIcon/>
                        </Flex>
                        <Flex align={'center'} gap={2}>
                            <Button className={styles.replyButton} colorScheme='blue'
                                    onClick={() => sendMessages()} isDisabled={!isToEmailAdded}
                                    rightIcon={<ChevronDownIcon/>}>Reply all</Button>
                        </Flex>
                    </Flex>
                </div>
            </Box>
        </div>
    )
}
