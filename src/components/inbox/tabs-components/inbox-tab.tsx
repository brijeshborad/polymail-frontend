import {Button, Checkbox, Flex, Input} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {DisneyIcon} from "@/icons";
import styles2 from "@/styles/common.module.css";
import {InboxTabProps, StateType} from "@/types";
import {MessageDraft, Thread} from "@/models";
import React, {useCallback, useRef} from "react";
import {SpinnerUI, Time} from "@/components/common";
import {useDispatch, useSelector} from "react-redux";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {updateDraftState} from "@/redux/draft/action-reducer";


export function InboxTab(props: InboxTabProps) {
    const {isLoading, selectedThread, threads} = useSelector((state: StateType) => state.threads);
    const listRef = useRef<any>(null);
    const dispatch = useDispatch();

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
        if ((item.mailboxes || []).includes('UNREAD')) {
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
        }
        dispatch(updateThreadState({selectedThread: item}));
        dispatch(updateMessageState({selectedMessage: null}));
        dispatch(updateDraftState({draft: null}));
    }, [dispatch, threads, props.tab])

    return (
        <>
            {
                props.tab === 'INBOX' && <div>
                    <Flex overflowX={'auto'} align={'center'}>
                        <div className={styles.checkBoxLabel}>
                            <Checkbox defaultChecked>Select All</Checkbox>
                        </div>

                        <div className={styles.mailOtherOption}>
                            <Flex align={'center'} gap={2}>
                                <div className={styles.active}>
                                    <Button colorScheme='white'>Everything</Button>
                                </div>
                                <div>
                                    <Button colorScheme='white'>Just mine</Button>
                                </div>
                                <div>
                                    <Button colorScheme='white'>Projects</Button>
                                </div>
                            </Flex>
                        </div>
                    </Flex>
                </div>
            }

            {isLoading && <SpinnerUI/>}
            <div>
                <Flex direction={'column'} gap={1} marginTop={5}
                      className={`${styles.mailList} ${props.tab !== 'INBOX' ? styles.mailListForArchive : ''}`}>
                    <Input type={'text'} opacity={0} height={0} width={0} padding={0} border={0} outline={0}
                           ref={listRef}/>

                    {threads && threads.length > 0 && threads.map((item: Thread, index: number) => (
                        <div onClick={() => handleClick(item)} key={index}
                             className={`${selectedThread && selectedThread.id === item.id ? styles.selectedThread : ''}`}>
                            <div
                                className={`${styles.mailDetails} ${(item.mailboxes || []).includes('UNREAD') ? '' : styles.readThread}`}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                        <DisneyIcon/> {item.from || 'Anonymous'}
                                    </Flex>
                                    <div className={styles2.receiveTime}>
                                        <Time time={item.latestMessage} isShowFullTime={false}/>
                                    </div>
                                </Flex>
                                <div className={styles.mailMessage}>
                                    {item.subject || "(no subject)"}
                                </div>
                            </div>
                        </div>
                    ))}
                </Flex>
            </div>
        </>
    )
}
