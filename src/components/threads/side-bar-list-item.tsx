import styles2 from "@/styles/common.module.css";
import styles from "@/styles/Inbox.module.css";
import {Flex} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {DisneyIcon, DotIcon} from "@/icons";
import {StateType, ThreadListItemProps} from "@/types";
import { useSelector } from "react-redux";
import {useEffect, useState} from "react";
import { MAILBOX_UNREAD } from "@/utils/constants";


export function ThreadsSideBarListItem(props: ThreadListItemProps) {
  const { multiSelection, updateSuccess, error } = useSelector((state: StateType) => state.threads);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);

    useEffect(() => {
        setIsSelected((multiSelection || [])?.includes(props.thread.id!));
    }, [multiSelection, props.thread.id]);

    const removeDotIcon = () => {
      setIsClicked(false)
    }

    useEffect(() => {
      setIsClicked((props.thread.mailboxes || []).includes(MAILBOX_UNREAD));
    }, [props.thread, updateSuccess, error])

  return (
    <>
      <div className={`${styles.mailDetails} ${isSelected ? styles.mailDetailsSelected : ''}`} onClick={() => removeDotIcon()}>
          <Flex align={"center"} justify={'space-between'}>
              <Flex align={"center"} className={styles.senderDetails} gap={1}>
                  <DisneyIcon/> {props?.thread?.from?.name || props?.thread?.from?.email}
              </Flex>
              <Flex alignItems={'center'} className={styles2.receiveTime} justify={'flex-end'}>
                  {isClicked &&
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
