import styles from "@/styles/Inbox.module.css";
import {StateType} from "@/types";
import {Box, Button, Image, Text, Tooltip} from "@chakra-ui/react";
import {useDispatch, useSelector} from "react-redux";
import {ArchiveIcon, TrashIcon} from "@/icons";
import dynamic from "next/dynamic";
import {batchUpdateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {MAILBOX_ARCHIVE, MAILBOX_SNOOZED, MAILBOX_TRASH} from "@/utils/constants";
import React, {useCallback, useEffect, useState} from "react";
import {Thread} from "@/models";
import dayjs from "dayjs";

const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
const MessageSchedule = dynamic(() => import("../messages/message-schedule").then(mod => mod.default));

export default function SelectedThreads() {
  const { multiSelection: selectedThreadIds, threads, moveToMailBox, snoozeTime } = useSelector((state: StateType) => state.threads)
  const [scheduledDate, setScheduledDate] = useState<string | undefined>();
  const dispatch = useDispatch();
  const messagePlural = (selectedThreadIds || []).length === 1 ? 'message' : 'messages'

  const moveThreadToMailBoxes = useCallback((type: string, date: string = '') => {
    if(selectedThreadIds && selectedThreadIds.length) {
      let body: any  = {
        threadIds: selectedThreadIds,
        mailboxes: [type]
      }
      let polyToast = `poly-toast-${new Date().getMilliseconds().toString()}`;
      if (type === MAILBOX_SNOOZED) {
        const targetDate = dayjs(date)
        const currentDate = dayjs();
        body.snooze = targetDate.diff(currentDate, 'second')
      }
      let threadData = (threads || []).filter((item : Thread) => selectedThreadIds.includes(item.id!));

      dispatch(batchUpdateThreads({
        body: {body},
        toaster: {
          success: {
              desc: `Your message has been moved to ${type.toLowerCase()}`,
              title: `${selectedThreadIds.length} ${messagePlural} has been ${type.toLowerCase()}`,
              type: 'undo_changes',
              id: polyToast,
          }
        },
        undoAction: {
          showUndoButton: true,
          dispatch,
          action: batchUpdateThreads,
          undoBody: {
            body: {
              threadIds: selectedThreadIds || [],
              mailboxes: threadData[0].mailboxes || [],
            },
            tag: type.toLowerCase(),
            data: threads,
            forThread: true
          },
          showToasterAfterUndoClick: true
        }
      }))


      let threadsData = (threads || []).filter((item: Thread) => !selectedThreadIds.includes(item.id!));
      dispatch(updateThreadState({
        threads: threadsData,
        selectedThread: threadsData[0],
        isThreadSearched: false,
        multiSelection: [],
      }))
    }
  }, [dispatch, messagePlural, selectedThreadIds, threads])

  useEffect(() => {
    if (moveToMailBox) {
      if (snoozeTime) {
        moveThreadToMailBoxes(moveToMailBox, snoozeTime);
      } else {
        moveThreadToMailBoxes(moveToMailBox);
      }
      dispatch(updateThreadState({moveToMailBox: null, snoozeTime: null}));
    }
  }, [dispatch, moveThreadToMailBoxes, moveToMailBox, snoozeTime])

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
