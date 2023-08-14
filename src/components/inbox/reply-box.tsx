import styles from "@/styles/Inbox.module.css";
import {Button, Flex, Heading, Input} from "@chakra-ui/react";
import {Chip} from "@/components/chip";
import {ChevronDownIcon, CloseIcon, InfoOutlineIcon} from "@chakra-ui/icons";
import {EmojiIcon, FileIcon, LinkIcon, TextIcon} from "@/icons";
import React, {ChangeEvent, ChangeEventHandler, useEffect, useRef, useState} from "react";
import {createDraft, sendMessage, updateMessageState, updatePartialMessage} from "@/redux/messages/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {debounce, isEmail} from "@/utils/common.functions";
import {Toaster} from "@/components/toaster";
import RichTextEditor from "@/components/rich-text-editor";
// import {ReplyBoxType} from "@/types/props-types/replyBox.type";

declare type RecipientsType = { items: (string | undefined)[], value: string };

export function ReplyBox() {
    const [isToEmailAdded, setIsToEmailAdded] = useState<boolean>(false);
    const [emailBody, setEmailBody] = useState<string>('');
    const [hideCcFields, setHideCcFields] = useState<boolean>(false);
    const [hideBccFields, setHideBccFields] = useState<boolean>(false);
    const [recipients, setRecipients] = useState<RecipientsType>({
        items: [],
        value: ""
    });
    const [cc, setCC] = useState<RecipientsType>({
        items: [],
        value: "",
    });
    const [bcc, setBCC] = useState<RecipientsType>({
        items: [],
        value: "",
    });
    const [attachments, setAttachments] = useState<{ filename: string, data: string }[] | null>(null);

    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {selectedThread} = useSelector((state: StateType) => state.threads);
    const {
        selectedMessage,
        draft,
        isCompose,
        success: sendDraftSuccess
    } = useSelector((state: StateType) => state.messages);

    const inputFile = useRef<HTMLInputElement | null>(null)

    const dispatch = useDispatch();
    // useEffect(() => {
    //     console.log('accounts' , accounts)
    //     if (accounts && accounts[0].signature) {
    //         setEmailBody(accounts[0].signature);
    //     }
    // }, [accounts])
    useEffect(() => {
        setHideCcFields(false)
        setCC({
            items: [],
            value: ""
        });
    }, [])

    useEffect(() => {
        setHideBccFields(false)
        setBCC({
            items: [],
            value: ""
        });
    }, [])

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
        } else if (type === 'bcc') {
            setBCC(prevState => ({
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
            } else if (type === 'bcc') {
                setBCC((prevState) => ({
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
            if (type === 'bcc') {
                value = bcc.value.trim();
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
                    if (type === 'bcc') {
                        setBCC((prevState) => ({
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
                items: cc.items.filter(i => i !== item),
                value: ""
            });
        }
        if (type === 'bcc') {
            setBCC({
                items: bcc.items.filter(i => i !== item),
                value: ""
            });
        }
    };
    const [subject, setSubject] = useState<string>('');

    const addSubject = (event: ChangeEvent | any) => {
        if (event.target.value) {
            setSubject(event.target.value);
        } else {
            setSubject('New Mail Subject');
        }
    }

    // useEffect(() => {
    //     // console.log('emailBody' , emailBody)
    //     console.log('props============' , props.messageContent)
    //     if ((props.messageContent?.mailboxes || []).includes('DRAFT')) {
    //         setEmailBody(props.messageContent?.draftInfo?.body);
    //     }
    // }, [props.messageContent])

    useEffect(() => {
        console.log('emailBody' , emailBody)
    }, [emailBody])

    const sendToDraft = (value: string, isValueUpdate: boolean = true) => {
        if (isValueUpdate) {
            setEmailBody(value);
        }
        let body = {
            subject: selectedMessage?.subject || subject,
            to: recipients?.items,
            ...(selectedThread ? {threadId: selectedThread.id} : {}),
            ...(cc?.items && cc?.items.length > 0 ? {cc: cc?.items} : {}),
            ...(bcc?.items && bcc?.items.length > 0 ? {bcc: bcc?.items} : {}),
            draftInfo: {
                body: isValueUpdate ? value : emailBody,
                ...(attachments && attachments.length > 0 ? {attachments}: {})
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
        }, 1000);
    }

    const isInList = (email: string, type: string) => {
        if (type == 'cc') {
            return cc?.items?.includes(email);
        } else if (type === 'recipients') {
            return recipients?.items?.includes(email);
        } else if (type === 'bcc') {
            return bcc?.items?.includes(email);
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
            // setEmailBody('');
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
            setBCC({
                items: [],
                value: "",
            });
            setEmailBody('');
            dispatch(updateMessageState({
                draft: null,
                ...(isCompose ? {isCompose: false} : {})
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


    const showCCFields = (type: string) => {
        if (type === 'cc') {
            setHideCcFields(true)
            setCC({
                items: [],
                value: ""
            });
        } else if (type === 'bcc') {
            setHideBccFields(true)
            setBCC({
                items: [],
                value: ""
            });
        } else {
            setHideCcFields(false)
            setHideBccFields(false)
            setBCC({
                items: [],
                value: ""
            });
            setCC({
                items: [],
                value: ""
            });
        }
    }

    function handleFileUpload(event: ChangeEventHandler | any) {
        event.stopPropagation();
        event.preventDefault();
        const reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = function () {
            if (reader.result) {
                setAttachments([...(attachments || []), {filename: event.target.files[0].name, data: reader.result.toString()}]);
            }
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    function removeAttachment(index: number) {
        (attachments || []).splice(index, 1);
        setAttachments([...attachments!]);
    }

    useEffect(() => {
        if (attachments) {
            sendToDraft('', false);
        }
        // eslint-disable-next-line
    }, [attachments])

    return (
        <div className={styles.mailFooter}>
            <Flex direction={'column'} className={styles.replyBox}>
                <div className={styles.replyBoxTags}>
                    <Flex justifyContent={'space-between'} padding={'8px 10px'}
                          borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>
                        <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>
                            <Heading as={'h1'} size={'sm'} paddingTop={1} marginRight={1}>TO:</Heading>
                            <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
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
                                {!hideCcFields &&
                                <span className={styles.ccButton} onClick={() => showCCFields('cc')}>Cc</span>}
                                {!hideBccFields &&
                                <span className={styles.ccButton} onClick={() => showCCFields('bcc')}>Bcc</span>}
                            </Flex>
                        </Flex>
                    </Flex>

                    {/*cc*/}
                    {hideCcFields && <Flex justifyContent={'space-between'} gap={1} padding={'8px 10px'}
                                           borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>
                        <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>
                            <Heading as={'h1'} size={'sm'} paddingTop={1} marginRight={1}>CC:</Heading>
                            <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
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
                    </Flex>}

                    {/*bcc*/}
                    {hideBccFields && <Flex justifyContent={'space-between'} padding={'8px 10px'}
                                            borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>
                        <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>
                            <Heading as={'h1'} size={'sm'} paddingTop={1} marginRight={1}>BCC:</Heading>
                            <Flex alignItems={'center'} gap={1} wrap={'wrap'} width={'100%'}>
                                {!!bcc?.items?.length && bcc.items.map((item: string | undefined, i: number) => (
                                    <Chip text={item} key={i} click={() => handleItemDelete(item!, 'bcc')}/>
                                ))}

                                <Input width={'auto'} padding={0} height={'23px'}
                                       fontSize={'12px'}
                                       value={bcc.value}
                                       onKeyDown={(e) => handleKeyDown(e, 'bcc')}
                                       onChange={(e) => handleChange(e, 'bcc')}
                                       onPaste={(e) => handlePaste(e, 'bcc')}
                                       border={0} className={styles.ccInput}
                                />
                            </Flex>
                        </Flex>
                        <InfoOutlineIcon/>
                    </Flex>}

                    {isCompose &&
                    <Flex width={'100%'} className={styles.subject}>
                        <Input width={'100%'} padding={3} height={'23px'}
                               fontSize={'12px'}
                               border={0} className={styles.subjectInput}
                               placeholder={'Subject'} onChange={(e) => addSubject(e)}
                        />
                    </Flex>
                    }

                </div>

                <Flex direction={'column'} className={styles.replyMessage}>
                    <RichTextEditor className={styles.replyMessageArea}
                                    placeholder='Reply with anything you like or @mention someone to share this thread'
                                    value={emailBody} onChange={(e) => sendToDraft(e)}/>

                    <Flex align={'flex-end'} justify={"space-between"} gap={2}>
                        <Flex align={'center'} gap={3}>
                            <FileIcon click={() => inputFile.current?.click()}/>
                            <input type='file' id='file' ref={inputFile} onChange={(e) => handleFileUpload(e)}
                                   style={{display: 'none'}}/>
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
                    {attachments && attachments.length > 0 ? <div style={{marginTop: '20px'}}>
                        {attachments.map((item: { filename: string, data: string }, index: number) => (
                            <Flex align={'center'} key={index}>
                                {item.filename}
                                <div className={styles.closeIcon} onClick={() => removeAttachment(index)}><CloseIcon/></div>
                            </Flex>
                        ))}
                    </div> : null}
                </Flex>
            </Flex>
        </div>
    )
}
