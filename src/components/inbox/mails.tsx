import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {
    Badge,
    Button,
    Checkbox,
    Flex,
    Menu,
    MenuButton,
    MenuItem,
    MenuList, Tab, TabList, TabPanel, TabPanels, Tabs
} from "@chakra-ui/react";
import {ClockIcon, DisneyIcon, DraftIcon, EyeIcon, FolderIcon, SendIcon, TimeSnoozeIcon} from "@/icons";
import {TriangleDownIcon} from "@chakra-ui/icons";
import {Time} from "@/components";

const content = [
    'What’s the next project phase?',
    'What’s the next project phase?',
    'What’s the next project phase?',
    'What’s the next project phase?'
]

export function Mails(props) {

    const handleClick = (value) => {
        console.log('value', value)
        props.show(true);
    }



    return (
        <>
        <Flex direction={'column'} gap={5}>
            <Tabs>
                <TabList justifyContent={'space-between'} alignItems={'center'} className={styles.mailTabList}>
                    <Tab className={styles.emailTabs}>
                        <div className={styles.active}>
                            <FolderIcon/>
                            <span>Inbox <Badge>12</Badge></span>
                        </div>
                    </Tab>
                    <Tab className={styles.emailTabs}>
                        <div>
                            <DraftIcon/>
                            <span>Inbox <Badge>12</Badge></span>
                        </div>
                    </Tab>
                    <Tab className={styles.emailTabs}>
                        <div>
                            <ClockIcon/>
                            <span>Inbox <Badge>12</Badge></span>
                        </div>
                    </Tab>
                    <Tab className={styles.emailTabs}>
                        <div>
                            <SendIcon/>
                            <span>Inbox <Badge>12</Badge></span>
                        </div>
                    </Tab>
                    <Tab className={styles.emailTabs}>
                        <div>
                            <TimeSnoozeIcon/>
                            <span>Inbox <Badge>12</Badge></span>
                        </div>
                    </Tab>
                    <div className={styles.moreDropdown}>
                        <Menu>
                            <MenuButton as={Button} rightIcon={<TriangleDownIcon/>}
                                        className={styles.moreButton}>
                                More
                            </MenuButton>
                            <MenuList>
                                <MenuItem>Download</MenuItem>
                                <MenuItem>Create a Copy</MenuItem>
                                <MenuItem>Mark as Draft</MenuItem>
                                <MenuItem>Delete</MenuItem>
                                <MenuItem>Attend a Workshop</MenuItem>
                            </MenuList>
                        </Menu>
                    </div>
                </TabList>

                <TabPanels marginTop={5}>
                    <TabPanel>
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
                                {content.map((item: any) => (
                                    <div onClick={() => handleClick(item)}>
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
                    </TabPanel>
                    <TabPanel>
                        <p>two!</p>
                    </TabPanel>
                    <TabPanel>
                        <p>three!</p>
                    </TabPanel>
                    <TabPanel>
                        <p>three!</p>
                    </TabPanel>
                    <TabPanel>
                        <p>Fore!</p>
                    </TabPanel>
                    <TabPanel>
                        <p>Five!</p>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Flex>
        </>
    )
}
