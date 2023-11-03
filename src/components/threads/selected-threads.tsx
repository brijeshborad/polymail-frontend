import styles from "@/styles/Inbox.module.css";
import {StateType} from "@/types";
import {Box, Button, Flex, Image, Text} from "@chakra-ui/react";
import {useSelector} from "react-redux";
import {ArchiveIcon, TrashIcon} from "@/icons";
import dynamic from "next/dynamic";
import {MAILBOX_ARCHIVE, MAILBOX_SNOOZED, MAILBOX_TRASH} from "@/utils/constants";
import React, {useState} from "react";
import {threadService} from "@/services";
import Tooltip from "../common/Tooltip";

const AddToProjectButton = dynamic(() => import("@/components/common").then(mod => mod.AddToProjectButton));
const MessageSchedule = dynamic(() => import("../messages/message-schedule").then(mod => mod.default));

export default function SelectedThreads() {
    const {multiSelection: selectedThreadIds} = useSelector((state: StateType) => state.threads)
    const [scheduledDate, setScheduledDate] = useState<string | undefined>();

    const handleSchedule = (date: string | undefined) => {
        setScheduledDate(date);
        threadService.moveThreadToMailBox(MAILBOX_SNOOZED, date);
    }

    return (
        <Box
            className={`${styles.mailBox} ${styles.mailBoxCentered}`}
            height={'calc(100vh - 165px)'} overflow={'hidden'} borderRadius={'15px'}
        >
            <Image
                src={'/image/thread-pile.png'}
                alt='threads pile'
            />

            <Text className={styles.mailBoxCenteredLabel}>{(selectedThreadIds || []).length} selected</Text>


            <Box className={styles.addToProjectPlusActions}>
                <AddToProjectButton allowDefaultSelect={false}/>
                <Flex align={'center'} gap={'8px'}>
                    <Tooltip label='Archive' placement='bottom'>
                        <Button variant='link' size='xs'
                                onClick={() => threadService.moveThreadToMailBox(MAILBOX_ARCHIVE)}><ArchiveIcon/></Button>
                    </Tooltip>

                    <Tooltip label='Trash' placement='bottom'>
                        <Button variant='link' size='xs'
                                onClick={() => threadService.moveThreadToMailBox(MAILBOX_TRASH)}><TrashIcon/></Button>
                    </Tooltip>

                    <Tooltip label='Snooze' placement='bottom'>
                        {/*<Button variant='link' size='xs' onClick={() => moveThreadToMailBoxes(MAILBOX_SNOOZED)}><TimeSnoozeIcon /></Button>*/}
                        <div>
                            <MessageSchedule
                                isSnooze={true}
                                date={scheduledDate}
                                onChange={handleSchedule}
                            />
                        </div>
                    </Tooltip>
                </Flex>
            </Box>
        </Box>
    )
}
