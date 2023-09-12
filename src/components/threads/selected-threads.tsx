import styles from "@/styles/Inbox.module.css";
import { StateType } from "@/types";
import { Box, Button, Image, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { AddToProjectButton } from "../common";
import { ArchiveIcon, TimeSnoozeIcon, TrashIcon } from "@/icons";

export default function SelectedThreads() {
  const { multiSelection } = useSelector((state: StateType) => state.threads)

  return (
    <Box
      className={`${styles.mailBox} ${styles.mailBoxCentered}`}
      height={'calc(100vh - 180px)'} overflow={'hidden'} borderRadius={'15px'}
    >
      <Image
        src={'image/thread-pile.png'}
        alt='threads pile'
      />
      
      <Text className={styles.mailBoxCenteredLabel}>{(multiSelection || []).length} threads selected</Text>
      

      <Box className={styles.addToProjectPlusActions}>
        <AddToProjectButton />
        <Button variant='link' size='xs' onClick={() => {}}><ArchiveIcon /></Button>
        <Button variant='link' size='xs' onClick={() => {}}><TrashIcon /></Button>
        <Button variant='link' size='xs' onClick={() => {}}><TimeSnoozeIcon /></Button>
      </Box>
    </Box>
  )
}