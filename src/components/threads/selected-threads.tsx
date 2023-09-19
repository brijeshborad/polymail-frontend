import styles from "@/styles/Inbox.module.css";
import { StateType } from "@/types";
import { Box, Button, Image, Text } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
import { ArchiveIcon, TimeSnoozeIcon, TrashIcon } from "@/icons";
import dynamic from "next/dynamic";
import { batchUpdateThreads } from "@/redux/threads/action-reducer";
import { Toaster } from "../common/toaster";

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

  const handleArchive = () => {
    if(selectedThreadIds) {
      dispatch(batchUpdateThreads({
        threadIds: selectedThreadIds,
        mailboxes: ['ARCHIVE']
      }))
      notification(`${selectedThreadIds.length} ${messagePlural} has been archived`)
    }
  }

  const handleTrash = () => {
    if(selectedThreadIds) {
      dispatch(batchUpdateThreads({
        threadIds: selectedThreadIds,
        mailboxes: ['TRASH']
      }))
      notification(`${selectedThreadIds.length} ${messagePlural} has been moved to trash`)
    }
  }

  const handleSnooze = () => {
    if(selectedThreadIds) {
      dispatch(batchUpdateThreads({
        threadIds: selectedThreadIds,
        mailboxes: ['SNOOZED']
      }))
      notification(`${selectedThreadIds.length} ${messagePlural} has been snoozed`)
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
        <Button variant='link' size='xs' onClick={handleArchive}><ArchiveIcon /></Button>
        <Button variant='link' size='xs' onClick={handleTrash}><TrashIcon /></Button>
        <Button variant='link' size='xs' onClick={handleSnooze}><TimeSnoozeIcon /></Button>
      </Box>
    </Box>
  )
}
