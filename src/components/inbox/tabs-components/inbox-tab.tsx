import {Badge, Button, Checkbox, Flex} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {DisneyIcon} from "@/icons";
import styles2 from "@/styles/common.module.css";
import {Time} from "@/components";
import {InboxTabProps, StateType} from "@/types";
import {Thread} from "@/models";
import React, {useEffect, useState} from "react";
import {SpinnerUI} from "@/components/spinner";
import {useDispatch, useSelector} from "react-redux";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {updateThreadState} from "@/redux/threads/action-reducer";


const useKeyPress = function (targetKey: string) {
    const [keyPressed, setKeyPressed] = useState(false);

    useEffect(() => {

        function downHandler(event: KeyboardEvent) {
            event.preventDefault();

            if (event.key === targetKey) {
                setKeyPressed(true);
            }
        }

        const upHandler = (event: KeyboardEvent) => {
            event.preventDefault();

            if (event.key === targetKey) {
                setKeyPressed(false);
            }
        };

        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);

        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, [targetKey]);

    return keyPressed;
};


export default function InboxTab(props: InboxTabProps) {
    const {isLoading, selectedThread} = useSelector((state: StateType) => state.threads);

    const downPress = useKeyPress("ArrowDown");
    const upPress = useKeyPress("ArrowUp");
    const [cursor, setCursor] = useState(0);

    const dispatch = useDispatch();

    useEffect(() => {
        if (props.content && props.content.length) {
            if (downPress) {
                setCursor((prevState) => (props.content && prevState < props.content.length - 1) ? prevState + 1 : prevState);
            } else if (upPress) {
                setCursor((prevState) => (prevState > 0 ? prevState - 1 : prevState));
            }

        }
    }, [upPress, downPress]);
    useEffect(() => {
        if (props.content && props.content.length) {
            handleClick(props.content[cursor]);
        }
    }, [cursor]);


    const handleClick = (item: Thread, isClicked: boolean = false) => {
        if (isClicked && props.content) {
            const itemIndex = props.content.indexOf(item);
            setCursor(itemIndex);
        }
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
                    {props.content && !!props.content.length && props.content.map((item: Thread, index: number) => (
                        <div onClick={() => handleClick(item, true)} key={index}
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
                                        <Time time={item.updated} isShowFullTime={false}/>
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
