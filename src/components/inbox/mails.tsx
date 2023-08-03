import styles from "@/styles/Inbox.module.css";
import {
    Badge,
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuItem,
    MenuList, Tab, TabList, TabPanel, TabPanels, Tabs, Tooltip
} from "@chakra-ui/react";
import {ClockIcon, DraftIcon, FolderIcon, SendIcon, TimeSnoozeIcon} from "@/icons";
import {TriangleDownIcon} from "@chakra-ui/icons";
import InboxTab from "@/components/inbox/tabs-components/inbox-tab";
import {MailTabProps, StateType} from "@/types";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {getAllThreads} from "@/redux/threads/action-reducer";

// const content = [
//     'What’s the next project phase?',
//     'What’s the next project phase?',
//     'What’s the next project phase?',
//     'What’s the next project phase?'
// ]

export function Mails(props: MailTabProps) {

    const handleClick = (e) => {
        props.show(true);
        props.handleContent(e);
    }
    const [tab, setTab] = useState('INBOX');

    const changeEmailTabs = (value) => {
        setTab(value);
        props.handleTab(value);
    }

    return (
        <>
            <Flex direction={'column'} gap={5}>
                <Tabs>
                    <TabList justifyContent={'space-between'} alignItems={'center'} className={styles.mailTabList}>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Inbox' placement='bottom' bg='gray.300' color='black'>
                            <div className={styles.active} onClick={() => changeEmailTabs('INBOX')}>
                                <FolderIcon/>
                                <span>Inbox <Badge>12</Badge></span>
                            </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Draft' placement='bottom' bg='gray.300' color='black'>

                            <div onClick={() => changeEmailTabs('DRAFT')}>
                                <DraftIcon/>
                                <span>Inbox <Badge>12</Badge></span>
                            </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Starred' placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => changeEmailTabs('STARRED')}>
                                <ClockIcon/>
                                <span>Inbox <Badge>12</Badge></span>
                            </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Sent' placement='bottom' bg='gray.300' color='black'>

                            <div onClick={() => changeEmailTabs('SENT')}>
                                <SendIcon/>
                                <span>Inbox <Badge>12</Badge></span>
                            </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>

                            <div onClick={() => changeEmailTabs('TRASH')}>
                                <TimeSnoozeIcon/>
                                <span>Inbox <Badge>12</Badge></span>
                            </div>
                            </Tooltip>
                        </Tab>

                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>

                            <div onClick={() => changeEmailTabs('ARCHIVE')}>
                                <TimeSnoozeIcon/>
                                <span>Inbox <Badge>12</Badge></span>
                            </div>
                            </Tooltip>
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
                            <InboxTab content={props.content} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={props.content} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={props.content} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={props.content} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={props.content} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={props.content} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                        <TabPanel>
                            <InboxTab content={props.content} tab={tab} handleClick={(e) => handleClick(e)}/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Flex>
        </>
    )
}
