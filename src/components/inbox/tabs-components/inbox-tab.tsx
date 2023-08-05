import {Badge, Button, Checkbox, Flex, Spinner} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {DisneyIcon} from "@/icons";
import styles2 from "@/styles/common.module.css";
import {Time} from "@/components";
import {InboxTabProps} from "@/types";
import {Thread} from "@/models";
import React, {useState} from "react";
import {SpinnerUI} from "@/components/spinner";
import Login from "@/pages/auth/login";
import dayjs from "dayjs";

export default function InboxTab(props: InboxTabProps) {

    const getOneDayAgo = (newDate) => {
        const date1 = dayjs(newDate);
        const date2 = dayjs();

        let days = date2.diff(date1, 'day');
        if (days < 1) {
            return `${date2.diff(date1, 'hour')} hours ago`;
        } else if (date2.diff(date1, 'hour') < 1) {
            return `${date2.diff(date1, 'minute')} minutes ago`;
        } else if (date2.diff(date1, 'minute') < 1) {
            return `${date2.diff(date1, 'second')} seconds`;
        } else {
            return `${days} days ago`;
        }
    };
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
            {props.showLoader}
            {props.showLoader && <SpinnerUI />}
            <div>
                <Flex direction={'column'} gap={1} marginTop={5} className={styles.mailList}>
                    {props.content && props.content.map((item: Thread, index: number) => (
                        <div onClick={() => props.handleClick(item)} key={index}>
                            <div className={styles.mailDetails}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} gap={1}>
                                        <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                            <DisneyIcon/> {item.from || 'Anonymous'}
                                        </Flex>
                                    </Flex>
                                    <div className={styles2.receiveTime}>
                                        {/*<p>{getOneDayAgo(item.updated)}</p>*/}
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
