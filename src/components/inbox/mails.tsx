import styles from "@/styles/Inbox.module.css";
import {
    Badge,
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuItem,
    MenuList, Tab, TabList, TabPanel, TabPanels, Tabs
} from "@chakra-ui/react";
import {ClockIcon, DraftIcon, FolderIcon, SendIcon, TimeSnoozeIcon} from "@/icons";
import {TriangleDownIcon} from "@chakra-ui/icons";
import InboxTab from "@/components/inbox/tabs-components/inbox-tab";
import {MailTabProps} from "@/types";

const content = [
    'What’s the next project phase?',
    'What’s the next project phase?',
    'What’s the next project phase?',
    'What’s the next project phase?'
]

export function Mails(props: MailTabProps) {

    const handleClick = () => {
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
                            <InboxTab content={content} handleClick={() => handleClick()}/>
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
