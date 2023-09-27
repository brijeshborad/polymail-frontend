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
import React, {ChangeEvent, ChangeEventHandler, useCallback, useEffect, useRef, useState} from "react";
import { debounce, isEmail } from "@/utils/common.functions";
import { Toaster } from "@/components/common";
const RichTextEditor = dynamic(() => import("@/components/common").then(mod => mod.RichTextEditor));
const Time = dynamic(() => import("@/components/common").then(mod => mod.Time));
import { createDraft, sendMessage, updateDraftState, updatePartialMessage } from "@/redux/draft/action-reducer";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {MessageAttachments, MessageRecipient} from "@/models";
import { uploadAttachment } from "@/redux/messages/action-reducer";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { MessageBoxType } from "@/types/props-types/message-box.type";
const MessageRecipients = dynamic(() => import("./message-recipients").then(mod => mod.default));
const MessageSchedule = dynamic(() => import("./message-schedule").then(mod => mod.default));
import { RecipientsType } from "@/types/props-types/message-recipients.type";
import { useRouter } from "next/router";
import {getPlainTextFromHtml} from "@/utils/editor-common-functions";
import dynamic from "next/dynamic";
import {fireEvent} from "@/redux/global-events/action-reducer";

dayjs.extend(relativeTime)

const blankRecipientValue: MessageRecipient = {
  name: '',
  email: ''
}

export function MessageReplyBox(props: MessageBoxType) {
  const [emailRecipients, setEmailRecipients] = useState<RecipientsType | any>({
    cc: { items: [], value: blankRecipientValue },
    bcc: { items: [], value: blankRecipientValue },
    recipients: { items: [], value: blankRecipientValue },
  })
  const [subject, setSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  // const { target } = useSelector((state: StateType) => state.keyNavigation);
  const { selectedAccount } = useSelector((state: StateType) => state.accounts);
  const { draft } = useSelector((state: StateType) => state.draft);
  const { event: incomingEvent } = useSelector((state: StateType) => state.globalEvents);
  const dispatch = useDispatch();
  const [attachments, setAttachments] = useState<MessageAttachments[]>([]);
  const { isOpen, onClose } = useDisclosure();
  const inputFile = useRef<HTMLInputElement | null>(null)
  const [scheduledDate, setScheduledDate] = useState<string | undefined>();
  const [hideEditorToolbar, setHideEditorToolbar] = useState<boolean>(false);
  const [replyBoxHide, setReplyBoxHide] = useState<boolean>(false);
  const [isReplyDropdownOpen, setIsReplyDropdownOpen] = useState<boolean>(false);
  const [extraClassNames, setExtraClassNames] = useState<string>('');
  const [extraClassNamesForBottom, setExtraClassNamesForBottom] = useState<string>('');
  const [waitForDraft, setWaitForDraft] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const editorRef = useRef<any>(null);
  const { toast } = createStandaloneToast()
  const router = useRouter();
  const divRef = useRef<HTMLDivElement | null>(null);
  const [divHeight, setDivHeight] = useState<number>(0);
  const [emailList, setEmailList] = useState<any>([]);

  useEffect(() => {
    if (emailRecipients?.recipients?.items && emailRecipients?.recipients?.items.length > 1) {
      let myArray = [...emailRecipients?.recipients?.items]
      myArray.shift();
      setEmailList(myArray)
    }
  }, [emailRecipients])


  useEffect(() => {
    if (divRef.current) {
      setTimeout(() => {
        const height = divRef.current?.offsetHeight || 0;
        setDivHeight(height);
      }, 100)

    }
  }, [replyBoxHide, emailRecipients]);

  useEffect(() => {
    if (!replyBoxHide) {
      setDivHeight(0)
    }

  }, [replyBoxHide, divHeight])

  /**
   * Detect if key navigation is set to open the reply box
   */
  // useEffect(() => {
  //
  //   if(target === 'reply-box') {
  //     setHideEditorToolbar(true)
  //   }
  //
  //   if(target !== 'reply-box' && hideEditorToolbar) {
  //     setHideEditorToolbar(false)
  //   }
  // }, [target, hideEditorToolbar])

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

  const handleAutoCompleteSelect = (value: any, type: string) => {
    if (value.email && isValid(value.email, type)) {
      setEmailRecipients((prevState: RecipientsType) => ({
        ...prevState,
        [type as keyof RecipientsType]: {
          items: [...prevState[type as keyof RecipientsType].items, {
            name: value.name,
            email: value.email
          }],
          value: blankRecipientValue
        }
      }));
    }
  };

  const handleItemDelete = (item: string, type: string) => {
    setEmailRecipients((prevState: RecipientsType) => ({
      ...prevState,
      [type as keyof RecipientsType]: {
        items: prevState[type as keyof RecipientsType].items.filter(i => i.email !== item),
        value: blankRecipientValue
      }
    }));
  };

  const sendToDraft = (value: string, isValueUpdate: boolean = true) => {
    let updateValue: string = getPlainTextFromHtml(value);
    if (!updateValue.trim()) {
      return;
    }
    if (isValueUpdate) {
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
      },
      messageId: props.messageData?.id,
      ...(props.isProjectView ? {projectId: router.query.project as string} : {}),
    }

    debounce(() => {
      if (selectedAccount && selectedAccount.id) {
        if (waitForDraft) {
          return;
        }
        if (draft && draft.id) {
          dispatch(updatePartialMessage({ id: draft.id, body }));
        } else {
          setWaitForDraft(true);
          dispatch(createDraft({ accountId: selectedAccount.id, body }));
        }
      }
    }, 500);
  }

  useEffect(() => {
    if (waitForDraft && draft && draft.id) {
      setWaitForDraft(false);
      sendToDraft('', false);
    }
  }, [waitForDraft, draft])

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
    }
  }, [draft, props.replyType])

  useEffect(() => {
    let messagesData = props.messageData
    if (messagesData) {
      let emailSubject = `${messagesData.subject}`;
      if (props.replyType === 'forward') {
        emailSubject = `Fwd: ${messagesData.subject}`;
        let decoded = Buffer.from(props.emailPart || '', 'base64').toString('ascii');
        setEmailBody(getForwardContent() + (decoded || '') + (selectedAccount?.signature || ''));
        debounce(() => {
          handleEditorScroll();
        }, 200)
        if (draft && draft.draftInfo && draft?.draftInfo?.attachments?.length) {
          setAttachments([
            ...draft.draftInfo.attachments.map(t => ({
              filename: t.filename,
              mimeType: t.mimeType
            }))
          ]);
        }
      } else {
        if (isInitialized) {
          if (selectedAccount && selectedAccount.signature) {
            setEmailBody(`<p></p><p>${selectedAccount.signature}</p>`);
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

    const forwardContent: string = `<p></p><p></p><p></p><p></p>
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
    if (props.replyType === 'forward') {
      setEmailRecipients({
        cc: { items: [], value: blankRecipientValue },
        bcc: { items: [], value: blankRecipientValue },
        recipients: { items: [], value: blankRecipientValue }
      });
    } else if (props.threadDetails) {
      if (props.threadDetails?.from!) {
        setEmailRecipients((prevState: RecipientsType) => ({
          ...prevState,
          recipients: {
            items: (props.threadDetails?.from.email === selectedAccount?.email && props.replyType === 'reply') ? props.threadDetails?.to! : [props.threadDetails?.from!],
            value: prevState.recipients.value
          }
        }));
      }
    if (props.threadDetails?.cc?.length) {
      let items: MessageRecipient[] = []
      if (props.replyType === 'reply-all') {
        items.push(props.threadDetails?.from!)
        if (props.threadDetails?.cc && props.threadDetails?.cc.length) {
          items.push(...props.threadDetails?.cc)
        } else if (props.threadDetails?.bcc && props.threadDetails?.bcc.length) {
          items.push(...props.threadDetails?.bcc)
        }
      }
     const filteredArray = (items || []).filter(obj => obj.email !== '');
        setEmailRecipients((prevState: RecipientsType) => ({
          ...prevState,
          cc: {
            items: filteredArray,
            value: prevState.cc.value
          }
        }));
      }

    if (props.threadDetails?.bcc?.length) {
        setEmailRecipients((prevState: RecipientsType) => ({
          ...prevState,
          bcc: {
            items: props.threadDetails?.bcc,
            value: prevState.bcc.value
          }
        }));
      }

    }
  }, [props.threadDetails, props.replyType])

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

  const discardMessage = () => {
    if (selectedAccount && selectedAccount.signature) {
      setEmailBody(`<p></p><p>${selectedAccount.signature}</p>`);
      dispatch(fireEvent({event: {data: `<p></p><p>${selectedAccount.signature}</p>`, type: 'richtexteditor.forceUpdate'}}));
    }
  }

  const sendMessages = () => {

    if (draft && draft.id) {
      let params = {};
      let polyToast = `poly-toast-${new Date().getMilliseconds()}`;

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
          id: polyToast,
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
            toast.close(`${polyToast}`);
          }
        })

      } else {
        if (draft && draft.to && draft.to.length) {
          Toaster({
            desc: `Your message has been sent to ${draft?.to && draft?.to[0].email}${draft?.to && draft?.to?.length > 1 ? ` and ${draft?.to && draft?.to?.length - 1} other${draft?.to && draft?.to?.length === 2 ? '' : 's'}` : ''}`,
            type: 'send_confirmation',
            title: draft?.subject || '',
            id: polyToast,
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
              toast.close(`${polyToast}`);
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
    setIsInitialized(true);
    setTimeout(() => {
      setHideEditorToolbar(true);
      let currentEmailBody: string = getPlainTextFromHtml(emailBody);
      if (selectedAccount && selectedAccount.signature && props.replyType !== 'forward' && !currentEmailBody.trim()) {
        setEmailBody(`<p></p><p>${selectedAccount.signature}</p>`);
      }
    }, 500)
  }

  const showRecipientsBox = () => {
    setReplyBoxHide((current) => !current);
  }

  const handleSchedule = (date: string | undefined) => {
    setScheduledDate(date);
  }

  const handleEditorScroll = useCallback(() => {
    if (editorRef.current && editorRef.current.scrollTop > 0) {
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
  }, [])

  useEffect(() => {
    if (props.replyType) {
      setTimeout(() => {
        handleEditorScroll();
      }, 500)
    }
    if (props.replyType === 'forward') {
      setReplyBoxHide(true)
    } else {
      setReplyBoxHide(false)
    }
  }, [props.replyType, handleEditorScroll])

  useEffect(() => {
    handleEditorScroll();
  }, [handleEditorScroll]);

  useEffect(() => {
    if(incomingEvent === 'iframe.clicked') {
      setIsReplyDropdownOpen(false)
    }
  }, [incomingEvent, setIsReplyDropdownOpen]);

  return (
    <Flex backgroundColor={'#FFFFFF'} position={'sticky'} mt={'auto'} bottom={0} boxShadow={'0 20px 0px 0 #fff'}>
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
              <Menu isOpen={isReplyDropdownOpen} onClose={() => setIsReplyDropdownOpen(false)}>
                <MenuButton
                  onClick={() => setIsReplyDropdownOpen(true)}
                  color={'#6B7280'} variant='link' size='xs'
                  as={Button} rightIcon={<ChevronDownIcon />}
                >
                  {props.replyTypeName || 'Reply'}
                </MenuButton>
                <MenuList className={'drop-down-list reply-dropdown'}>
                  {props.replyType === 'reply-all' ?
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply', props.threadDetails) : null}> Reply</MenuItem> :
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply-all', props.threadDetails) : null}> Reply All</MenuItem>
                  }
                  {props.replyType === 'forward' ?
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply', props.threadDetails) : null}> Reply</MenuItem> :
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('forward', props.threadDetails) : null}> Forward</MenuItem>
                  }
                </MenuList>
              </Menu>
              <Flex align={'center'} gap={1}>
                {/*<div className={styles.mailUserImage}>*/}

                {/*</div>*/}

                {!!emailRecipients?.recipients?.items?.length &&
                  <Flex fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                    fontWeight={400}>
                    {emailRecipients?.recipients?.items[0].email}&nbsp;
                    <div className={styles.otherMail}>
                      <Text as='u'>{emailRecipients?.recipients?.items?.length - 1 > 0 && `and ${emailRecipients?.recipients?.items?.length - 1} others`} </Text>
                      <div className={styles.otherMailList}>
                          {(emailList || []).map((item: any, index: number) => (
                              <p key={index}>{item.email}</p>
                          ))}

                      </div>
                    </div>
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
                <Time time={draft?.updated || ''} isShowFullTime={false}
                  showTimeInShortForm={true} /> : '0s'} ago</Text>
          </Flex>
          {replyBoxHide &&
            <div ref={divRef}>
              <MessageRecipients
                emailRecipients={emailRecipients}
                handleKeyDown={handleKeyDown}
                handleAutoCompleteSelect={handleAutoCompleteSelect}
                handleChange={handleChange}
                handlePaste={handlePaste}
                handleItemDelete={handleItemDelete}
              />
            </div>}


          <Flex direction={'column'} position={"relative"} flex={1} >
            <Flex direction={'column'} maxH={`calc(285px - ${divHeight}px)`} overflow={'auto'} ref={editorRef} className={`${styles.replyBoxEditor} editor-bottom-shadow`}
              onScroll={() => handleEditorScroll()}>
              <RichTextEditor
                className={`reply-message-area message-reply-box ${hideEditorToolbar ? 'hide-toolbar' : ''} ${extraClassNames} ${extraClassNamesForBottom}`}
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
              <Flex direction={'column'} className={styles.composeBox}>
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
                        className={styles.replyTextDiscardButton}
                        fontSize={14} lineHeight={16}
                        onClick={() => discardMessage()}
                    >
                      Discard
                    </Button>
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
