import {Badge, Button, Checkbox, Flex} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {DisneyIcon} from "@/icons";
import styles2 from "@/styles/common.module.css";
import {Time} from "@/components";
import {InboxTabProps} from "@/types";
import {Thread} from "@/models";

export default function InboxTab(props: InboxTabProps) {
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
            <div>
                <Flex direction={'column'} gap={1} marginTop={5} className={styles.mailList}>
                    {props.content && props.content.map((item: Thread, index: number) => (
                        <div onClick={() => props.handleClick(item.id)} key={index}>
                            <div className={styles.mailDetails}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} gap={1}>
                                        <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                            <DisneyIcon/> Slack
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
