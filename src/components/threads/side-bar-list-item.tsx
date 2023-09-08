
import styles2 from "@/styles/common.module.css";
import styles from "@/styles/Inbox.module.css";
import {Flex} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {DisneyIcon, DotIcon} from "@/icons";
import {ThreadListItemProps} from "@/types";


export function ThreadsSideBarListItem(props: ThreadListItemProps) {
  return (
    <>
      <div className={`${styles.mailDetails}`}>
          <Flex align={"center"} justify={'space-between'}>
              <Flex align={"center"} className={styles.senderDetails} gap={1}>
                  <DisneyIcon/> {props.thread.from || 'Anonymous'}
              </Flex>
              <Flex alignItems={'center'} className={styles2.receiveTime} justify={'flex-end'}>
                  {(props.thread.mailboxes || []).includes('UNREAD') &&
                  <DotIcon marginRight={'5px'} className={`readThreadIcon`} color={'#9ca3af'}/>}
                  <Time time={props.thread.latestMessage} isShowFullTime={false} showTimeInShortForm={false}/>
              </Flex>
          </Flex>
          <div className={styles.mailMessage}>
              {props.thread.subject || "(no subject)"}
          </div>
      </div>
    </>
  )
}
