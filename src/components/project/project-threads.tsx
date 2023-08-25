import {
    Button,
    Checkbox,
    Flex,
    GridItem,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text
} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";
import {ChevronDownIcon} from "@chakra-ui/icons";
import {DisneyIcon} from "@/icons";
import styles2 from "@/styles/common.module.css";
import React from "react";


export function ProjectThreads() {

    return (
        <>
            <GridItem w='100%' h='100%'>
                <Flex direction={'column'} gap={4}>
                    <Flex align={'center'} justify={'space-between'} gap={2}>
                        <Checkbox className={styles.checkBoxLabel} defaultChecked>Select All</Checkbox>
                        <Menu>
                            <MenuButton className={styles.allInboxes} backgroundColor={'#ffffff'}
                                        borderRadius={'50px'} border={'1px solid rgba(8, 22, 47, 0.14)'}
                                        fontSize={'14px'} lineHeight={'1'} height={'auto'} as={Button}
                                        rightIcon={<ChevronDownIcon/>}> All Inboxes </MenuButton>
                            <MenuList>
                                <MenuItem>Download</MenuItem>
                                <MenuItem>Create a Copy</MenuItem>
                                <MenuItem>Mark as Draft</MenuItem>
                                <MenuItem>Delete</MenuItem>
                                <MenuItem>Attend a Workshop</MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>
                    <Flex direction={'column'} gap={1} className={styles.mailList}>
                        <div className={styles.readMail}>
                            <div className={styles.mailDetails}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                        <DisneyIcon/> Jane Doe
                                    </Flex>
                                    <div className={styles2.receiveTime}><Text fontSize='11px'>7m ago</Text></div>
                                </Flex>
                                <Text className={styles.mailMessage}>What’s the next project phase?</Text>
                            </div>
                        </div>
                        <div>
                            <div className={styles.mailDetails}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} gap={1}><DisneyIcon/> Jane Doe</Flex>
                                    <div className={styles2.receiveTime}><Text fontSize='11px'>7m ago</Text></div>
                                </Flex>
                                <Text className={styles.mailMessage}>What’s the next project phase?</Text>
                            </div>
                        </div>
                        <div>
                            <div className={styles.mailDetails}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} gap={1}><DisneyIcon/> Ran Segall</Flex>
                                    <div className={styles2.receiveTime}><Text fontSize='11px'>7m ago</Text></div>
                                </Flex>
                                <Text className={styles.mailMessage}>Framer Masterclass is HERE</Text>
                            </div>
                        </div>
                        <div>
                            <div className={styles.mailDetails}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} gap={1}><DisneyIcon/> Slack</Flex>
                                    <div className={styles2.receiveTime}><Text fontSize='11px'>7m ago</Text></div>
                                </Flex>
                                <Text className={styles.mailMessage}>New sign-in with Slack: Loom</Text>
                            </div>
                        </div>
                        <div>
                            <div className={styles.mailDetails}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} gap={1}><DisneyIcon/> Dribbble</Flex>
                                    <div className={styles2.receiveTime}><Text fontSize='11px'>7m ago</Text></div>
                                </Flex>
                                <Text className={styles.mailMessage}>Aaron Draplin workshop tickets disappearing soon</Text>
                            </div>
                        </div>
                        <div>
                            <div className={styles.mailDetails}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} gap={1}><DisneyIcon/> Stephen Bradbury</Flex>
                                    <div className={styles2.receiveTime}><Text fontSize='11px'>7m ago</Text></div>
                                </Flex>
                                <Text className={styles.mailMessage}>Web Design Project</Text>
                            </div>
                        </div>
                        <div>
                            <div className={styles.mailDetails}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} gap={1}><DisneyIcon/> Ran Segall</Flex>
                                    <div className={styles2.receiveTime}><Text fontSize='11px'>7m ago</Text></div>
                                </Flex>
                                <Text className={styles.mailMessage}>Framer Masterclass is HERE</Text>
                            </div>
                        </div>
                    </Flex>
                </Flex>
            </GridItem>
        </>
    )
}
