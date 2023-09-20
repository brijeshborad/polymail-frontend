import styles from "@/styles/Inbox.module.css";
import { StateType } from "@/types";
import {Box, Button, Image, Text, Tooltip} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
import { ArchiveIcon, TimeSnoozeIcon, TrashIcon } from "@/icons";
import dynamic from "next/dynamic";
import {batchUpdateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import { Toaster } from "../common/toaster";
import { MAILBOX_ARCHIVE, MAILBOX_SNOOZED, MAILBOX_TRASH } from "@/utils/constants";
import React from "react";

export default function SelectedThreads() {
  const { multiSelection: selectedThreadIds } = useSelector((state: StateType) => state.threads)
  const dispatch = useDispatch();
  const messagePlural = (selectedThreadIds || []).length === 1 ? 'message' : 'messages'
  
  const notification = (title: string) => {
    Toaster({
      type: 'success',
      title,
      desc: `Your message has been scheduled`
    })
  }

  const moveThreadToMailBoxes = (type: string) => {
    if(selectedThreadIds && selectedThreadIds.length) {
      let body = {
        threadIds: selectedThreadIds,
        mailboxes: [type]
      }
      dispatch(batchUpdateThreads(body))
      notification(`${selectedThreadIds.length} ${messagePlural} has been ${type.toLowerCase()}`)
      dispatch(updateThreadState({
        isThreadSearched: false,
        multiSelection: []
      }))
    }
  }

  return (
    <Box
      className={`${styles.mailBox} ${styles.mailBoxCentered}`}
      height={'calc(100vh - 180px)'} overflow={'hidden'} borderRadius={'15px'}
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
