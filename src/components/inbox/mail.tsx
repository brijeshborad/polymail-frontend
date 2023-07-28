import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {Box, Flex, Heading, Text} from "@chakra-ui/react";
import {ChevronDownIcon, ChevronUpIcon, CloseIcon, InfoOutlineIcon} from "@chakra-ui/icons";
import {ProjectButton, Time} from "@/components";
import {ArchiveIcon, FolderIcon, TrashIcon, TimeSnoozeIcon} from "@/icons";
import Image from "next/image";
import {Chip} from "@/components/chip";

export function Mail() {
    return (
        <Box className={styles.mailBox}>
            <Flex justifyContent={'space-between'} flexDir={'column'} height={'100%'}>
                <div>
                    <div className={styles.mailHeader}>
                        <Flex justifyContent={'space-between'} align={'center'}
                              borderBottom={'1px solid rgba(8, 22, 47, 0.1)'}
                              marginBottom={'15'} paddingBottom={'10px'}>
                            <Flex alignItems={'center'}>
                                <CloseIcon/>
                                <ChevronUpIcon/>
                                <ChevronDownIcon/>
                            </Flex>
                            <Flex alignItems={'center'}>
                                <ProjectButton buttonClass={styles2.textBlue} text="Add to Project"
                                               iconStart={<FolderIcon stroke={'#266DF0'} className={styles2.icon}/>}/>
                                <ArchiveIcon/>
                                <TrashIcon/>
                                <TimeSnoozeIcon/>
                            </Flex>
                        </Flex>
                        <Flex alignItems={'center'} justifyContent={'space-between'}>
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
                <div>
                    <Flex alignItems={'center'} marginBottom={4}>
                        <Heading as={'h1'} size={'sm'}>Reply</Heading>
                        <ChevronDownIcon/>
                        <Text fontSize={'sm'}>to Lee Clow @chiat.com and 4 others</Text>
                    </Flex>
                    <Box className={styles.replyBox}>
                        <Flex alignItems={'center'} justifyContent={'space-between'} paddingBottom={'10px'}
                              borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>
                            <Flex alignItems={'center'}>
                                <Heading as={'h1'} size={'sm'} marginRight={2}>CC:</Heading>
                                <Chip text={'Design Team'} buttonClass={styles2.textBlue}/>
                                <Chip text={'John Doe'}/>
                                <Chip text={'Lee Clow'}/>
                            </Flex>
                            <InfoOutlineIcon/>
                        </Flex>
                    </Box>
                </div>
            </Flex>
        </Box>
    )
}
