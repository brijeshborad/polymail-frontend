import { Button, Checkbox, Flex, Input} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {DisneyIcon} from "@/icons";
import styles2 from "@/styles/common.module.css";
import {Time} from "@/components";
import {InboxTabProps, StateType} from "@/types";
import {Thread} from "@/models";
import React, {useCallback, useRef} from "react";
import {SpinnerUI} from "@/components/spinner";
import {useDispatch, useSelector} from "react-redux";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {updateThreads, updateThreadState} from "@/redux/threads/action-reducer";


export default function InboxTab(props: InboxTabProps) {
    const {isLoading, selectedThread, threads} = useSelector((state: StateType) => state.threads);

    const listRef = useRef<any>(null);
    // const activeDivRef = useRef<any>({});
    // const downPress = useKeyPress("ArrowDown", listRef);
    // const upPress = useKeyPress("ArrowUp", listRef);
    // const [cursor, setCursor] = useState(0);

    const dispatch = useDispatch();

    const handleClick = useCallback((item: Thread) => {
        // if (isClicked && props.content) {
        //     const itemIndex = (props.content || []).indexOf(item);
        //     setCursor(itemIndex);
        // }

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
            dispatch(updateThreadState({threads: currentThreads}));
            dispatch(updateThreads({id: item.id, body}));
        }
        dispatch(updateThreadState({selectedThread: item}));
        dispatch(updateMessageState({selectedMessage: null}));
    }, [dispatch, threads])

    // useEffect(() => {
    //     if (props.content && props.content.length) {
    //         if (downPress) {
    //             setCursor((prevState) => (props.content && prevState < props.content.length - 1) ? prevState + 1 : prevState);
    //         } else if (upPress) {
    //             setCursor((prevState) => (prevState > 0 ? prevState - 1 : prevState));
    //         }
    //
    //     }
    // }, [upPress, downPress, props.content]);

    // useEffect(() => {
    //     if (props.content && props.content.length) {
    //        handleClick(props.content[cursor]);
    //     }
    // }, [cursor, handleClick, props.content]);
    //
    // useEffect(() => {
    //     if (selectedThread) {
    //         listRef?.current.focus();
    //     }
    // }, [selectedThread, listRef])
    //
    // useEffect(() => {
    //     if (selectedThread) {
    //         // @ts-ignore
    //         if (activeDivRef && activeDivRef[selectedThread.id]) {
    //             // @ts-ignore
    //             activeDivRef[selectedThread.id].scrollIntoView({behavior: 'smooth', block: 'nearest'});
    //         }
    //     }
    // }, [selectedThread])

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
                                    <Button colorScheme='white'>All Inboxes</Button>
                                </div>
                                <div>
                                    <Button colorScheme='white'>Inbox</Button>
                                </div>
                                <div>
                                    <Button colorScheme='white'>Projects Inbox</Button>
                                </div>
                            </Flex>
                        </div>

                    </Flex>
                </div>
            }

            {isLoading && <SpinnerUI/>}
            <div>
                <Flex direction={'column'} gap={1} marginTop={5} className={styles.mailList}>
                    <Input type={'text'} opacity={0} height={0} width={0} padding={0} border={0} outline={0}
                           ref={listRef}/>

                    {props.content && !!props.content.length && props.content.map((item: Thread, index: number) => (
                        <div onClick={() => handleClick(item) } key={index}
                             className={`${selectedThread && selectedThread.id === item.id ? styles.selectedThread : ''}`}>
                            <div
                                className={`${styles.mailDetails} ${(item.mailboxes || []).includes('UNREAD') ? '' : styles.readThread}`}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} gap={1}>
                                        <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                            <DisneyIcon/> {item.from || 'Anonymous'}
                                        </Flex>
                                    </Flex>
                                    <div className={styles2.receiveTime}>
                                        <Time time={item.latestMessage} isShowFullTime={false}/>
                                    </div>
                                </Flex>
                                <div className={styles.mailMessage}>
                                    {item.subject}
                                </div>
                            </div>
                        </div>
                    ))}
                </Flex>
            </div>
        </>
    )
}
