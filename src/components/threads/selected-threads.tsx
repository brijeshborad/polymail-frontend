import styles from "@/styles/Inbox.module.css";
import { StateType } from "@/types";
import {Box, Button, createStandaloneToast, Image, Text, Tooltip} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
import { ArchiveIcon, TrashIcon } from "@/icons";
import dynamic from "next/dynamic";
import {batchUpdateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import { Toaster } from "../common/toaster";
import { MAILBOX_ARCHIVE, MAILBOX_SNOOZED, MAILBOX_TRASH } from "@/utils/constants";
import React, {useCallback, useEffect, useState} from "react";
import {Thread} from "@/models";
import dayjs from "dayjs";
const MessageSchedule = dynamic(() => import("../messages/message-schedule").then(mod => mod.default));

export default function SelectedThreads() {
  const { multiSelection: selectedThreadIds, threads, moveToMailBox, snoozeTime } = useSelector((state: StateType) => state.threads)
  const dispatch = useDispatch();
  const messagePlural = (selectedThreadIds || []).length === 1 ? 'message' : 'messages'
  const { toast } = createStandaloneToast()
  const [scheduledDate, setScheduledDate] = useState<string | undefined>();

  const notification = useCallback((title: string, thread: Thread = {}, type: string) => {
    let polyToast = `poly-toast-${new Date().getTime().toString()}`;
    Toaster({
      type: thread.hasOwnProperty('mailboxes') ? 'undo_changes': 'success',
      title,
      desc: `Your message has been moved to ${type.toLowerCase()}`,
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
          notification('Thread was moved from ' + type.toLowerCase() + '.', {}, type);
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
  }, [dispatch, selectedThreadIds, threads, toast])

  const moveThreadToMailBoxes = useCallback((type: string, date: string = '') => {
    if(selectedThreadIds && selectedThreadIds.length) {
      let body: any  = {
        threadIds: selectedThreadIds,
        mailboxes: [type]
      }
      if (type === MAILBOX_SNOOZED) {
        const targetDate = dayjs(date)
        const currentDate = dayjs();
        const secondsDifference = targetDate.diff(currentDate, 'second');
        body.snooze = secondsDifference
      }
      dispatch(batchUpdateThreads(body))
      let threadData = (threads || []).filter((item : Thread) => selectedThreadIds.includes(item.id!));

      let threadsData = (threads || []).filter((item: Thread) => !selectedThreadIds.includes(item.id!));
      notification(`${selectedThreadIds.length} ${messagePlural} has been ${type.toLowerCase()}`, threadData[0], type)
      dispatch(updateThreadState({
        threads: threadsData,
        selectedThread: threadsData[0],
        isThreadSearched: false,
        multiSelection: [],
      }))
    }
  }, [dispatch, messagePlural, notification, selectedThreadIds, threads])

  useEffect(() => {
    if (moveToMailBox) {
      if (snoozeTime) {
        moveThreadToMailBoxes(moveToMailBox, snoozeTime);
      } else {
        moveThreadToMailBoxes(moveToMailBox);
      }
      dispatch(updateThreadState({moveToMailBox: null, snoozeTime: null}));
    }
  }, [dispatch, moveThreadToMailBoxes, moveToMailBox])

  const handleSchedule = (date: string | undefined) => {
    setScheduledDate(date);
    moveThreadToMailBoxes(MAILBOX_SNOOZED, date);
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
          {/*<Button variant='link' size='xs' onClick={() => moveThreadToMailBoxes(MAILBOX_SNOOZED)}><TimeSnoozeIcon /></Button>*/}
          <div>
            <MessageSchedule
              isSnooze={true}
              date={scheduledDate}
              onChange={handleSchedule}
            />
          </div>
        </Tooltip>
      </Box>
    </Box>
  )
}
