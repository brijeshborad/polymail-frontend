import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {Box, Flex, Heading, Text, Input, Button, Menu, MenuButton, MenuList, MenuItem} from "@chakra-ui/react";
import {ChevronDownIcon, ChevronUpIcon, CloseIcon, InfoOutlineIcon, TriangleDownIcon} from "@chakra-ui/icons";
import {Time} from "@/components";
import {ArchiveIcon, FolderIcon, TrashIcon, TimeSnoozeIcon, FileIcon, LinkIcon, TextIcon, EmojiIcon} from "@/icons";
import Image from "next/image";
import {Chip} from "@/components/chip";

export function Mail(props) {
    return (
        <Box className={styles.mailBox}>
            <Flex justifyContent={'space-between'} flexDir={'column'} height={'100%'}>
                <div>
                    <div>
                        <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                              borderBottom={'1px solid rgba(8, 22, 47, 0.1)'}
                              marginBottom={'15'} padding={'12px 20px'}>
                            <Flex alignItems={'center'} gap={2}>
                                <div className={styles.closeIcon} onClick={() => props.show(false)}><CloseIcon/></div>
                                <div className={styles.actionIcon}><ChevronUpIcon/></div>
                                <div className={styles.actionIcon}><ChevronDownIcon/></div>
                            </Flex>
                            <Flex alignItems={'center'} gap={3} className={styles.headerRightIcon}>
                                <Button className={styles.addToProject} leftIcon={<FolderIcon />}>Add to Project <span className={styles.RightContent}>⌘P</span></Button>
                                <ArchiveIcon/>
                                <TrashIcon/>
                                <TimeSnoozeIcon/>
                            </Flex>
                        </Flex>
                        <Flex alignItems={'center'} wrap={'wrap'} justifyContent={'space-between'} gap={2} padding={'10px 20px'}>
                            <Flex alignItems={'center'}>
                                <Image src={'/image/user.png'} alt={''} width={50} height={50}/>
                                <Flex flexDir={'column'} marginLeft={'5'}>
                                    <Heading as='h4' size='md'>What`s the next project Phase</Heading>
                                    <Text fontSize='sm'>Michel Eisner to Lee Clow and 4 others</Text>
                                </Flex>
                            </Flex>
                            <div className={styles2.receiveTime}>
                                <Time time={'28-07-2023 05:51:00 PM'}/>
                            </div>
                        </Flex>
                    </div>
                    <div className={styles.mailBody}>
                        <Text>
                            Lee, we’re gearing up to launch the next Toy Story. Can you spin up a team to start thinking
                            about the
                            entire launch execution, especially getting the launch to spread via organic social
                            (TikTok)?
                        </Text>
                    </div>
                </div>
                <div className={styles.mailFooter}>
                    <Flex alignItems={'center'} marginBottom={4} className={styles.mailReplay}>
                        <Heading as={'h1'} size={'sm'}>Reply</Heading>
                        <TriangleDownIcon/>
                        <Text fontSize={'sm'}>to Lee Clow @chiat.com and 4 others</Text>
                    </Flex>
                    <Box className={styles.replyBox}>
                        <Flex alignItems={'center'} justifyContent={'space-between'} padding={'8px 10px'}
                              borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>
                            <Flex alignItems={'center'} wrap={'wrap'} gap={1} className={styles.replyBoxCC}>
                                <Heading as={'h1'} size={'sm'} marginRight={1}>CC:</Heading>
                                <Chip text={'Design Team'} buttonClass={styles.textBlue}/>
                                <Chip text={'John Doe'}/>
                                <Chip text={'Lee Clow'}/>
                            </Flex>
                            <InfoOutlineIcon/>
                        </Flex>
                        <div className={styles.replayMessage}>
                            {/*<Text fontSize={'sm'}>Reply with anything you like or @mention someone to share this thread</Text>*/}
                            <Input variant='unstyled' placeholder='Reply with anything you like or @mention someone to share this thread' />
                            <Flex align={'flex-end'} justify={"space-between"} gap={2}>
                                <Flex align={'center'} gap={3}>
                                    <FileIcon/>
                                    <LinkIcon/>
                                    <TextIcon/>
                                    <EmojiIcon/>
                                </Flex>
                                <Button className={styles.replyButton} colorScheme='blue' rightIcon={<ChevronDownIcon />}>Reply all</Button>
                            </Flex>
                        </div>
                    </Box>
                </div>
            </Flex>
        </Box>
    )
}
