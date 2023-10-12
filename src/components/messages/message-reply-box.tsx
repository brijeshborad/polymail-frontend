import {
  Button,
  createStandaloneToast,
  Flex,
  Menu,
  MenuButton, MenuItem,
  MenuList,
  Text
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import Image from "next/image";
import { ChevronDownIcon, CloseIcon } from "@chakra-ui/icons";
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import {debounce, generateToasterId, isEmail, makeCollabId} from "@/utils/common.functions";
import {DropZone, Toaster} from "@/components/common";
const Time = dynamic(() => import("@/components/common").then(mod => mod.Time));
import { createDraft, sendMessage, updateDraftState, updatePartialMessage } from "@/redux/draft/action-reducer";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {Message, MessageAttachments, MessageRecipient, Thread} from "@/models";
import {deleteMessage, removeAttachment, uploadAttachment} from "@/redux/messages/action-reducer";
import { MessageBoxType } from "@/types/props-types/message-box.type";
const MessageRecipients = dynamic(() => import("./message-recipients").then(mod => mod.default));
const MessageSchedule = dynamic(() => import("./message-schedule").then(mod => mod.default));
import { RecipientsType } from "@/types/props-types/message-recipients.type";
import { useRouter } from "next/router";
import { getPlainTextFromHtml } from "@/utils/editor-common-functions";
import dynamic from "next/dynamic";
import { fireEvent } from "@/redux/global-events/action-reducer";
import { getCacheMessages, setCacheMessages } from "@/utils/cache.functions";
import CollabRichTextEditor from "../common/collab-rich-text-editor";
import { MAILBOX_DRAFT } from "@/utils/constants";
import {draftService, globalEventService, threadService} from "@/services";
import {ProgressBar} from "@/components/loader-screen/progress-bar";


dayjs.extend(relativeTime)

const blankRecipientValue: MessageRecipient = {
  name: '',
  email: ''
}

let loaderPercentage = 10;

export function MessageReplyBox(props: MessageBoxType) {
  const [emailRecipients, setEmailRecipients] = useState<RecipientsType | any>({
    cc: { items: [], value: blankRecipientValue },
    bcc: { items: [], value: blankRecipientValue },
    recipients: { items: [], value: blankRecipientValue },
  })
  const [subject, setSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const { selectedAccount } = useSelector((state: StateType) => state.accounts);
  const { draft } = useSelector((state: StateType) => state.draft);
  const { selectedThread, tabValue, threads } = useSelector((state: StateType) => state.threads);
  const { event: incomingEvent } = useSelector((state: StateType) => state.globalEvents);
  const { selectedMessage, showAttachmentLoader } = useSelector((state: StateType) => state.messages);
  const dispatch = useDispatch();
  const [attachments, setAttachments] = useState<MessageAttachments[]>([]);
  const inputFile = useRef<HTMLInputElement | null>(null)
  const [scheduledDate, setScheduledDate] = useState<string | undefined>();
  const [hideEditorToolbar, setHideEditorToolbar] = useState<boolean>(false);
  const [replyBoxHide, setReplyBoxHide] = useState<boolean>(false);
  const [isReplyDropdownOpen, setIsReplyDropdownOpen] = useState<boolean>(false);
  const [extraClassNames, setExtraClassNames] = useState<string>('');
  const [extraClassNamesForBottom, setExtraClassNamesForBottom] = useState<string>('');
  const [waitForDraft, setWaitForDraft] = useState<boolean>(false);
  const [collabId, setCollabId] = useState<string | undefined>(draft?.draftInfo?.collabId)
  const [isDraftUpdated, setIsDraftUpdated] = useState<boolean>(false);
  const [isContentUpdated, setIsContentUpdated] = useState<boolean>(false);
  const [messageData, setMessageData] = useState<any>(null);
  const [replyType, setReplyType] = useState<string>('reply');

  const editorRef = useRef<any>(null);
  const { toast } = createStandaloneToast()
  const router = useRouter();
  const divRef = useRef<HTMLDivElement | null>(null);
  const [divHeight, setDivHeight] = useState<number>(0);
  const [emailList, setEmailList] = useState<any>([]);

  useEffect(() => {
    if(!collabId) {
      const newCollabId = makeCollabId(10)
      dispatch(updateDraftState({
        draft: {
          ...draft,
          draftInfo: {
            ...draft?.draftInfo,
            collabId: newCollabId
          }
        }
      }))

      setCollabId(newCollabId)
    }
  }, [dispatch, collabId])

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
    if (evt.target.value) {
      setIsDraftUpdated(true)
    }
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

  const validateDraft = (value: string) => {
    return !!(subject || getPlainTextFromHtml(value).trim() || emailRecipients.recipients.items.length > 0 || emailRecipients.cc.items.length > 0 || emailRecipients.bcc.items.length > 0);
  }

  const sendToDraft = (value: string, isValueUpdate: boolean = true) => {
    if (!validateDraft(value)) {
      return;
    }
    let checkValue = getPlainTextFromHtml(value).trim();
    if (checkValue.trim()) {
      setIsDraftUpdated(true)
    }
    if (isValueUpdate) {
      if (!value.trim()) {
        setExtraClassNames(prevState => prevState.replace('show-shadow', ''));
        setExtraClassNamesForBottom(prevState => prevState.replace('show-shadow-bottom', ''));
      }
      setEmailBody(value);
    }

    let body: any = {
      subject: subject,
      to: emailRecipients.recipients?.items,
      cc: emailRecipients.cc?.items && emailRecipients.cc?.items.length > 0 ? emailRecipients.cc?.items : [],
      bcc: emailRecipients.bcc?.items && emailRecipients.bcc?.items.length > 0 ? emailRecipients.bcc?.items : [],
      draftInfo: {
        body: value || emailBody,
        collabId
      },
      messageId: messageData?.id,
      ...(props.isProjectView ? { projectId: router.query.project as string } : {}),
    }
    debounce(() => {
      if (selectedAccount && selectedAccount.id) {
        if (waitForDraft) {
          return;
        }
        if (draft && draft.id) {
          dispatch(updatePartialMessage({body:{ id: draft.id, body: body }}));
        } else {
          setWaitForDraft(true);
          dispatch(createDraft({body:{ accountId: selectedAccount.id, body: body }}));
        }
      }
    }, 250);
  }

  useEffect(() => {
    if (waitForDraft && draft && draft.id) {
      setWaitForDraft(false);
      sendToDraft('', false);
    }
  }, [waitForDraft, draft])

  useEffect(() => {
    // Add signature and draft to email body
    if (draft && draft.id && !isContentUpdated) {
      const {subject, to, cc, bcc, draftInfo} = draft;
      if (subject) {
        setSubject(subject)
      }
      if (draftInfo && draftInfo.body) {
        let checkValue = getPlainTextFromHtml(draftInfo.body).trim();
        if (checkValue.trim()) {
          setIsDraftUpdated(true)
        }
        globalEventService.fireEvent({data: draftInfo?.body || '', type: 'richtexteditor.forceUpdateWithOnChange'});
        setEmailBody(draftInfo?.body || '');
      }
      if (draftInfo?.attachments?.length) {
        setAttachments([
          ...draftInfo.attachments.map(t => ({
            filename: t.filename,
            mimeType: t.mimeType,
            isUploaded: true
          }))
        ]);
      }
      if (to && to.length) {
        setEmailRecipients((prevState: any) => ({
          ...prevState,
          recipients: {
            items: to,
            value: blankRecipientValue
          }
        }));
      }
      if (cc && cc.length) {
        setEmailRecipients((prevState: any) => ({
          ...prevState,
          cc: {
            items: cc,
            value: blankRecipientValue
          }
        }));
      }
      if (bcc && bcc.length) {
        setEmailRecipients((prevState: any) => ({
          ...prevState,
          bcc: {
            items: bcc,
            value: blankRecipientValue
          }
        }));
      }
      setIsContentUpdated(true);
    }
  }, [draft, isContentUpdated])

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

  const getForwardContent = useCallback((content: any) => {
    const to = content?.to;
    const toEmailString = formatEmailString(to);

    const cc = content?.cc; // Changed cc assignment to match the correct prop
    const ccEmailString = formatEmailString(cc);

    const forwardContent: string = `<p></p><p></p><p></p><p></p>
             <p style="color: black; background: none">---------- Forwarded message ----------</br>
From: ${content?.from?.email}</br>
Date: ${dayjs(content?.created).format('ddd, MMM DD, YYYY [at] hh:mm A')}</br>
Subject: ${content?.subject}</br>
To: ${toEmailString}</br>
${content?.cc ? 'Cc: ' + ccEmailString : ''}</p><br/><br/><br/>`;
    return forwardContent;
  }, [])

  useEffect(() => {
    if (selectedMessage && !draft) {
      if (selectedMessage?.from) {
        setEmailRecipients((prevState: RecipientsType) => ({
          ...prevState,
          recipients: {
            items: (selectedMessage?.from?.email === selectedAccount?.email && replyType === 'reply') ? selectedMessage?.to! : [selectedMessage?.from!],
            value: prevState.recipients.value
          }
        }));
      }
      if (selectedMessage?.cc?.length) {
        let items: MessageRecipient[] = []
        if (replyType === 'reply-all') {
          items.push(selectedMessage?.from!)
          if (selectedMessage?.cc && selectedMessage?.cc.length) {
            items.push(...selectedMessage?.cc)
          } else if (selectedMessage?.bcc && selectedMessage?.bcc.length) {
            items.push(...selectedMessage?.bcc)
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

      if (selectedMessage?.bcc?.length) {
        setEmailRecipients((prevState: RecipientsType) => ({
          ...prevState,
          bcc: {
            items: selectedMessage?.bcc,
            value: prevState.bcc.value
          }
        }));
      }

    }
  }, [selectedMessage, replyType, selectedAccount?.email, draft])

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


  useEffect(() => {
    if (draft && draft.id) {
      let cacheMessages = getCacheMessages();
      setCacheMessages({
        ...cacheMessages,
        [draft.id!]: {
          ...cacheMessages[draft.id!],
          data: Buffer.from(draft?.draftInfo!.body || '').toString('base64'),
          attachments: draft?.draftInfo?.attachments || []
        }
      })
    }
  }, [draft])


  function handleFileUpload(files: any, event: any=null) {
    loaderPercentage = 0;
    const file = files[0];

    if (draft && draft.id) {
      if(event) {
        event.stopPropagation();
        event.preventDefault();
      }
      const reader = new FileReader();
      if (reader) {
        reader.readAsDataURL(file);
        reader.onload = function () {


          if (reader.result) {
            setAttachments([
              ...(attachments || []),
              {
                filename: file.name,
                mimeType: file.type,
                isUploaded: false
              }
            ]);
            if (loaderPercentage < 100) {
              loaderPercentage += 20;
            }

            dispatch(uploadAttachment({
              body:{ id: draft.id, file: file },
              afterSuccessAction: () => {
                sendToDraft('', false);
              }
            }));
          }
        };
        reader.onerror = function (error) {
          console.log('Error: ', error);
        };
      }
    }
  }


  useEffect(() => {
    if (loaderPercentage < 100) {
      loaderPercentage *= 2;
    }
  }, [loaderPercentage])

  useEffect(() => {
    if (!showAttachmentLoader) {
      (attachments || []).map((item: any) => {
          if (!item.isUploaded) {
            item.isUploaded = true
          }
      })
    }
  }, [showAttachmentLoader ])

  function removeAttachmentData(index: number) {
    const newArr = [...attachments];
    (newArr || []).splice(index, 1);
    setAttachments([...newArr!]);
    if (draft && draft.id && draft.draftInfo?.attachments && draft.draftInfo?.attachments[index] && draft.draftInfo?.attachments[index].id) {
      dispatch(removeAttachment({
        body: {id: draft.id!, attachment: draft.draftInfo?.attachments[index].id!},
        afterSuccessAction: () => {
          dispatch(updatePartialMessage({body:{ id: draft.id }}));
        }
      }))
    }
  }

  const discardMessage = () => {
    setIsReplyDropdownOpen(false)
    setReplyBoxHide(false);
    globalEventService.fireEvent({data: '', type: 'richtexteditor.discard'});
    if (draft && draft.id) {
      draftService.setReplyDraft(null);
      setAttachments([]);
      dispatch(deleteMessage({
        body: {id: draft.id},
        afterSuccessAction: () => {
          draftService.discardDraft(draft.id!);
          setIsDraftUpdated(false);
        }
      }));
    }
    // TODO:- Attachment hover issue.
    // TODO:- Block until attachements are uploaded.
    // TODO:- show attachement loader.

    setHideEditorToolbar(false)
  }

  const updateThreadStateOpration = (type: string) => {
    let draftData = {
      ...draft,
      mailboxes: type === 'undo' ? [MAILBOX_DRAFT] : [tabValue],
      snippet: draft?.subject
    }
    let threadData: Thread = {...selectedThread} as Thread;
    let messages = [...(threadData?.messages || [])];
    let findDraft: Message[] = [];


    if (type === 'send-now') {
      messages = messages.filter(item => item.id !== draft?.id);
      messages.push(draftData as Message);
    } else if (type === 'undo') {
      findDraft = messages.filter(item => item.id !== draft?.id);
      findDraft.push(draftData as Message);
    }
    threadData = {
      ...threadData,
      messages: type === 'undo' ? findDraft : messages,
    };

    let index1 = (threads || []).findIndex((item: Thread) => item.id === threadData?.id);
    let newThreads: Thread[] = threads ?? [];
    if (threads) {
      newThreads = [...threads];
      newThreads[index1] = {
        ...newThreads[index1],
        messages: [...(threadData.messages ?? [])]
      }
    }
    threadService.setThreadState({selectedThread: threadData, threads: newThreads});
    if (type === 'undo') {
      draftService.restoreBackupDraft();
    }
    let cacheMessages = getCacheMessages();
    setCacheMessages({
      ...cacheMessages,
      [draftData.id!]: {
        ...cacheMessages[draftData.id!],
        data: Buffer.from(draft?.draftInfo!.body || '').toString('base64'),
        attachments: draft?.draftInfo?.attachments || []
      }
    })
  }


  const sendMessages = () => {
    if (draft && draft.id) {
      draftService.backupDraftForUndo();
      setReplyBoxHide(true);
      let params = {};
      let polyToast = generateToasterId();
      let optionType ='send-now';

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

        dispatch(sendMessage({body:{id: draft.id, ...params }}));

        Toaster({
          desc: `Your message has been scheduled`,
          type: 'send_confirmation',
          title: 'Your message has been scheduled',
          id: polyToast,
          undoClick: (type: string) => {

            if (type === 'undo') {
              params = {
                undo: true
              }
              updateThreadStateOpration(type)
            } else if (type === 'send-now') {
              params = {
                now: true
              }
               dispatch(updateDraftState({
                draft: null,
              }));
            }
            dispatch(sendMessage({body:{id: draft.id!, ...params }}));
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
              optionType = type;
              if (type === 'undo') {
                params = {
                  undo: true
                }
                updateThreadStateOpration(type)
              }

             else if (type === 'send-now') {
                params = {
                  now: true
                }
                dispatch(updateDraftState({
                  draft: null,
                }));
              }
              dispatch(sendMessage({body:{ id: draft.id!, ...params }}));
              toast.close(`${polyToast}`);
            }
          })
            }
          }

          dispatch(sendMessage({body:{id: draft.id!, ...params }}));

      if (selectedThread) {
        updateThreadStateOpration(optionType)
      }

      setEmailRecipients({
        cc: { items: [], value: blankRecipientValue },
        bcc: { items: [], value: blankRecipientValue },
        recipients: { items: messageData ? [messageData.from!] : [], value: blankRecipientValue }
      });
      setScheduledDate(undefined)
      setEmailBody('');
      setAttachments([]);
      setIsContentUpdated(false);
      setIsDraftUpdated(false);
      globalEventService.fireEvent({data: '', type: 'richtexteditor.forceUpdate'});
      draftService.setReplyDraft(null)
    }
  }


  const handleBlur = () => {
    // setTimeout(() => {
    //   setHideEditorToolbar(false)
    // }, 500)
  }

  const handleFocus = () => {
    setHideEditorToolbar(true);
    globalEventService.fireEvent('iframe.clicked');
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
    handleEditorScroll();
  }, [handleEditorScroll]);

  useEffect(() => {
    if (incomingEvent === 'iframe.clicked') {
      setIsReplyDropdownOpen(false)
    }
    if (typeof incomingEvent === 'object' && incomingEvent.type) {
      if (incomingEvent.type === 'draft.updateType') {
        setReplyType(incomingEvent.data.type);
        if (incomingEvent.data.type === 'forward') {
          if (!isDraftUpdated) {
            setReplyBoxHide(true)
            setEmailRecipients({
              cc: { items: [], value: blankRecipientValue },
              bcc: { items: [], value: blankRecipientValue },
              recipients: { items: [], value: blankRecipientValue }
            });
            setSubject(`Fwd: ${incomingEvent.data.messageData.subject}`);
            let decoded = Buffer.from(incomingEvent.data.emailParts || '', 'base64').toString('utf-8');
            let sentence = '';
            if (selectedThread && selectedThread?.projects && selectedThread?.projects?.length) {
              sentence = `<p></p><p style="padding: 5px 10px !important; background-color: #EBF83E; display: block; width: fit-content; border-radius: 4px; color: #0A101D; font-weight: 500; line-height: 1;">${selectedAccount ? (selectedAccount?.name || ''): ""} is sharing this email thread (and future replies) with others ${selectedThread?.projects && selectedThread.projects.length === 1 ? `at ${selectedThread.projects[0].name} on Polymail` : 'on Polymail'}`;
            }
            let content = getForwardContent(incomingEvent.data.messageData) + (decoded || '') + (selectedAccount ? (selectedAccount?.signature || ''): '') + (`${sentence}`);
            setEmailBody(content);
            globalEventService.fireEvent({type: 'richtexteditor.forceUpdate', data: content})
            debounce(() => {
              handleEditorScroll();
            }, 200)
          }
        }
      }
      if (incomingEvent.type === 'draft.currentMessage') {
        setMessageData(incomingEvent.data);
      }
    }
  }, [getForwardContent, handleEditorScroll, incomingEvent, isDraftUpdated, selectedAccount, selectedThread]);

  return (
    <Flex backgroundColor={'#FFFFFF'} position={'sticky'} mt={'20px'} bottom={0} boxShadow={'0 20px 0px 0 #fff'}>
      <Flex
        maxHeight={'450px'} direction={'column'} backgroundColor={'#FFFFFF'} width={'100%'}
        onBlur={() => handleBlur()}
      >
        <Flex borderRadius={8} gap={4} border={'1px solid #F3F4F6'} direction={'column'} padding={4}>
          {/*router.query.project && (
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
          ) */}
          <Flex
            align={'center'} justify={'space-between'} gap={4} position={"relative"} zIndex={isReplyDropdownOpen ? 8 : 6}>
            <Flex align={'center'} gap={1}>
              <Menu isOpen={isReplyDropdownOpen} onClose={() => setIsReplyDropdownOpen(false)}>
                <MenuButton
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsReplyDropdownOpen(true)
                  }}
                  color={'#6B7280'} variant='link' size='xs'
                  as={Button} rightIcon={<ChevronDownIcon />}
                >
                  {props.replyTypeName || 'Reply'}
                </MenuButton>
                <MenuList className={'drop-down-list reply-dropdown'}>
                  {replyType === 'reply-all' ?
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply', selectedMessage) : null}> Reply</MenuItem> :
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply-all', selectedMessage) : null}> Reply All</MenuItem>
                  }
                  {replyType === 'forward' ?
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply', selectedMessage) : null}> Reply</MenuItem> :
                    <MenuItem
                      onClick={() => {
                        if(props.hideAndShowReplayBox){
                          props.hideAndShowReplayBox('forward', selectedMessage)
                          handleFocus()
                        }
                      }}> Forward</MenuItem>
                  }
                </MenuList>
              </Menu>
              <Flex align={'center'} gap={1}>
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
                  if(!replyBoxHide) {
                    handleFocus()
                  }
                }}> {!replyBoxHide ? 'Edit' : 'Close'} </Button>
            </Flex>
            <Flex
              onClick={() => {
                handleFocus()
                dispatch(fireEvent({
                    event: {
                      data: null,
                      type: 'richtexteditor.focus'
                    }
                  }));
              }}
              onFocus={() => handleFocus()}
              grow={1} justifyContent={'flex-end'}
            >
              <Text
                as={'h1'} fontSize='11px' color={'#6B7280'} display={'flex'} gap={'2px'}
                className={styles.mailSaveTime}>
                {(!draft?.updated || !isDraftUpdated) && 'Not Saved'}
                {(draft?.updated && isDraftUpdated) &&
                <>
                  Saved <Time time={draft?.updated || ''} isShowFullTime={false} showTimeInShortForm={true} />&nbsp;ago
                </>
                }
              </Text>
            </Flex>
          </Flex>
          <DropZone onFileUpload={handleFileUpload} forReply={true}>
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


            <Flex
                onFocus={() => handleFocus()}
                direction={'column'} position={"relative"} flex={1} overflow={'none'}>
              <Flex direction={'column'} maxH={`calc(315px - ${divHeight}px)`} zIndex={6} ref={editorRef} overflowY={'auto'} className={`editor-bottom-shadow`}
                    onScroll={() => handleEditorScroll()}>
                {(selectedThread && collabId) && (
                    <CollabRichTextEditor
                        id={'thread-' + collabId}
                        onCreate={() => sendToDraft('')}
                        placeholder="Hit enter to reply with anything you'd like"
                        isToolbarVisible={hideEditorToolbar}
                        onChange={(value) => sendToDraft(value)}
                        className={`${extraClassNames} ${extraClassNamesForBottom}`}
                        emailSignature={selectedAccount ? `<p></p>${selectedAccount?.signature}` : undefined}
                        projectShare={selectedThread?.projects?.length ? `
                          <div style="display: flex; background-color: #EBF83E; width: fit-content; border-radius: 4px; color: #0A101D font-weight: 500; line-height: 1; padding: 5px 10px">
                            <p style="font-size: 13px; margin-right: 3px;"> ${selectedAccount?.name || ''} is sharing this email thread (and future replies) with</p>
                            <p style="font-size: 13px; text-decoration: underline; margin-right: 3px;">others</p>
                            <p style="font-size: 13px; margin-right: 3px;">on</p>
                            <p style="font-size: 13px; text-decoration: underline">Polymail</p>
                          </div>` : undefined}
                        extendToolbar={(
                            <>
                              <Flex
                                  onClick={() => {
                                    inputFile.current?.click();
                                    loaderPercentage = 0;
                                  }}
                                  align={'center'} justify={'center'} cursor={'pointer'}
                                  className={styles.attachIcon}
                              >
                                <Image src="/image/icon/attach.svg" alt="emoji" width={13} height={13} />
                                Attach
                                <input type='file' id='file' ref={inputFile} onChange={(e) => handleFileUpload(e.target.files, e)} style={{ display: 'none' }} />
                              </Flex>
                            </>
                        )}
                    />
                )}

                {attachments && attachments.length > 0 ? <div style={{ marginTop: '20px' }}>
                  {attachments.map((item, index: number) => (
                      <Flex align={'center'} key={index} className={styles.attachmentsFile}>
                        {item.filename}
                        <Flex ml={'auto'} gap={3} className={'attachments-progress-bar'}>
                          {(showAttachmentLoader && !item.isUploaded) && <ProgressBar loaderPercentage={loaderPercentage} />}
                          <div className={styles.closeIcon} onClick={() => removeAttachmentData(index)}>
                            <CloseIcon />
                          </div>
                        </Flex>
                      </Flex>
                  ))}
                </div> : null}

              </Flex>

              {hideEditorToolbar &&
              <Flex direction={'column'} className={styles.composeBox} width={'fit-content'} marginLeft={'auto'} mr={'6px'}>
                <Flex align={'center'} className={styles.replyButton} position={'relative'} zIndex={6}>
                  <Button
                      className={styles.replyTextDiscardButton}
                      fontSize={14} lineHeight={16} height={'38px'}
                      onClick={(e) => {
                        e.stopPropagation()
                        discardMessage()
                      }}
                  > Discard </Button>
                  <Flex className={styles.messageSendButton}>
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

                    <MessageSchedule date={scheduledDate} onChange={handleSchedule} />
                  </Flex>
                </Flex>
              </Flex>
              }
            </Flex>
          </DropZone>
        </Flex>
      </Flex>
    </Flex>
  )
}
