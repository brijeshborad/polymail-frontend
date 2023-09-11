import { Message, Thread } from "@/models";
import styles from "@/styles/Inbox.module.css";
import { Flex, Input, useDisclosure } from "@chakra-ui/react";
import React, { useCallback, useRef, useState } from "react";
import { updateMessageState } from "@/redux/messages/action-reducer";
import { updateThreadState, updateThreads } from "@/redux/threads/action-reducer";
import { updateDraftState } from "@/redux/draft/action-reducer";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "@/types";
import { ThreadListProps } from "@/types";
import { ThreadsSideBarListItem } from "./side-bar-list-item";
import { useRouter } from "next/router";
import { ComposeBox } from "@/components/inbox";


export function ThreadsSideBarList(props: ThreadListProps) {
  const { selectedThread, threads } = useSelector((state: StateType) => state.threads);
  const dispatch = useDispatch()
  const listRef = useRef<any>(null);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [messageDetails, setMessageDetails] = useState<Message | null>(null);

  const routePaths = router.pathname.split('/');

  const handleClick = useCallback((item: Thread) => {
    if (props.tab === 'DRAFT') {
      if (item && item.messages && item.messages.length === 1) {
        setMessageDetails(item.messages[0])
        onOpen();
        return;
      }
    }
    dispatch(updateThreadState({ selectedThread: item }));
    dispatch(updateMessageState({ selectedMessage: null, messages: [] }));
    dispatch(updateDraftState({ draft: null }));

    if (item?.mailboxes?.includes('UNREAD')) {
      dispatch(updateThreads({
        id: item.id,
        body: {
          mailboxes: (item.mailboxes || []).filter(i => i !== 'UNREAD')
        }
      }))
    }
  }, [dispatch, props.tab]);


  return (
    <>
      <div>
        <Flex direction={'column'} gap={2} marginTop={5} pb={3}
          className={`${styles.mailList} ${routePaths.includes('projects') ? styles.projectMailList : ''}`}>
          <Input type={'text'} opacity={0} height={0} width={0} padding={0} border={0} outline={0}
            ref={listRef} />

          {threads && threads.length > 0 && threads.map((item: Thread, index: number) => (
            <div onClick={() => handleClick(item)} key={index}
              className={`${selectedThread && selectedThread.id === item.id ? styles.selectedThread : ''}`}>
              <ThreadsSideBarListItem thread={item} tab={props.tab} />
            </div>
          ))}
        </Flex>
      </div>

      <ComposeBox onOpen={onOpen} isOpen={isOpen} onClose={onClose} messageDetails={messageDetails} />
    </>
  )
}
