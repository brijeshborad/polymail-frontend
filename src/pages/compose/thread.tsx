import React from "react";
import {
    Button,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    Input,
    useDisclosure,
    Box,
    Heading,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Textarea,
    Tabs, TabList, Tab, Tooltip, TabPanels, TabPanel, Checkbox, Badge,
} from "@chakra-ui/react";
import styles from "@/styles/compose.module.css";
import {
    DraftIcon, EditIcon,
    EmojiIcon,
    FileIcon,
    FolderIcon, InboxIcon,
    LinkIcon, SendIcon, StarIcon,
    TextIcon, TimeSnoozeIcon, TrashIcon
} from "@/icons";
import {ChevronDownIcon, TriangleDownIcon} from "@chakra-ui/icons";


function Thread() {
    const {isOpen, onOpen, onClose} = useDisclosure();
    return (
        <>
            <Tabs>
                <Flex align={'center'} gap={'3'}>
                    <TabList justifyContent={'space-between'} flex={1} alignItems={'center'}
                             className={styles.mailTabList} overflowX={"auto"}>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Inbox' placement='bottom' bg='gray.300' color='black'>
                                <div className={styles.active}>
                                    <InboxIcon/>
                                    <span>Inbox <Badge>12</Badge></span>
                                </div>
                            </Tooltip>
                        </Tab>
                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Draft' placement='bottom' bg='gray.300' color='black'>
                                <div>
                                    <DraftIcon/>
                                    <span>Draft</span>
                                </div>
                            </Tooltip>
                        </Tab>

                        <Tab className={styles.emailTabs}>
                            <Tooltip label='Sent' placement='bottom' bg='gray.300' color='black'>
                                <div>
                                    <SendIcon/>
                                    <span>Sent</span>
                                </div>
                            </Tooltip>
                        </Tab>

                        <Menu>
                            <MenuButton className={styles.tabListMoreButton} minWidth={'80px'}
                                        borderLeft={'1px solid #D1D5DB'} borderRadius={0}
                                        backgroundColor={'transparent'} height={'auto'} fontSize={'13px'}
                                        color={'#6B7280'} as={Button} marginLeft={1} rightIcon={<TriangleDownIcon/>}>
                                More
                            </MenuButton>
                            <MenuList className={`${styles.tabListDropDown} drop-down-list`}>
                                <MenuItem><SendIcon/> Sent</MenuItem>
                                <MenuItem><TrashIcon/> Trash</MenuItem>
                                <MenuItem><StarIcon/> Starred</MenuItem>
                                <MenuItem><TimeSnoozeIcon/> Archive</MenuItem>
                            </MenuList>
                        </Menu>
                    </TabList>

                    <Button className={styles.composeButton} borderRadius={8} height={'auto'} padding={'10px'}
                            minWidth={'101px'} backgroundColor={'#FFFFFF'} color={'#374151'} borderColor={'#E5E7EB'}
                            leftIcon={<EditIcon/>} colorScheme='blue' variant='outline' onClick={onOpen}>Compose</Button>
                </Flex>

                <TabPanels marginTop={5}>
                    <TabPanel>
                        <Flex overflowX={'auto'} align={'center'}>
                            <Checkbox className={styles.checkBoxLabel} defaultChecked>Select All</Checkbox>

                            <div className={styles.mailOtherOption}>
                                <Flex align={'center'} gap={2}>
                                    <div className={styles.active}>
                                        <Button colorScheme='white'>Everything</Button>
                                    </div>
                                    <div>
                                        <Button colorScheme='white'>Just mine</Button>
                                    </div>
                                    <div>
                                        <Button colorScheme='white'>Projects</Button>
                                    </div>
                                </Flex>
                            </div>
                        </Flex>
                        <Flex className={styles.mailList} direction={'column'} mt={3} gap={2} paddingBottom={3}>
                            <Flex className={`${styles.mailDetails} ${styles.activeMailDetails}`} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                        </Flex>
                    </TabPanel>
                    <TabPanel>
                        <Flex overflowX={'auto'} align={'center'}>
                            <Checkbox className={styles.checkBoxLabel} defaultChecked>Select All</Checkbox>

                            <div className={styles.mailOtherOption}>
                                <Flex align={'center'} gap={2}>
                                    <div className={styles.active}>
                                        <Button colorScheme='white'>Everything</Button>
                                    </div>
                                    <div>
                                        <Button colorScheme='white'>Just mine</Button>
                                    </div>
                                    <div>
                                        <Button colorScheme='white'>Projects</Button>
                                    </div>
                                </Flex>
                            </div>
                        </Flex>
                        <Flex className={styles.mailList} direction={'column'} mt={3} gap={2} paddingBottom={3}>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={`${styles.mailDetails} ${styles.activeMailDetails}`} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                        </Flex>
                    </TabPanel>
                    <TabPanel>
                        <Flex overflowX={'auto'} align={'center'}>
                            <Checkbox className={styles.checkBoxLabel} defaultChecked>Select All</Checkbox>

                            <div className={styles.mailOtherOption}>
                                <Flex align={'center'} gap={2}>
                                    <div className={styles.active}>
                                        <Button colorScheme='white'>Everything</Button>
                                    </div>
                                    <div>
                                        <Button colorScheme='white'>Just mine</Button>
                                    </div>
                                    <div>
                                        <Button colorScheme='white'>Projects</Button>
                                    </div>
                                </Flex>
                            </div>
                        </Flex>
                        <Flex className={styles.mailList} direction={'column'} mt={3} gap={2} paddingBottom={3}>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={`${styles.mailDetails} ${styles.activeMailDetails}`} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                            <Flex className={styles.mailDetails} gap={1} direction={'column'} width={'100%'} borderRadius={8} padding={2} border={'1px solid #E5E7EB'} backgroundColor={'#FFFFFF'}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} className={styles.senderDetails} fontSize={'12px'} padding={'1px 10px 1px 1px'} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={50} alignItems={'center'} gap={1}>
                                        <Flex minWidth={'18px'} h={'18px'} borderRadius={'50px'} textTransform={'uppercase'} fontWeight={'600'} align={'center'} justify={'center'} backgroundColor={'#EBF83E'} fontSize={'10px'} color={'#0A101D'}> M </Flex>
                                        <p> Meetup </p>
                                    </Flex>
                                    <Text className={styles.receiveTime} fontSize='11px' textAlign={'right'} color={'#9CA3AF'}> 7m ago </Text>
                                </Flex>
                                <div className={styles.mailMessage}> Your friends are waiting </div>
                            </Flex>
                        </Flex>
                    </TabPanel>
                </TabPanels>
            </Tabs>


            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay backgroundColor={'#F9FAFB'}/>
                <ModalContent className={styles.composeModal} maxWidth={'893px'} height={'708px'} maxHeight={'708px'}
                              borderRadius={16} border={'1px solid #E5E7EB'}>
                    <ModalHeader display={'flex'} borderBottom={'1px solid #E5E7EB'} color={'#0A101D'}
                                 fontWeight={'500'} fontSize={'12px'} padding={'18px 20px'}>Draft&nbsp;<Text
                        color={'#6B7280'} fontWeight={'400'}> (Saved to drafts 2m ago)</Text></ModalHeader>
                    <ModalCloseButton color={'#6B7280'} fontSize={'13px'} top={'21px'} right={'20px'}/>
                    <ModalBody padding={0}>
                        <Flex direction={'column'} h={'100%'}>
                            <Flex align={'center'} justify={'space-between'} gap={3} padding={'16px 20px'}
                                  borderBottom={'1px solid #E5E7EB'}>
                                <Input className={styles.subjectInput} placeholder='Enter subject title' size='lg'
                                       flex={1} fontWeight={'700'} padding={'0'} border={'0'} h={'auto'}
                                       borderRadius={'0'} lineHeight={1} color={'#0A101D'}/>
                                <Button className={styles.addToProject} leftIcon={<FolderIcon/>} borderRadius={'50px'}
                                        backgroundColor={'#2A6FFF'} color={'#FFFFFF'}
                                        boxShadow={'0 0 3px 0 rgba(38, 109, 240, 0.12)'} padding={'4px 4px 4px 8px'}
                                        fontSize={'12px'} fontWeight={500} h={'fit-content'}>
                                    Add to Project <span className={styles.RightContent}>⌘P</span>
                                </Button>
                            </Flex>
                            <Box flex={'1'} p={5}>
                                <Flex direction={"column"} border={'1px solid #F3F4F6'} borderRadius={8} h={'100%'} padding={'16px'} gap={4}>
                                    <Flex flex={'none'} backgroundColor={'#FFFFFF'} border={'1px solid #E5E7EB'} direction={'column'} borderRadius={8}>
                                        <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                                            <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1} color={'#374151'}>To:</Heading>
                                            <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                                                <Button className={styles.replyBoxCCTag} rightIcon={<ChevronDownIcon />}> Lee Clow </Button>
                                                <Input width={'auto'} padding={0} height={'20px'} flex={'1 0 auto'}
                                                       fontSize={'12px'} border={0} className={styles.ccInput} placeholder={'Recipient\'s Email'}/>
                                            </Flex>
                                        </Flex>
                                        <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                                            <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1} color={'#374151'}>CC:</Heading>
                                            <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                                                <Button className={styles.replyBoxCCTag} rightIcon={<ChevronDownIcon />}>Michael</Button>
                                                <Button className={styles.replyBoxCCTag} rightIcon={<ChevronDownIcon />}>John</Button>
                                                <Button className={styles.replyBoxCCTag} rightIcon={<ChevronDownIcon />}>John</Button>
                                                <Button className={styles.replyBoxCCTag} rightIcon={<ChevronDownIcon />}>Jane</Button>
                                                <Button className={styles.replyBoxCCTag} rightIcon={<ChevronDownIcon />}>Peter</Button>
                                                <Input width={'auto'} padding={0} height={'19px'} flex={'1 0 auto'}
                                                       fontSize={'12px'} border={0} className={styles.ccInput} placeholder={'Recipient\'s Email'}/>
                                            </Flex>
                                        </Flex>
                                        <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                                            <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1} color={'#374151'}>BCC:</Heading>
                                            <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                                                <Input width={'auto'} padding={0} height={'19px'} flex={'1 0 auto'}
                                                       fontSize={'12px'} border={0} className={styles.ccInput} placeholder={'Recipient\'s Email'}/>
                                            </Flex>
                                        </Flex>
                                    </Flex>

                                    <Flex flex={1} direction={'column'}>
                                        <Textarea flex={1} className={styles.replyBoxTextArea} color={'#0A101D'} fontWeight={500} h={'100%'} border={0} borderRadius={0} p={0} resize={'none'} placeholder='Let’s go and check|' />
                                        <Flex direction={'column'}>
                                            <div className={styles.replyUserName}>
                                                <div>
                                                    ---
                                                </div>
                                                <div>
                                                    Cheers
                                                </div>
                                            </div>
                                            <Text fontSize='xs' backgroundColor={'#F3F4F6'} borderRadius={4} padding={'4px 8px'} color={'#6B7280'} w={'fit-content'} lineHeight={1}>Ryan Mickle is sharing this email thread (and future replies) with 1 person at chiat.com on Polymail</Text>
                                            <Flex align={'flex-end'} justify={'space-between'} gap={2}>
                                                <Flex gap={2} className={styles.replyBoxIcon}>
                                                    <FileIcon/>
                                                    <LinkIcon/>
                                                    <TextIcon/>
                                                    <EmojiIcon/>
                                                </Flex>
                                                <Flex align={'center'} className={styles.replyButton}>
                                                    <Button className={styles.replyTextButton} colorScheme='blue'> Send </Button>
                                                    <Menu>
                                                        <MenuButton className={styles.replyArrowIcon} as={Button} aria-label='Options'
                                                                    variant='outline'><ChevronDownIcon/></MenuButton>
                                                        <MenuList>
                                                            <MenuItem> Send Later </MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                    {/*<Modal isOpen={isOpen} onClose={onClose} isCentered={true} scrollBehavior={'outside'}>*/}
                                                    {/*    <ModalOverlay/>*/}
                                                    {/*    <ModalContent minHeight="440px">*/}
                                                    {/*        <ModalHeader display="flex" justifyContent="space-between" alignItems="center">*/}
                                                    {/*            Schedule send*/}
                                                    {/*        </ModalHeader>*/}
                                                    {/*        <ModalCloseButton size={'xs'}/>*/}
                                                    {/*        <ModalBody>*/}
                                                    {/*            <SingleDatepicker name="date-input" />*/}
                                                    {/*        </ModalBody>*/}
                                                    {/*        <ModalFooter>*/}
                                                    {/*            <Button variant='ghost' onClick={onClose}>Cancel</Button>*/}
                                                    {/*            <Button colorScheme='blue' mr={3}> Schedule </Button>*/}
                                                    {/*        </ModalFooter>*/}
                                                    {/*    </ModalContent>*/}
                                                    {/*</Modal>*/}
                                                </Flex>
                                            </Flex>
                                        </Flex>

                                    </Flex>
                                </Flex>
                            </Box>
                        </Flex>
                    </ModalBody>

                    {/*<ModalFooter>*/}
                    {/*    <Button colorScheme='blue' mr={3} onClick={onClose}>*/}
                    {/*        Close*/}
                    {/*    </Button>*/}
                    {/*    <Button variant='ghost'>Secondary Action</Button>*/}
                    {/*</ModalFooter>*/}
                </ModalContent>
            </Modal>


        </>
    )
}

export default Thread;
