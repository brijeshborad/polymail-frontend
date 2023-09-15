import {
  Button,
  createStandaloneToast,
  Flex,
  Menu,
  MenuButton, MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import Image from "next/image";
import { ChevronDownIcon, CloseIcon } from "@chakra-ui/icons";
import { FileIcon, TextIcon } from "@/icons";
import React, { ChangeEvent, ChangeEventHandler, useEffect, useRef, useState } from "react";
import { debounce, isEmail } from "@/utils/common.functions";
import { RichTextEditor, Time, Toaster } from "@/components/common";
import { createDraft, sendMessage, updateDraftState, updatePartialMessage } from "@/redux/draft/action-reducer";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { MessageAttachments, MessageRecipient } from "@/models";
import { uploadAttachment } from "@/redux/messages/action-reducer";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { MessageBoxType } from "@/types/props-types/message-box.type";
import MessageRecipients from "./message-recipients";
import { RecipientsType } from "@/types/props-types/message-recipients.type";
import { useRouter } from "next/router";
import MessageSchedule from "./message-schedule";

dayjs.extend(relativeTime)

export function MessageReplyBox(props: MessageBoxType) {
  const blankRecipientValue: MessageRecipient = {
    name: '',
    email: ''
  }
  const [emailRecipients, setEmailRecipients] = useState<RecipientsType | any>({
    cc: { items: [], value: blankRecipientValue },
    bcc: { items: [], value: blankRecipientValue },
    recipients: { items: [], value: blankRecipientValue },
  })
  const [subject, setSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const { selectedAccount } = useSelector((state: StateType) => state.accounts);
  const { draft } = useSelector((state: StateType) => state.draft);
  const dispatch = useDispatch();
  const [attachments, setAttachments] = useState<MessageAttachments[]>([]);
  const { isOpen, onClose } = useDisclosure();
  const inputFile = useRef<HTMLInputElement | null>(null)
  const [scheduledDate, setScheduledDate] = useState<string>();
  const [hideEditorToolbar, setHideEditorToolbar] = useState<boolean>(false);
  const [isShowText, _setIsShowText] = useState<boolean>(false);
  const [replyBoxHide, setReplyBoxHide] = useState<boolean>(false);
  const [boxUpdatedFirstTime, setBoxUpdatedFirstTime] = useState<boolean>(false);
  const [extraClassNames, setExtraClassNames] = useState<string>('');
  const [extraClassNamesForBottom, setExtraClassNamesForBottom] = useState<string>('');

  const editorRef = useRef<any>(null);
  const { toast } = createStandaloneToast()
  const router = useRouter();

  const isValid = (email: string, type: string) => {
    let error = null;
    if ((emailRecipients[type as keyof RecipientsType].items || []).map((r: MessageRecipient) => r.email).includes(email)) {
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
    setEmailRecipients((prevState: RecipientsType) => ({
      ...prevState,
      [type as keyof RecipientsType]: {
        items: [...(prevState[type as keyof RecipientsType].items || [])],
        value: {
          name: '',
          email: evt.target.value
        }
      }
    }));
  };

  const handlePaste = (evt: ClipboardEvent | any, type: string) => {
    evt.preventDefault();

    let paste = evt.clipboardData.getData("text");
    let emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g);

    if (emails) {
      let emailsToBeAdded = emails
        .filter((email: string) => !emailRecipients[type as keyof RecipientsType].items
          .map((i: MessageRecipient) => i.email)
          .includes(email))
        .map((email: string) => ({
          email: email,
          name: ''
        }))

      setEmailRecipients((prevState: RecipientsType) => ({
        ...prevState,
        [type as keyof RecipientsType]: {
          items: [
            ...prevState[type as keyof RecipientsType].items,
            ...emailsToBeAdded
          ],
          value: blankRecipientValue
        }
      }));
    }
  };

  const handleKeyDown = (evt: KeyboardEvent | any, type: string) => {
    if (["Enter", "Tab"].includes(evt.key)) {
      evt.preventDefault();
      let value = emailRecipients[type as keyof RecipientsType].value.email.trim();

      let emailArray = value.split(',');
      !!emailArray.length && emailArray.map((email: string) => {
        if (email && isValid(email, type)) {
          setEmailRecipients((prevState: RecipientsType) => ({
            ...prevState,
            [type as keyof RecipientsType]: {
              items: [...prevState[type as keyof RecipientsType].items, {
                name: '',
                email: email
              }],
              value: blankRecipientValue
            }
          }));
        }
      })
    }
  };

  const handleItemDelete = (item: string, type: string) => {
    setEmailRecipients((prevState: RecipientsType) => ({
      ...prevState,
      [type as keyof RecipientsType]: {
        items: prevState[type as keyof RecipientsType].items.map(i => i.email).filter(i => i !== item),
        value: blankRecipientValue
      }
    }));
  };

  const sendToDraft = (value: string, isValueUpdate: boolean = true) => {
    if (isValueUpdate) {
      if (!boxUpdatedFirstTime) {
        setBoxUpdatedFirstTime(true);
      }
      if (!value.trim()) {
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
        body: value || emailBody
      }
    }

    debounce(() => {
      if (selectedAccount && selectedAccount.id) {
        if (draft && draft.id) {
          dispatch(updatePartialMessage({ id: draft.id, body }));
        } else {
          dispatch(createDraft({ accountId: selectedAccount.id, body }));
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
        setBoxUpdatedFirstTime(false);
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
        setEmailRecipients((prevState: RecipientsType) => ({
          ...prevState,
          recipients: {
            items: draft ? (draft.to || [{ name: '', email: '' }]) : [props.messageData?.from!],
            value: prevState.recipients.value
          }
        }));

        if (props.replyType === 'reply-all' && props.messageData.cc) {
          let items: MessageRecipient[] = (draft ? (draft.cc || []) : props.messageData.cc)!.filter(t => t);
          if (items.length > 0) {
            setEmailRecipients((prevState: RecipientsType) => ({
              ...prevState,
              cc: {
                items: items,
                value: blankRecipientValue
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

  function formatEmailString(emailArray: any) {
    if (Array.isArray(emailArray)) {
      if (emailArray.length === 1) {
        return emailArray[0].email;
      } else if (emailArray.length > 1) {
        return `${emailArray[0].email} and ${emailArray.length - 1} other`;
      }
    }
    return '';
  }

  function getForwardContent() {
    const to = props.messageData?.to;
    const toEmailString = formatEmailString(to);

    const cc = props.messageData?.cc; // Changed cc assignment to match the correct prop
    const ccEmailString = formatEmailString(cc);

    const forwardContent: string = `
             <p style="color: black; background: none">---------- Forwarded message ----------
From: ${props.messageData?.from?.email}
Date: ${dayjs(props.messageData?.created).format('ddd, MMM DD, YYYY [at] hh:mm A')}
Subject: ${props.messageData?.subject}
To: ${toEmailString}
${props.messageData?.cc ? 'Cc: ' + ccEmailString : ''}</p><br/><br/><br/>`;
    return forwardContent;
  }

  useEffect(() => {
    setHideEditorToolbar(false)
    setScheduledDate(undefined)
    setEmailRecipients((prevState: RecipientsType) => ({
      ...prevState,
      cc: {
        items: [],
        value: blankRecipientValue,
      },
      bcc: {
        items: [],
        value: blankRecipientValue,
      }
    }));
  }, [props?.threadDetails?.id])

  useEffect(() => {
    if (!draft) {
      setBoxUpdatedFirstTime(false);
    }
  }, [draft])

  useEffect(() => {
    if (props.threadDetails) {
      if ( props.threadDetails?.to?.length) {
        setEmailRecipients((prevState: RecipientsType) => ({
          ...prevState,
          recipients: {
            items: props.threadDetails.to,
            value: prevState.recipients.value
          }
        }));
      }

    if (props.threadDetails?.cc?.length) {
        setEmailRecipients((prevState: RecipientsType) => ({
          ...prevState,
          cc: {
            items: props.threadDetails.cc,
            value: prevState.cc.value
          }
        }));
      }

    if (props.threadDetails?.bcc?.length) {
        setEmailRecipients((prevState: RecipientsType) => ({
          ...prevState,
          bcc: {
            items: props.threadDetails.bcc,
            value: prevState.bcc.value
          }
        }));
      }

    }
  }, [props.threadDetails])

  useEffect(() => {
    const propertiesToCheck: (keyof RecipientsType)[] = ['recipients', 'bcc', 'cc'];
    let allValues: MessageRecipient[] = [];
    // add message to draft when user add cc, bcc, recipients and subject
    for (const property of propertiesToCheck) {
      if (emailRecipients && emailRecipients[property] && emailRecipients[property].items && Array.isArray(emailRecipients[property].items)) {
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
          dispatch(uploadAttachment({ id: draft.id, file }));
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


  const sendMessages = () => {

    if (draft && draft.id) {
      let params = {};

      // if the user has set a schedule date
      if (scheduledDate) {
        const targetDate = dayjs(scheduledDate)
        // Get the current date and time
        const currentDate = dayjs();

        /**
         * Delay the message by calculating the difference between
         * now and the date of the schedule.
         * Return it in seconds.
         */
        const secondsDifference = targetDate.diff(currentDate, 'second');
        params = {
          delay: secondsDifference
        }

        dispatch(sendMessage({ id: draft.id, ...params }));

        Toaster({
          desc: `Your message has been scheduled`,
          type: 'send_confirmation',
          title: 'Your message has been scheduled',
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
            dispatch(sendMessage({ id: draft.id!, ...params }));
            toast.close('poly-toast');
          }
        })

      } else {
        if (draft && draft.to && draft.to.length) {
          Toaster({
            desc: `Your message has been sent to ${draft?.to && draft?.to[0].email}${draft?.to && draft?.to?.length > 1 ? ` and ${draft?.to && draft?.to?.length - 1} other${draft?.to && draft?.to?.length === 2 ? '' : 's'}` : ''}`,
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
              dispatch(sendMessage({ id: draft.id!, ...params }));
              toast.close('poly-toast');
            }
          })
        }
      }


      onClose();
      // if (props.onClose) {
      //     props.onClose();
      // }

      setEmailRecipients({
        cc: { items: [], value: blankRecipientValue },
        bcc: { items: [], value: blankRecipientValue },
        recipients: { items: props.messageData ? [props.messageData.from!] : [], value: blankRecipientValue }
      });
      setScheduledDate(undefined)
      setEmailBody('');
      dispatch(updateDraftState({
        draft: null,
      }));
    }
  }


  const handleBlur = () => {
    // setTimeout(() => {
    //   setHideEditorToolbar(false)
    // }, 500)
  }

  const handleFocus = () => {
    setTimeout(() => {
      setHideEditorToolbar(true)
    }, 500)
  }

  const showRecipientsBox = () => {
    setReplyBoxHide((current) => !current)
  }

  useEffect(() => {
    if (props.replyType === 'reply-all') {
      setReplyBoxHide(true)
    } else {
      setReplyBoxHide(false)
    }
  }, [props.replyType])

  const handleSchedule = (date: string) => {
    setScheduledDate(date);
  }

  function handleEditorScroll(event: any) {
    if (event.target.scrollTop > 0) {
      setExtraClassNames(prevState => !prevState.includes('show-shadow') ? prevState + ' show-shadow' : prevState);
    } else {
      setExtraClassNames(prevState => prevState.replace('show-shadow', ''));
    }

    const container = editorRef.current;
    if (container) {
      const scrollHeight = container?.scrollHeight;
      const containerHeight = container?.clientHeight;
      const scrollBottom = scrollHeight - containerHeight - editorRef.current.scrollTop;
      if (scrollBottom > 3) {
        setExtraClassNamesForBottom(prevState => !prevState.includes('show-shadow-bottom') ? prevState + ' show-shadow-bottom' : prevState);
      } else {
        setExtraClassNamesForBottom(prevState => prevState.replace('show-shadow-bottom', ''));
      }
    }
  }

  return (
    <Flex backgroundColor={'#FFFFFF'} position={'sticky'} mt={'auto'} bottom={'-20px'} paddingBottom={props.parentHasScroll ? 5 : 0}>
      <Flex maxHeight={'450px'} direction={'column'} backgroundColor={'#FFFFFF'} width={'100%'}
        onFocus={() => handleFocus()} onBlur={() => handleBlur()}>
        <Flex borderRadius={8} gap={4} border={'1px solid #F3F4F6'} direction={'column'} padding={4}>
          {router.query.project && (
            <Flex align={'center'} justify={'space-between'} gap={4} pb={4}
              borderBottom={'1px solid #F3F4F6'}>
              <Flex gap={1} align={'center'}>
                <Flex className={`${styles.memberImages} ${styles.smallMemberImage}`}>
                  <div className={styles.memberPhoto}>
                    <Image src="/image/user.png" width="24" height="24" alt="" />
                  </div>
                  <div className={styles.memberPhoto}>
                    <Image src="/image/user.png" width="24" height="24" alt="" />
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
          )}
          <Flex align={'center'} justify={'space-between'} gap={4} position={"relative"} zIndex={10}>
            <Flex align={'center'} gap={1}>
              <Menu>
                <MenuButton color={'#6B7280'} variant='link' size='xs' as={Button} rightIcon={<ChevronDownIcon />}>{props.replyTypeName || 'Reply to'}
                </MenuButton>
                <MenuList className={'drop-down-list reply-dropdown'}>
                  {props.replyType === 'reply-all' ?
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply', props.threadDetails) : null}> Reply to </MenuItem> :
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply-all', props.threadDetails) : null}> Reply to All </MenuItem>
                  }
                  {props.replyType === 'forward' ?
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply', props.threadDetails) : null}> Reply to </MenuItem> :
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('forward', props.threadDetails) : null}> Forward </MenuItem>
                  }
                </MenuList>
              </Menu>
              <Flex align={'center'} gap={1}>
                <div className={styles.mailUserImage}>

                </div>

                {!!emailRecipients?.recipients?.items?.length &&
                  <Flex fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                    fontWeight={400}>
                    {emailRecipients?.recipients?.items[0].email}&nbsp; <Text
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
                  showTimeInShortForm={true} /> : '0 s'} ago</Text>
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
            <Flex direction={'column'} maxH={'285px'} overflow={'auto'} ref={editorRef} className={`${styles.replyBoxEditor} editor-bottom-shadow`}
              onScroll={handleEditorScroll}>
              <RichTextEditor
                className={`reply-message-area message-reply-box ${hideEditorToolbar ? 'hide-toolbar' : ''} ${isShowText ? 'input-value-shadow' : ''} ${extraClassNames} ${extraClassNamesForBottom}`}
                initialUpdated={boxUpdatedFirstTime}
                placeholder='Reply with anything you like or @mention someone to share this thread'
                value={emailBody} onChange={(e) => sendToDraft(e)} />
              {attachments && attachments.length > 0 ? <div style={{ marginTop: '20px' }}>
                {attachments.map((item, index: number) => (
                  <Flex align={'center'} key={index} className={styles.attachmentsFile}>
                    {item.filename}
                    <div className={styles.closeIcon} onClick={() => removeAttachment(index)}>
                      <CloseIcon />
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
                      <FileIcon click={() => inputFile.current?.click()} />
                    </Flex>
                    <input type='file' id='file' ref={inputFile} onChange={(e) => handleFileUpload(e)}
                      style={{ display: 'none' }} />
                    {/*<LinkIcon/>*/}
                    <Flex width={'20px'} h={'20px'} align={'center'} justify={'center'} cursor={'pointer'} className={styles.replyIcon}>
                      <TextIcon />
                    </Flex>
                    {/*<EmojiIcon/>*/}
                  </Flex>
                  <Flex align={'center'} className={styles.replyButton}>
                    <Button
                      className={styles.replyTextButton}
                      colorScheme='blue'
                      fontSize={14} lineHeight={16}
                      onClick={() => sendMessages()}
                    >
                      {scheduledDate ? (
                        <>Send {dayjs(scheduledDate).from(dayjs())} @ {dayjs(scheduledDate).format('hh:mmA')}</>
                      ) : (
                        <>Send</>
                      )}
                    </Button>

                    <MessageSchedule
                      date={scheduledDate}
                      sendMessages={sendMessages}
                      onChange={handleSchedule}
                    />

                    <Modal isOpen={isOpen} onClose={onClose} isCentered={true}
                      scrollBehavior={'outside'}>
                      <ModalOverlay />
                      <ModalContent minHeight="440px">
                        <ModalHeader display="flex" justifyContent="space-between"
                          alignItems="center">
                          Schedule send
                        </ModalHeader>
                        <ModalCloseButton size={'xs'} />
                        <ModalBody>
                          <SingleDatepicker name="date-input"
                            date={dayjs(scheduledDate).toDate()}
                            defaultIsOpen={true}
                            onDateChange={(date) => setScheduledDate(date.toString())} />
                        </ModalBody>
                        <ModalFooter>
                          <Button variant='ghost' onClick={onClose}>Cancel</Button>
                          <Button colorScheme='blue' mr={3}
                            onClick={() => sendMessages()}> Schedule </Button>
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
