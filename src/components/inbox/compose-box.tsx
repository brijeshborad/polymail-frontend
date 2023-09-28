import {
  Box,
  Button, createStandaloneToast,
  Flex, Heading, Input,
  Modal,
  ModalBody,
  ModalContent, ModalFooter,
  ModalOverlay,
  Text, useDisclosure
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import { FileIcon, TextIcon } from "@/icons";
import { CloseIcon } from "@chakra-ui/icons";
import React, { ChangeEvent, ChangeEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { StateType } from "@/types";
import { debounce, isEmail } from "@/utils/common.functions";
import { createDraft, sendMessage, updateDraftState, updatePartialMessage } from "@/redux/draft/action-reducer";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {uploadAttachment} from "@/redux/messages/action-reducer";
import {MessageAttachments, MessageRecipient, Thread} from "@/models";
import { Toaster } from "@/components/common";
import { RecipientsType } from "@/types/props-types/message-recipients.type";
import dynamic from "next/dynamic";
import {updateCommonState} from "@/redux/common-apis/action-reducer";
import {updateThreadState} from "@/redux/threads/action-reducer";
import {useRouter} from "next/router";
import {fireEvent} from "@/redux/global-events/action-reducer";
const CreateNewProject = dynamic(() => import('@/components/project/create-new-project').then(mod => mod.default));
const RichTextEditor = dynamic(() => import("@/components/common").then(mod => mod.RichTextEditor));
const Time = dynamic(() => import("@/components/common").then(mod => mod.Time));
const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
const MessageRecipients = dynamic(() => import("../messages/message-recipients").then(mod => mod.default));
const MessageSchedule = dynamic(() => import("../messages/message-schedule").then(mod => mod.default));

const blankRecipientValue: MessageRecipient = {
  name: '',
  email: ''
}

export function ComposeBox(props: any) {
  const [emailRecipients, setEmailRecipients] = useState<RecipientsType>({
    cc: {
      items: [],
      value: blankRecipientValue
    },
    bcc: {
      items: [],
      value: blankRecipientValue
    },
    recipients: {
      items: [],
      value: blankRecipientValue
    },
  })
  const [subject, setSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const { selectedAccount } = useSelector((state: StateType) => state.accounts);
  const { draft } = useSelector((state: StateType) => state.draft);
  const { tabValue, threads } = useSelector((state: StateType) => state.threads);
  const dispatch = useDispatch();
  const { onClose } = useDisclosure();
  const { isOpen: isOpenProject, onOpen: onOpenProject, onClose: onCloseProject } = useDisclosure();
  const { isOpen: isDraftConformationModal, onOpen: onOpenDraftConformationModal, onClose: onCloseDraftConformationModal } = useDisclosure();
  const [scheduledDate, setScheduledDate] = useState<string>();
  const [attachments, setAttachments] = useState<MessageAttachments[]>([]);
  const [extraClassNames, setExtraClassNames] = useState<string>('');
  const [extraClassNamesForBottom, setExtraClassNamesForBottom] = useState<string>('');
  const inputFile = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<any>(null);
  const { toast } = createStandaloneToast();
  const [isDraftUpdated, setIsDraftUpdated] = useState<boolean>(false);
  const [waitForDraft, setWaitForDraft] = useState<boolean>(false);
  const router = useRouter();

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
            value: blankRecipientValue
          }
        }));
      }
      if (cc && cc.length) {
        setEmailRecipients((prevState) => ({
          ...prevState,
          cc: {
            items: cc,
            value: blankRecipientValue
          }
        }));
      }
      if (bcc && bcc.length) {
        setEmailRecipients((prevState) => ({
          ...prevState,
          bcc: {
            items: bcc,
            value: blankRecipientValue
          }
        }));
      }


      if (draftInfo && draftInfo.body) {
        setEmailBody(draftInfo.body);
      }
    }
  }, [props.messageDetails])

  useEffect(() => {
    if (props.isOpen) {
      handleEditorScroll();
    }
  }, [props.isOpen]);

  const isValid = (email: string, type: string) => {
    let error = null;
    if ((emailRecipients[type as keyof RecipientsType].items || []).map(r => r.email).includes(email)) {
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
    setEmailRecipients((prevState) => ({
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

  useEffect(() => {
    if (waitForDraft && draft && draft.id) {
      setWaitForDraft(false);
      sendToDraft('', false);
    }
  }, [waitForDraft, draft])

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

  const handlePaste = (evt: ClipboardEvent | any, type: string) => {
    evt.preventDefault();

    let paste = evt.clipboardData.getData("text");
    let emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g);

    if (emails) {
      let toBeAdded = emails.filter((item: string) => !emailRecipients[type as keyof RecipientsType].items.map(r => r.email).includes(item));
      setEmailRecipients((prevState) => ({
        ...prevState,
        [type as keyof RecipientsType]: {
          items: [...prevState[type as keyof RecipientsType].items, ...toBeAdded],
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
          setEmailRecipients((prevState) => ({
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
    setEmailRecipients((prevState) => ({
      ...prevState,
      [type as keyof RecipientsType]: {
        items: prevState[type as keyof RecipientsType].items.map(i => i.email).filter(i => i !== item),
        value: blankRecipientValue
      }
    }));
  };

  const addSubject = (event: ChangeEvent | any) => {
    if (event.target.value) {
      setIsDraftUpdated(true)
    }
    setSubject(event.target.value || '');
  }

  const sendToDraft = (value: string, isValueUpdate: boolean = true) => {
    if (value.trim()) {
      setIsDraftUpdated(true)
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
        body: value
      },
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
          setIsDraftUpdated(true);
          setWaitForDraft(true);
          dispatch(createDraft({ accountId: selectedAccount.id, body }));
        }
      }
    }, 500);
  }

  const discardMessage = () => {
    if (selectedAccount && selectedAccount.signature) {
      setEmailBody(`<p></p><p>${selectedAccount.signature}</p>`);
      dispatch(fireEvent({event: {data: `<p></p><p>${selectedAccount.signature}</p>`, type: 'richtexteditor.forceUpdate'}}));
    }
  }

  const sendMessages = () => {
    if (draft && draft.id) {
      let params = {};
      let polyToast = `poly-toast-${new Date().getTime().toString()}`;
      if (scheduledDate) {
        const targetDate = dayjs(scheduledDate)
        // Get the current date and time
        const currentDate = dayjs();
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

      if (props.onClose) {
        props.onClose();
      }

      setEmailRecipients({
        cc: {
          items: [],
          value: blankRecipientValue
        },
        bcc: {
          items: [],
          value: blankRecipientValue
        },
        recipients: {
          items: [],
          value: blankRecipientValue
        }
      });
      setEmailBody('');
      setSubject('');

      if(props.tabValue === 'DRAFT') {
        (threads || []).map((item: Thread) => {
          if (item.id === draft.threadId) {
            const newThreadArray = (threads || []).filter(obj => obj.id !== draft.threadId);
            dispatch(updateThreadState({threads: newThreadArray, selectedThread: newThreadArray[0]}));
            dispatch(updateCommonState({ isComposing: true }));
          }
        })
      } else {
        dispatch(updateCommonState({ isComposing: false, allowThreadSelection: true }));
      }

      dispatch(updateDraftState({
        draft: null,
      }));
    }
  }

  useEffect(() => {
    if (selectedAccount && selectedAccount.signature) {
      setEmailBody(`<p>${selectedAccount.signature}</p>`);
    }
  }, [selectedAccount, props.isOpen])

  const handleSchedule = (date: string | undefined) => {
    setScheduledDate(date);
  }

  useEffect(() => {
    const propertiesToCheck: (keyof RecipientsType)[] = ['recipients', 'bcc', 'cc'];
    let allValues: MessageRecipient[] = [];
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
      if (scrollBottom > 1) {
        setExtraClassNamesForBottom(prevState => !prevState.includes('show-shadow-bottom') ? prevState + ' show-shadow-bottom' : prevState);
      } else {
        setExtraClassNamesForBottom(prevState => prevState.replace('show-shadow-bottom', ''));
      }
    }

  }, []);

  const onCloseClick = () => {
    if (!isDraftUpdated) {
      dispatch(updateCommonState({ isComposing: false, allowThreadSelection: tabValue !== 'DRAFT' }));
      if (tabValue === 'DRAFT') {
        dispatch(updateThreadState({ selectedThread: null }));
      }
    } else {
      onOpenDraftConformationModal()
    }

  }

  const modalCloseConfirmation = (type: string) => {
    if (type === 'yes') {
      sendToDraft('', false)
    }
    onCloseDraftConformationModal();
    dispatch(updateCommonState({ isComposing: false, allowThreadSelection: tabValue !== 'DRAFT' }));
    if (tabValue === 'DRAFT') {
      dispatch(updateThreadState({ selectedThread: null }));
    }
  }


  return (
    <>
      <Box className={`${styles.mailBox} ${styles.composeBox}`}
           height={'calc(100vh - 165px)'} overflow={'hidden'} borderRadius={'15px'} >

        <Flex padding={'16px 20px'} align={'center'} justify={'space-between'} gap={3} className={styles.composeHeader} borderBottom={'1px solid #E5E7EB'}>
          <Flex gap={1} align={'center'}>
            <Heading as='h6' fontSize={'12px'} color={'#0A101D'} fontWeight={500} lineHeight={1}>Draft </Heading>
            <Text fontSize='xs' lineHeight={1} color={'#6B7280'} display={'flex'} alignItems={'center'} fontWeight={400}>(Saved to drafts&nbsp;
              {(props.messageDetails && props.messageDetails?.created) ? <Time as={'span'} time={props.messageDetails?.created || ''} isShowFullTime={false} showTimeInShortForm={true} /> : '0s'}&nbsp;ago)</Text>
          </Flex>
          <Flex color={'#6B7280'} fontSize={'13px'} h={'20px'} w={'20px'} align={'center'} justify={'center'} cursor={'pointer'} onClick={() => onCloseClick()}> <CloseIcon/> </Flex>
        </Flex>

        <Flex direction={'column'} flex={1}>
          <Flex align={'center'} justify={'space-between'} gap={3} padding={'16px 20px'}
                borderBottom={'1px solid #E5E7EB'}>
            <Input className={styles.subjectInput} placeholder='Enter subject title' fontSize={'15px'}
                   flex={1} fontWeight={'600'} padding={'0'} border={'0'} h={'auto'}
                   borderRadius={'0'} lineHeight={1} color={'#0A101D'}
                   onChange={(e) => addSubject(e)} value={subject || ''} />
            <div>
              <AddToProjectButton />
            </div>

          </Flex>

          <Flex padding={5} flex={1}>
            <Flex w={'100%'} gap={4} padding={4} direction={'column'} border={'1px solid #F3F4F6'} borderRadius={8}>
              <MessageRecipients
                  emailRecipients={emailRecipients}
                  handleKeyDown={handleKeyDown}
                  handleChange={handleChange}
                  handlePaste={handlePaste}
                  handleAutoCompleteSelect={handleAutoCompleteSelect}
                  handleItemDelete={handleItemDelete}
              />
              <Flex flex={1} direction={'column'} position={'relative'}>
                <Flex flex={1} direction={'column'} ref={editorRef} className={`editor-bottom-shadow`}
                      onScroll={() => handleEditorScroll()}>
                  <RichTextEditor className={`reply-message-area ${extraClassNames} ${extraClassNamesForBottom}`}
                                  placeholder='Reply with anything you like or @mention someone to share this thread'
                                  value={emailBody} onChange={(e) => sendToDraft(e)} />
                  {attachments && attachments.length > 0 ?
                    <div style={{ marginTop: '20px' }}>
                      {attachments.map((item, index: number) => (
                          <Flex align={'center'} key={index} className={styles.attachmentsFile}>
                            {item.filename}
                            <div className={styles.closeIcon} onClick={() => removeAttachment(index)}><CloseIcon /> </div>
                          </Flex>
                      ))}
                  </div> : null}
                </Flex>

                <Flex backgroundColor={'#EBF83E'} width={'fit-content'} borderRadius={'4px'} color={'#0A101D'} fontWeight={'500'} lineHeight={1} padding={'5px 10px'}>
                  <Text fontSize='xs'> {selectedAccount?.name || ''} is sharing this email thread (and future replies) with&nbsp;</Text>
                  <Text fontSize='xs' as='u'>1 person</Text>
                  <Text fontSize='xs'>&nbsp;at chiat.com on&nbsp;</Text>
                  <Text fontSize='xs' as='u'> Polymail</Text>
                </Flex>

                <Flex align={'flex-end'} justify={'space-between'} gap={2}>
                  <Flex gap={2} className={styles.replyBoxIcon} mb={'-3px'} position={'relative'} zIndex={5} ml={'170px'}>
                    <Flex align={'center'} gap={2}>
                      <Flex width={'20px'} h={'20px'} align={'center'} justify={'center'} cursor={'pointer'} className={styles.replyIcon}>
                        <FileIcon click={() => inputFile.current?.click()} />
                      </Flex>

                      <input type='file' id='file' ref={inputFile} onChange={(e) => handleFileUpload(e)}
                             style={{ display: 'none' }} />

                      <Flex width={'20px'} h={'20px'} align={'center'} justify={'center'} cursor={'pointer'} className={styles.replyIcon}>
                        <TextIcon />
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex align={'center'} className={styles.replyButton}>
                    <Button
                        className={styles.replyTextDiscardButton}
                        fontSize={14} lineHeight={16}
                        onClick={() => discardMessage()}
                    >
                      Discard
                    </Button>
                    <Button className={styles.replyTextButton} colorScheme='blue' onClick={() => sendMessages()}>
                      {scheduledDate ? (
                          <>Send {dayjs(scheduledDate).from(dayjs())} @ {dayjs(scheduledDate).format('hh:mmA')}</>
                      ) : (
                          <>Send</>
                      )}
                    </Button>
                    <MessageSchedule date={scheduledDate} sendMessages={sendMessages} onChange={handleSchedule} />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      <CreateNewProject onOpen={onOpenProject} isOpen={isOpenProject} onClose={onCloseProject} />

      <Modal isOpen={isDraftConformationModal} onClose={onOpenDraftConformationModal} isCentered>
        <ModalOverlay backgroundColor={'rgba(229, 231, 235, 0.50)'} backdropFilter={'blur(16px)'}/>
        <ModalContent className={'confirm-modal'} borderRadius={12} boxShadow={'0 0 12px 0 rgba(0,0,0, 0.08)'} padding={'12px'} maxW={'420px'}>
          <ModalBody padding={'12px 12px 24px'}>
            <Heading as='h5' fontSize={'15px'} color={'#0A101D'} lineHeight={1.21}>Are you sure?</Heading>
            <Text color={'#6B7280'} mt={1} fontSize='13px'>This action cannot be undone</Text>
          </ModalBody>

          <ModalFooter className={'confirm-modal-footer'} borderTop={'1px solid #F3F4F6'} px={0} pb={0}>
            <Button className={'cancel-button footer-button'} colorScheme='blue' mr={3} onClick={() => modalCloseConfirmation('no')}>Cancel</Button>
            <Button className={'confirm-button footer-button'} variant='ghost' onClick={() => modalCloseConfirmation('yes')}>Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
