import {ProjectButton} from "../components/project-button";
import {Flex, Grid, GridItem, Badge, MenuButton, Button, MenuList, MenuItem, Menu, Checkbox} from "@chakra-ui/react";
import Image from "next/image";

import {TriangleDownIcon} from "@chakra-ui/icons";
import {FolderIcon, DisneyIcon, DotIcon, DraftIcon, ClockIcon, SpamIcon, SendIcon, EyeIcon} from "../icons";
import styles from '@/styles/Home.module.css'

export default function Home() {
    return (
        <div>
            <div className={styles.filterTabs}>
                <Grid templateColumns='repeat(6, 1fr)' gap={3}>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <DisneyIcon/>
                                Disney Launch
                            </div>
                        </Flex>
                    </GridItem>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <Image width="20" height="20" src="/image/handcraft.png" alt=""/>
                                Handcrafted Frozen Mouse
                            </div>
                            <DotIcon/>
                        </Flex>
                    </GridItem>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <Image width="20" height="20" src="/image/car.png" alt=""/>
                                Generic Plastic Car
                            </div>
                            <DotIcon/>
                        </Flex>
                    </GridItem>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <DisneyIcon/>
                                Disney Launch
                            </div>
                        </Flex>
                    </GridItem>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <Image width="20" height="20" src="/image/car.png" alt=""/>
                                Generic Plastic Car
                            </div>
                        </Flex>
                    </GridItem>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <FolderIcon/>
                                Show all projects (7)
                            </div>
                        </Flex>
                    </GridItem>
                </Grid>
            </div>

            <div className={styles.mailBg}>
                <Grid templateColumns='30% 70%' gap={10}>
                    <GridItem w='100%'>
                        <Flex direction={'column'} gap={5}>
                            <div className={styles.mailTabList}>
                                <Flex align={'center'} justify={'space-between'} className={styles.emailTabs}>
                                    <div className={styles.active}>
                                        <FolderIcon/>
                                        <span className={styles.details}>
                                        Inbox <Badge>12</Badge>
                                    </span>
                                    </div>

                                    <div>
                                        <DraftIcon/>
                                        <span className={styles.details}>
                                        Inbox <Badge>12</Badge>
                                    </span>
                                    </div>

                                    <div>
                                        <ClockIcon/>
                                        <span className={styles.details}>
                                        Inbox <Badge>12</Badge>
                                    </span>
                                    </div>

                                    <div>
                                        <SendIcon/>
                                        <span className={styles.details}>
                                        Inbox <Badge>12</Badge>
                                    </span>
                                    </div>

                                    <div>
                                        <SpamIcon/>
                                        <span className={styles.details}>
                                        Inbox <Badge>12</Badge>
                                    </span>
                                    </div>

                                    <div className={styles.moreDropdown}>
                                        <Menu>
                                            <MenuButton as={Button} rightIcon={<TriangleDownIcon/>} className={styles.moreButton}>
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

                                </Flex>
                            </div>
                            <div>
                                <Flex align={'center'} className={styles.selectEmail}>
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
                                <Flex direction={'column'} gap={1} className={styles.mailList}>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Slack
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                New sign-in with Slack: Loom
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <div className={styles.SenderIcon}>
                                                        <DisneyIcon/>
                                                    </div>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Jane Doe
                                                    </Flex>
                                                    <div className={styles.mailRead}>
                                                        <EyeIcon/>
                                                    </div>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                What’s the next project phase?
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <div className={styles.SenderIcon}>
                                                        <DisneyIcon/>
                                                    </div>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Jane Doe
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                What’s the next project phase?
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Meetup
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                Your friends are waiting
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.mailOpen}>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Michael Eisner
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                What’s the next project phase?
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Michael Eisner
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                What’s the next project phase?
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Michael Eisner
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                What’s the next project phase?
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Michael Eisner
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                What’s the next project phase?
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Michael Eisner
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                What’s the next project phase?
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Michael Eisner
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                What’s the next project phase?
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Michael Eisner
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                What’s the next project phase?
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Michael Eisner
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                What’s the next project phase?
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.mailDetails}>
                                            <Flex align={"center"} justify={'space-between'} className={styles.mailRecivedDetails}>
                                                <Flex align={"center"} gap={1}>
                                                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                                        <DisneyIcon/> Michael Eisner
                                                    </Flex>
                                                </Flex>
                                                <div className={styles.receiveTime}>
                                                    7m ago
                                                </div>
                                            </Flex>
                                            <div className={styles.mailMessage}>
                                                What’s the next project phase?
                                            </div>
                                        </div>
                                    </div>

                                </Flex>
                            </div>
                        </Flex>

                    </GridItem>
                    <GridItem w='100%'/>
                </Grid>
            </div>
            <ProjectButton/>
        </div>
    )
}
