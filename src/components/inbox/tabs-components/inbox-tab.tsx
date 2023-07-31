import {Badge, Button, Checkbox, Flex} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {DisneyIcon} from "@/icons";
import styles2 from "@/styles/common.module.css";
import {Time} from "@/components";
import {InboxTabProps} from "@/types";

export default function InboxTab(props: InboxTabProps) {
    return (
        <>
            <div>
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
            <div>
                <Flex direction={'column'} gap={1} marginTop={5} className={styles.mailList}>
                    {props.content.map((item: any, index: number) => (
                        <div onClick={() => props.handleClick()} key={index}>
                            <div className={styles.mailDetails}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} gap={1}>
                                        <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                            <DisneyIcon/> Slack
                                        </Flex>
                                    </Flex>
                                    <div className={styles2.receiveTime}>
                                        <Time time={'28-07-2023 05:51:00 PM'}/>
                                    </div>
                                </Flex>
                                <div className={styles.mailMessage}>
                                    {item}
                                </div>
                            </div>
                        </div>
                    ))}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Slack*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            New sign-in with Slack: Loom*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <div className={styles.SenderIcon}><DisneyIcon/></div>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Jane Doe*/}
                    {/*                </Flex>*/}
                    {/*                <div className={styles.mailRead}><EyeIcon/></div>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            What’s the next project phase?*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <div className={styles.SenderIcon}><DisneyIcon/></div>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Jane Doe*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            What’s the next project phase?*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Meetup*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            Your friends are waiting*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div className={styles.mailOpen}>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Michael Eisner*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            What’s the next project phase?*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Michael Eisner*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            What’s the next project phase?*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Michael Eisner*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            What’s the next project phase?*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Michael Eisner*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            What’s the next project phase?*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Michael Eisner*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            What’s the next project phase?*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Michael Eisner*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            What’s the next project phase?*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Michael Eisner*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            What’s the next project phase?*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Michael Eisner*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            What’s the next project phase?*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div>*/}
                    {/*    <div className={styles.mailDetails}>*/}
                    {/*        <Flex align={"center"} justify={'space-between'}>*/}
                    {/*            <Flex align={"center"} gap={1}>*/}
                    {/*                <Flex align={"center"} className={styles.senderDetails} gap={1}>*/}
                    {/*                    <DisneyIcon/> Michael Eisner*/}
                    {/*                </Flex>*/}
                    {/*            </Flex>*/}
                    {/*            <div className={styles2.receiveTime}>*/}
                    {/*                <Time time={'28-07-2023 05:51:00 PM'}/>*/}
                    {/*            </div>*/}
                    {/*        </Flex>*/}
                    {/*        <div className={styles.mailMessage}>*/}
                    {/*            What’s the next project phase?*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                </Flex>
            </div>
        </>
    )
}
