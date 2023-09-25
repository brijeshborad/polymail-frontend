import styles from "@/styles/Inbox.module.css";
import { StateType } from "@/types";
import {Box, Button, createStandaloneToast, Image, Text, Tooltip} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
import { ArchiveIcon, TimeSnoozeIcon, TrashIcon } from "@/icons";
import dynamic from "next/dynamic";
import {batchUpdateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import { Toaster } from "../common/toaster";
import { MAILBOX_ARCHIVE, MAILBOX_SNOOZED, MAILBOX_TRASH } from "@/utils/constants";
import React, {useState} from "react";
import {Thread} from "@/models";

export default function SelectedThreads() {
  const { multiSelection: selectedThreadIds, threads } = useSelector((state: StateType) => state.threads)
  const dispatch = useDispatch();
  const messagePlural = (selectedThreadIds || []).length === 1 ? 'message' : 'messages'
  const [mailBoxName, setMailBoxName] = useState<string>('');
  const { toast } = createStandaloneToast()

  const notification = (title: string, thread: Thread = {}) => {
    let polyToast = `poly-toast-${new Date().getTime().toString()}`;
    Toaster({
      type: thread.hasOwnProperty('mailboxes') ? 'undo_changes': 'success',
      title,
      desc: `Your message has been scheduled`,
      id: polyToast,
      ...(thread.hasOwnProperty('mailboxes') ? {
        undoUpdateRecordClick: () => {
          dispatch(updateThreadState({
            selectedThread: null,
          }))
          let body = {
            threadIds: selectedThreadIds || [],
            mailboxes: thread.mailboxes || []
          }
          dispatch(batchUpdateThreads(body))
          notification('Thread was moved from ' + mailBoxName.toLowerCase() + '.');
          dispatch(updateThreadState({
            isThreadSearched: false,
            multiSelection: [],
            threads: threads,
            selectedThread: thread,
            success: true,
            updateSuccess: true
          }))
          toast.close(`${polyToast}`);
        }
      }: {})
    })
  }

  const moveThreadToMailBoxes = (type: string) => {
    setMailBoxName(type);
    if(selectedThreadIds && selectedThreadIds.length) {
      let body = {
        threadIds: selectedThreadIds,
        mailboxes: [type]
      }
      dispatch(batchUpdateThreads(body))
      let threadData = (threads || []).filter((item : Thread) => selectedThreadIds.includes(item.id!));

      let threadsData = (threads || []).filter((item: Thread) => !selectedThreadIds.includes(item.id!));
      notification(`${selectedThreadIds.length} ${messagePlural} has been ${type.toLowerCase()}`, threadData[0])
      dispatch(updateThreadState({
        threads: threadsData,
        selectedThread: threadsData[0],
        isThreadSearched: false,
        multiSelection: [],
      }))
    }
  }

  return (
    <Box
      className={`${styles.mailBox} ${styles.mailBoxCentered}`}
      height={'calc(100vh - 165px)'} overflow={'hidden'} borderRadius={'15px'}
    >
      <Image
        src={'image/thread-pile.png'}
        alt='threads pile'
      />

      <Text className={styles.mailBoxCenteredLabel}>{(selectedThreadIds || []).length} threads selected</Text>


      <Box className={styles.addToProjectPlusActions}>
        <AddToProjectButton />
        <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>
          <Button variant='link' size='xs' onClick={() => moveThreadToMailBoxes(MAILBOX_ARCHIVE)}><ArchiveIcon /></Button>
        </Tooltip>

        <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>
          <Button variant='link' size='xs' onClick={() => moveThreadToMailBoxes(MAILBOX_TRASH)}><TrashIcon /></Button>
        </Tooltip>

        <Tooltip label='Snooze' placement='bottom' bg='gray.300' color='black'>
          <Button variant='link' size='xs' onClick={() => moveThreadToMailBoxes(MAILBOX_SNOOZED)}><TimeSnoozeIcon /></Button>
        </Tooltip>
      </Box>
    </Box>
  )
}
