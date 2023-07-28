import {ProjectButton} from "@/components";
import {Flex, Grid, GridItem, Badge, MenuButton, Button, MenuList, MenuItem, Menu, Checkbox} from "@chakra-ui/react";
import {TriangleDownIcon} from "@chakra-ui/icons";
import {FolderIcon, DisneyIcon, DotIcon, DraftIcon, ClockIcon, SpamIcon, SendIcon, EyeIcon} from "@/icons";
import styles from '@/styles/Home.module.css'
import {useSelector} from "react-redux";
import {StateType} from "@/types";

export default function Home() {
    const {projects} = useSelector((state: StateType) => state.projects);
    return (
        <div>
            <div className={styles.filterTabs}>
                <Grid templateColumns='repeat(6, 1fr)' gap={3}>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <ProjectButton text="Disney Launch" iconStart={<DisneyIcon className={styles.icon}/>}/>
                            </div>
                        </Flex>
                    </GridItem>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <ProjectButton text="Handcrafted Frozen Mouse" imageStart={'/image/handcraft.png'}
                                               iconEnd={<DotIcon/>}/>
                            </div>
                        </Flex>
                    </GridItem>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <ProjectButton text="Generic Plastic Car" imageStart={'/image/car.png'}
                                               iconEnd={<DotIcon/>}/>
                            </div>
                        </Flex>
                    </GridItem>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <ProjectButton text="Disney Launch" iconStart={<DisneyIcon className={styles.icon}/>}/>
                            </div>
                        </Flex>
                    </GridItem>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <ProjectButton text="Generic Plastic Car" imageStart={'/image/car.png'}/>
                            </div>
                        </Flex>
                    </GridItem>
                    <GridItem w='100%'>
                        <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                            <div className={styles.buttonContent}>
                                <ProjectButton text="Show all projects (7)"
                                               iconStart={<FolderIcon className={styles.icon}/>}/>
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
                                        <span>
                                        Inbox <Badge>12</Badge>
                                    </span>
                                    </div>

                                    <div>
                                        <DraftIcon/>
                                        <span>
                                        Inbox <Badge>12</Badge>
                                    </span>
                                    </div>

                                    <div>
                                        <ClockIcon/>
                                        <span>
                                        Inbox <Badge>12</Badge>
                                    </span>
                                    </div>

                                    <div>
                                        <SendIcon/>
                                        <span>
                                        Inbox <Badge>12</Badge>
                                    </span>
                                    </div>

                                    <div>
                                        <SpamIcon/>
                                        <span>
                                        Inbox <Badge>12</Badge>
                                    </span>
                                    </div>

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

                                </Flex>
                            </div>
                            <div>
                                <Flex align={'center'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
                                            <Flex align={"center"} justify={'space-between'}>
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
        </div>
    )
}
