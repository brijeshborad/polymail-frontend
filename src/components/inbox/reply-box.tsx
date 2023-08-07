import styles from "@/styles/Inbox.module.css";
import {Box, Button, Flex, Heading, Input, Textarea} from "@chakra-ui/react";
import {Chip} from "@/components/chip";
import {ChevronDownIcon, InfoOutlineIcon} from "@chakra-ui/icons";
import {EmojiIcon, FileIcon, LinkIcon, TextIcon} from "@/icons";
import React, {ChangeEvent, useEffect, useState} from "react";
import {createDraft, sendMessage, updateMessageState, updatePartialMessage} from "@/redux/messages/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {debounce, isEmail} from "@/utils/common.functions";
import {Toaster} from "@/components/toaster";

declare type RecipientsType = { items: (string | undefined)[], value: string };

export function ReplyBox() {
    const [isToEmailAdded, setIsToEmailAdded] = useState<boolean>(false);
    const [emailBody, setEmailBody] = useState<string>('');
    const [recipients, setRecipients] = useState<RecipientsType>({
        items: [],
        value: ""
    });
    const [cc, setCC] = useState<RecipientsType>({
        items: [],
        value: "",
    });

    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const { selectedMessage, draft, isCompose, success: sendDraftSuccess } = useSelector((state: StateType) => state.messages);

    const dispatch = useDispatch();

    const handleChange = (evt: ChangeEvent | any, type: string) => {
        if (type === 'recipients') {
            setRecipients(prevState => ({
                items: [...prevState.items],
                value: evt.target.value
            }));
        } else if (type === 'cc') {
            setCC(prevState => ({
                items: [...prevState.items],
                value: evt.target.value
            }));
        }
    };

    const handlePaste = (evt: ClipboardEvent | any, type: string) => {
        evt.preventDefault();

        let paste = evt.clipboardData.getData("text");
        let emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g);

        if (emails) {
            let toBeAdded = emails.filter((item: string) => !isInList(item, type));
            if (type === 'recipients') {
                setRecipients((prevState) => ({
                    items: [...prevState.items, ...toBeAdded],
                    value: ''
                }));
            } else if (type === 'cc') {
                setCC((prevState) => ({
                    items: [...prevState.items, ...toBeAdded],
                    value: ''
                }));
            }
        }
    };

    const handleKeyDown = (evt: KeyboardEvent | any, type: string) => {
        if (["Enter", "Tab"].includes(evt.key)) {
            evt.preventDefault();
            let value = '';
            if (type === 'recipients') {
                value = recipients.value.trim();
            }
            if (type === 'cc') {
                value = cc.value.trim();
            }
            let emailArray = value.split(',');
            emailArray.map(item => {
                if (item && isValid(item, type)) {
                    if (type === 'recipients') {
                        setRecipients((prevState) => ({
                            items: [...prevState.items, item],
                            value: "",
                        }));
                    }
                    if (type === 'cc') {
                        setCC((prevState) => ({
                            items: [...prevState.items, item],
                            value: "",
                        }));
                    }
                }
            })
        }
    };

    const handleItemDelete = (item: string, type: string) => {
        if (type === 'recipients') {
            setRecipients({
                items: recipients.items.filter(i => i !== item),
                value: ""
            });
        }
        if (type === 'cc') {
            setCC({
                items: recipients.items.filter(i => i !== item),
                value: ""
            });
        }
    };

    const sendToDraft = (event: ChangeEvent | any) => {
        setEmailBody(event.target.value);
        debounce(() => {
            if (selectedAccount && selectedAccount.id) {
                if (draft && draft.id) {
                    let body = {
                        subject: selectedMessage?.subject || 'New Mail Subject',
                        to: recipients?.items,
                        ...(cc?.items && cc?.items.length > 0 ? {cc: cc?.items} : {}),
                        draftInfo: {
                            body: emailBody
                        }
                    }
                    dispatch(updatePartialMessage({id: draft.id, body}));
                } else {
                    dispatch(createDraft({id: selectedAccount.id}));
                }
            }
        });
    }

    const isInList = (email: string, type: string) => {
        if (type == 'cc') {
            return cc?.items?.includes(email);
        } else if (type === 'recipients') {
            return recipients?.items?.includes(email);
        }
        return false;
    }

    const isValid = (email: string, type: string) => {
        let error = null;
        if (isInList(email, type)) {
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

    useEffect(() => {
        if (selectedMessage) {
            setRecipients((prevState) => ({
                items: !isCompose ? [selectedMessage.from] : [],
                value: prevState.value
            }));
            setEmailBody('');
        }
    }, [isCompose, selectedMessage])

    const sendMessages = () => {
        if (draft && draft.id) {
            dispatch(sendMessage({id: draft.id}));
            setRecipients({
                items: !isCompose && selectedMessage ? [selectedMessage.from] : [],
                value: "",
            });
            setCC({
                items: [],
                value: "",
            });
            setEmailBody('');
            dispatch(updateMessageState({
                draft: null,
                ...(isCompose ? {isCompose: false}: {})
            }));
        }
    }

    useEffect(() => {
        if (sendDraftSuccess) {
            let successObject = {
                desc: 'Successful',
                type: 'success'
            }
            Toaster(successObject)
        }
    }, [sendDraftSuccess])

    useEffect(() => {
        if (recipients && recipients.items && recipients.items.length && emailBody) {
            setIsToEmailAdded(true);
        } else {
            setIsToEmailAdded(false)
        }
    }, [recipients, emailBody])


    return (
        <div className={styles.mailFooter}>
            <Flex marginBottom={4} className={styles.mailReply} alignItems={'center'}>
                <Heading as={'h1'} pr={'10px'} size={'sm'}>To</Heading>
                <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} className={styles.replyBoxCC} gap={2}>
                    {!!recipients?.items?.length && recipients.items.map((item: string | undefined, i: number) => (
                        <Chip text={item} key={i} click={() => handleItemDelete(item!, 'recipients')}/>
                    ))}

                    <Input width={'auto'} padding={0} height={'23px'}
                           fontSize={'12px'}
                           value={recipients.value}
                           onKeyDown={(e) => handleKeyDown(e, 'recipients')}
                           onChange={(e) => handleChange(e, 'recipients')}
                           onPaste={(e) => handlePaste(e, 'recipients')}
                           border={0} className={styles.ccInput}
                           placeholder={'Recipient\'s Email'}
                    />
                </Flex>
            </Flex>

            <Box className={styles.replyBox}>
                <Flex justifyContent={'space-between'} padding={'8px 10px'}
                      borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>
                    <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>
                        <Heading as={'h1'} size={'sm'} pt={'6px'} marginRight={1}>CC:</Heading>
                        <Flex alignItems={'center'} wrap={'wrap'} width={'100%'}>
                            {!!cc?.items?.length && cc.items.map((item: string | undefined, i: number) => (
                                <Chip text={item} key={i} click={() => handleItemDelete(item!, 'cc')}/>
                            ))}

                            <Input width={'auto'} padding={0} height={'23px'}
                                   fontSize={'12px'}
                                   value={cc.value}
                                   onKeyDown={(e) => handleKeyDown(e, 'cc')}
                                   onChange={(e) => handleChange(e, 'cc')}
                                   onPaste={(e) => handlePaste(e, 'cc')}
                                   border={0} className={styles.ccInput}
                            />
                        </Flex>
                    </Flex>
                    <InfoOutlineIcon/>
                </Flex>

                <div className={styles.replyMessage}>
                    <Textarea className={styles.replyMessageArea} padding={0}
                              placeholder='Reply with anything you like or @mention someone to share this thread'
                              value={emailBody} onChange={(e) => sendToDraft(e)}
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
                                    rightIcon={<ChevronDownIcon/>}>{isCompose ? 'Send' : 'Reply all'}</Button>
                        </Flex>
                    </Flex>
                </div>
            </Box>
        </div>
    )
}
