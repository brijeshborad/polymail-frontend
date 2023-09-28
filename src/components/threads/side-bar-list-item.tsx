import styles2 from "@/styles/common.module.css";
import styles from "@/styles/Inbox.module.css";
import {Box, Flex} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {DisneyIcon, DotIcon} from "@/icons";
import {StateType, ThreadListItemProps} from "@/types";
import { useDispatch, useSelector } from "react-redux";
import {useEffect, useRef, useState} from "react";
import { MAILBOX_UNREAD } from "@/utils/constants";
import { updateKeyNavigation } from "@/redux/key-navigation/action-reducer";


export function ThreadsSideBarListItem(props: ThreadListItemProps) {
  const ref = useRef(null);
  const { multiSelection, updateSuccess, error, isThreadFocused, selectedThread } = useSelector((state: StateType) => state.threads);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const dispatch = useDispatch()

    useEffect(() => {
        setIsSelected((multiSelection || [])?.includes(props.thread.id!));
    }, [multiSelection, props.thread.id]);

    useEffect(() => {
      if (isThreadFocused) {
        if (props.thread.id === selectedThread?.id) {
          setIsClicked(false)
        }
      }
    }, [isThreadFocused, props.thread.id, selectedThread?.id])

    useEffect(() => {
      setIsClicked((props.thread.mailboxes || []).includes(MAILBOX_UNREAD));
    }, [props.thread, updateSuccess, error])

    useEffect(() => {
      if(selectedThread && selectedThread.id === props.thread.id) {
        props.onSelect(ref)
      }
    }, [selectedThread, props])

  return (
    <>
      <Box 
        ref={ref} 
        onClick={(e) => {
          props.onClick(e)
          dispatch(updateKeyNavigation({
            target: 'threads'
          }))
        }} 
        className={`${styles.mailDetails} ${isSelected ? styles.mailDetailsSelected : ''}`}
      >
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
      </Box>
    </>
  )
}
