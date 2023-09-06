import {MessageDraft, Thread} from "@/models";
import styles from "@/styles/Inbox.module.css";
import {Flex, Input} from "@chakra-ui/react";
import {useCallback, useRef} from "react";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {updateThreadState} from "@/redux/threads/action-reducer";
import {updateDraftState} from "@/redux/draft/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {ThreadListProps} from "@/types";
import { ThreadsSideBarListItem } from "./side-bar-list-item";


export function ThreadsSideBarList(props: ThreadListProps) {
  const {selectedThread, threads} = useSelector((state: StateType) => state.threads);
  const dispatch = useDispatch()
  const listRef = useRef<any>(null);

  const handleClick = useCallback((item: Thread) => {
    if (props.tab === 'DRAFT') {
        if (item && item.messages && item.messages[0]) {
            dispatch(updateMessageState({isCompose: false}));
            setTimeout(() => {
                if (item && item.messages && item.messages[0]) {
                    dispatch(updateMessageState({
                        selectedMessage: null,
                        isCompose: true
                    }));
                    dispatch(updateDraftState({
                        draft: {...item.messages[0] as MessageDraft}
                    }));
                }
            }, 500)
        }
        return;
    }
    {/*if ((item.mailboxes || []).includes('UNREAD')) {
        let currentThreads = [...threads || []] as Thread[];
        let threadData = {...(item) || {}} as Thread;
        let index1 = currentThreads.findIndex((item: Thread) => item.id === threadData?.id);
        let finalArray = (item.mailboxes || []).filter(function (item: string) {
            return item !== 'UNREAD'
        })
        let body = {
            mailboxes: [
                ...finalArray
            ]
        }
        currentThreads[index1] = {
            ...currentThreads[index1],
            mailboxes: body?.mailboxes || []
        };
        dispatch(updateThreadState({threads: currentThreads, success: true}));
        if (item && item.id) {
            dispatch(updateThreads({id: item.id, body}));
        }
    }*/}
    dispatch(updateThreadState({selectedThread: item}));
    dispatch(updateMessageState({selectedMessage: null}));
    dispatch(updateDraftState({draft: null}));
  }, [dispatch, threads, props.tab])

  return (
    <>
      <div>
        <Flex direction={'column'} gap={1} marginTop={5}
            className={`${styles.mailList} ${props.tab !== 'INBOX' ? styles.mailListForArchive : ''}`}>
          <Input type={'text'} opacity={0} height={0} width={0} padding={0} border={0} outline={0}
                  ref={listRef}/>

          {threads && threads.length > 0 && threads.map((item: Thread, index: number) => (
            <div onClick={() => handleClick(item)} key={index}
                className={`${selectedThread && selectedThread.id === item.id ? styles.selectedThread : ''}`}>
                <ThreadsSideBarListItem thread={item} tab={props.tab}/>
            </div>
          ))}
        </Flex>
      </div>
    </>
  )
}
