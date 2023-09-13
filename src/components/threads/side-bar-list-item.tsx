
import styles2 from "@/styles/common.module.css";
import styles from "@/styles/Inbox.module.css";
import {Flex} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {DisneyIcon, DotIcon} from "@/icons";
import {StateType, ThreadListItemProps} from "@/types";
import { useSelector } from "react-redux";


export function ThreadsSideBarListItem(props: ThreadListItemProps) {
  const { multiSelection } = useSelector((state: StateType) => state.threads);
  const isSelected = (multiSelection || [])?.includes(props.thread.id!)

  return (
    <>
      <div className={`${styles.mailDetails} ${isSelected ? styles.mailDetailsSelected : ''}`}>
          <Flex align={"center"} justify={'space-between'}>
              <Flex align={"center"} className={styles.senderDetails} gap={1}>
                  <DisneyIcon/> {props?.thread?.from?.name || props?.thread?.from?.email}
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
