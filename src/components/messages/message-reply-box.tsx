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
import { Toaster } from "@/components/common";
const Time = dynamic(() => import("@/components/common").then(mod => mod.Time));
import { createDraft, sendMessage, updateDraftState, updatePartialMessage } from "@/redux/draft/action-reducer";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {Message, MessageAttachments, MessageRecipient, Thread} from "@/models";
import { removeAttachment, uploadAttachment} from "@/redux/messages/action-reducer";
import { MessageBoxType } from "@/types/props-types/message-box.type";
const MessageRecipients = dynamic(() => import("./message-recipients").then(mod => mod.default));
const MessageSchedule = dynamic(() => import("./message-schedule").then(mod => mod.default));
import { RecipientsType } from "@/types/props-types/message-recipients.type";
import { useRouter } from "next/router";
import { getPlainTextFromHtml } from "@/utils/editor-common-functions";
import dynamic from "next/dynamic";
import { fireEvent } from "@/redux/global-events/action-reducer";
import { updateThreadState } from "@/redux/threads/action-reducer";
import { getCacheMessages, setCacheMessages } from "@/utils/cache.functions";
import CollabRichTextEditor from "../common/collab-rich-text-editor";
import { MAILBOX_DRAFT } from "@/utils/constants";
import {draftService} from "@/services";

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
  const { selectedAccount } = useSelector((state: StateType) => state.accounts);
  const { draft } = useSelector((state: StateType) => state.draft);
  const { selectedThread, tabValue, threads } = useSelector((state: StateType) => state.threads);
  const { event: incomingEvent } = useSelector((state: StateType) => state.globalEvents);
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
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [collabId, setCollabId] = useState<string | undefined>(draft?.draftInfo?.collabId)

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
    // let updateValue: string = getPlainTextFromHtml(value);

    // if (!updateValue.trim()) {
    //   return;
    // }
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
      messageId: props.messageData?.id,
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
        let decoded = Buffer.from(props.emailPart || '', 'base64').toString('utf-8');
        let sentence = '';
        if (selectedThread?.projects && selectedThread?.projects?.length) {
          sentence = `<p></p><p style="padding: 5px 10px !important; background-color: #EBF83E; display: block; width: fit-content; border-radius: 4px; color: #0A101D; font-weight: 500; line-height: 1;">${selectedAccount?.name || ''} is sharing this email thread (and future replies) with others ${selectedThread?.projects && selectedThread.projects.length === 1 ? `at ${selectedThread.projects[0].name} on Polymail` : 'on Polymail'}`;
        }
        setEmailBody(getForwardContent() + (decoded || '') + (selectedAccount?.signature || '') + (`<p></p><p style="padding: 5px 10px !important; background-color: #EBF83E; display: block; width: fit-content; border-radius: 4px; color: #0A101D; font-weight: 500; line-height: 1;">${sentence}</p></p>`));
          dispatch(fireEvent({
            event: {
              data: getForwardContent() + (decoded || '') + (selectedAccount?.signature || '') + (`${sentence}`),
              type: 'richtexteditor.forceUpdate'
            }
          }));
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
            let sentence = '';
            if (selectedThread?.projects && selectedThread?.projects?.length) {
              sentence = `${selectedAccount?.name || ''} is sharing this email thread (and future replies) with others ${selectedThread?.projects && selectedThread.projects.length === 1 ? `at ${selectedThread.projects[0].name} on Polymail` : 'on Polymail'}`;
            }
            setEmailBody(`<p></p><p>${selectedAccount.signature}</p><p></p><p style="padding: 5px 10px !important; background-color: #EBF83E; display: block; width: fit-content; border-radius: 4px; color: #0A101D; font-weight: 500; line-height: 1;">${sentence}</p>`);
          }
        }
      }
      // set subject when email is replied or forwarded.
      setSubject(emailSubject || '');
    }
  }, [props.messageData, props.replyType, props.emailPart, selectedThread])

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
             <p style="color: black; background: none">---------- Forwarded message ----------</br>
From: ${props.messageData?.from?.email}</br>
Date: ${dayjs(props.messageData?.created).format('ddd, MMM DD, YYYY [at] hh:mm A')}</br>
Subject: ${props.messageData?.subject}</br>
To: ${toEmailString}</br>
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

    if ((allValues.length > 0 && emailRecipients && emailRecipients['recipients'] && emailRecipients['recipients'].items.length > 0) || subject || emailBody) {
      sendToDraft('', false);
    }
  }, [emailRecipients.recipients.items, emailRecipients.cc.items, emailRecipients.bcc.items, subject, emailBody]);


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
    const file = files[0];

    if (draft && draft.id) {
      if(event) {
        event.stopPropagation();
        event.preventDefault();
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {


        if (reader.result) {
          setAttachments([
            ...(attachments || []),
            {
              filename: file.name,
              mimeType: file.type
            }
          ]);
          dispatch(uploadAttachment({
            body:{ id: draft.id, file: file },
            afterSuccessAction: () => {
              dispatch(updatePartialMessage({body:{ id: draft.id }}));
            }
          }));
        }
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
  }

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
    draftService.setDraftState({draft: {...draft, updated: ''}});
    dispatch(fireEvent({
      event: {
        data: '',
        type: 'richtexteditor.discard'
      }
    }));
    setAttachments([]);

    setHideEditorToolbar(false)
  }

  const updateThreadStateOpration = (type: string) =>{
    let draftData = {
      ...draft,
      mailboxes: type === 'undo' ? [MAILBOX_DRAFT] : [tabValue],
      snippet: draft?.subject
    }
    let threadData: Thread = { ...selectedThread } as Thread;
    let messages = [...(threadData?.messages || [])];
    let findDraft: Message[] = [];


    if(type === 'send-now'){
      messages.push(draftData as Message);
    }
    else if(type === 'undo'){
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
        };
    dispatch(updateThreadState({
      selectedThread: threadData,
      threads: newThreads
    }))
    dispatch(updateDraftState({draft: null}));
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
        recipients: { items: props.messageData ? [props.messageData.from!] : [], value: blankRecipientValue }
      });
      setScheduledDate(undefined)
      setEmailBody('');
      setAttachments([]);

      dispatch(fireEvent({
        event: {
          data: '',
          type: 'richtexteditor.forceUpdate'
        }
      }));

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
    setHideEditorToolbar(true);


    setTimeout(() => {
      let currentEmailBody: string = getPlainTextFromHtml(emailBody);
      if (selectedAccount && selectedAccount.signature && props.replyType !== 'forward' && !currentEmailBody.trim()) {
        let sentence = '';
        if (selectedThread?.projects && selectedThread?.projects.length) {
           sentence = `${selectedAccount?.name || ''} is sharing this email thread (and future replies) with others ${selectedThread?.projects && selectedThread.projects.length === 1 ? `at ${selectedThread.projects[0].name} on Polymail` : 'on Polymail'}`;
        }
        setEmailBody(`<p>${selectedAccount.signature}</p><p style="padding: 5px 10px; background-color: #EBF83E; display: block; width: fit-content; border-radius: 4px; color: #0A101D; font-weight: 500; line-height: 1;">${sentence}</p>`);
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
    if(props.replyType === 'forward') {
      setReplyBoxHide(true)
    }
  }, [props.replyType, handleEditorScroll])

  useEffect(() => {
    handleEditorScroll();
  }, [handleEditorScroll]);

  useEffect(() => {
    if (incomingEvent === 'iframe.clicked') {
      setIsReplyDropdownOpen(false)
    }
  }, [incomingEvent, setIsReplyDropdownOpen]);

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
                  {props.replyType === 'reply-all' ?
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply', props.threadDetails) : null}> Reply</MenuItem> :
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply-all', props.threadDetails) : null}> Reply All</MenuItem>
                  }
                  {props.replyType === 'forward' ?
                    <MenuItem onClick={() => props.hideAndShowReplayBox ? props.hideAndShowReplayBox('reply', props.threadDetails) : null}> Reply</MenuItem> :
                    <MenuItem
                      onClick={() => {
                        if(props.hideAndShowReplayBox){
                          props.hideAndShowReplayBox('forward', props.threadDetails)
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
                {!draft?.updated && 'Not Saved'}
                {draft?.updated &&
                <>
                  Saved <Time time={draft?.updated || ''} isShowFullTime={false} showTimeInShortForm={true} />&nbsp;ago
                </>
                }
              </Text>
            </Flex>
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


          <Flex
            onFocus={() => handleFocus()}
            direction={'column'} position={"relative"} flex={1} overflow={'none'}>
            <Flex direction={'column'} maxH={`calc(315px - ${divHeight}px)`} zIndex={6} ref={editorRef} overflowY={'auto'} className={`editor-bottom-shadow`}
              onScroll={() => handleEditorScroll()}>
              {(selectedThread && collabId) && (
                <CollabRichTextEditor
                    id={'thread-' + collabId}
                    onCreate={() => sendToDraft('')}
                    onFileDrop={(files) => handleFileUpload(files)}
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
                              onClick={() => inputFile.current?.click()}
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
                    <div className={styles.closeIcon} onClick={() => removeAttachmentData(index)}>
                      <CloseIcon />
                    </div>
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
        </Flex>
      </Flex>
    </Flex>
  )
}
