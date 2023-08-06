import {Badge, Button, Checkbox, Flex} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {DisneyIcon} from "@/icons";
import styles2 from "@/styles/common.module.css";
import {Time} from "@/components";
import {InboxTabProps, StateType} from "@/types";
import {Thread} from "@/models";
import React from "react";
import {SpinnerUI} from "@/components/spinner";
import {useDispatch, useSelector} from "react-redux";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {updateThreadState} from "@/redux/threads/action-reducer";

export default function InboxTab(props: InboxTabProps) {

    const {isLoading, selectedThread} = useSelector((state: StateType) => state.threads);
    const dispatch = useDispatch();

    const handleClick = (item: Thread) => {
        dispatch(updateThreadState({selectedThread: item}));
        dispatch(updateMessageState({selectedMessage: null}));
    }
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
                                    <Button colorScheme='white'>All Inboxes <Badge>12</Badge></Button>
                                </div>
                                <div>
                                    <Button colorScheme='white'>Inbox <Badge>7</Badge></Button>
                                </div>
                                <div>
                                    <Button colorScheme='white'>Projects Inbox <Badge>5</Badge></Button>
                                </div>
                            </Flex>
                        </div>

                    </Flex>
                </div>
            }

            {isLoading && <SpinnerUI/>}
            <div>
                <Flex direction={'column'} gap={1} marginTop={5} className={styles.mailList}>
                    {props.content && props.content.map((item: Thread, index: number) => (
                        <div onClick={() => handleClick(item)} key={index} className={selectedThread && selectedThread.id === item.id ? styles.selectedThread : ''}>
                            <div className={styles.mailDetails}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} gap={1}>
                                        <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                            <DisneyIcon/> {item.from || 'Anonymous'}
                                        </Flex>
                                    </Flex>
                                    <div className={styles2.receiveTime}>
                                        <Time time={item.updated}/>
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
