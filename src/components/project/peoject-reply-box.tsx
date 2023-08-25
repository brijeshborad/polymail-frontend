import {
    Box,
    Button,
    Flex,
    GridItem,
    Heading,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text, Textarea
} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    CloseIcon,
    InfoOutlineIcon,
    TriangleDownIcon,
    WarningIcon
} from "@chakra-ui/icons";
import {ArchiveIcon, FileIcon, LinkIcon, TextIcon, TimeSnoozeIcon, TrashIcon} from "@/icons";
import Image from "next/image";
import React from "react";


export function ProjectReplyBox() {

    return (
        <>
            <GridItem w='100%' h='100%'>
                <Box border={'1px solid rgba(8, 22, 47, 0.16)'} borderRadius={'16px'} h={'100%'}
                     backgroundColor={'#ffffff'} className={styles.mailBox}>
                    {/*<Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'} height={'100%'}>*/}
                    {/*    <Heading as='h3' size='md'>Click on a thread from list to view messages!</Heading>*/}
                    {/*</Flex>*/}

                    <Flex flexDir={'column'} height={'100%'}>
                        <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                              borderBottom={'1px solid rgba(8, 22, 47, 0.1)'} flex={'none'}
                              padding={'12px 20px'}>
                            <Flex alignItems={'center'} gap={2}>
                                <div className={styles.closeIcon}><CloseIcon/></div>
                                <div className={styles.actionIcon}><ChevronUpIcon/></div>
                                <div className={styles.actionIcon}><ChevronDownIcon/></div>
                            </Flex>
                            <Flex alignItems={'center'} gap={3} className={styles.headerRightIcon}>
                                <div><ArchiveIcon/></div>
                                <div><TrashIcon/></div>
                                <div><TimeSnoozeIcon/></div>
                                <div><WarningIcon className={styles.colorGray}/></div>
                            </Flex>
                        </Flex>

                        <Flex direction={'column'} flex={'1'} padding={'24px 20px 20px'}>
                            <Flex align={'center'} gap={2}>
                                <div className={styles.imgWrapper}>
                                    <Image src={'/image/user.png'} alt={''} width={50} height={50}/>
                                </div>
                                <Flex direction={'column'} width={'100%'}>
                                    <Flex align={'center'} gap={'4'} justify={'space-between'}
                                          paddingBottom={'2px'}>
                                        <Heading as='h4' fontSize={'15px'} color={'#000000'}>What’s the next
                                            project phase?</Heading>
                                        <Text fontSize='11px' color={'0,0,0, 0.4'}>7m ago</Text>
                                    </Flex>
                                    <Text fontSize='13px' color={'#000000'} fontWeight={'400'}>Michael Eisner to
                                        Lee Clow and 4 others</Text>
                                </Flex>
                            </Flex>
                            <Flex mt={6} flex={1} overflowY={'auto'} maxHeight={'calc(100vh - 580px)'}>
                                <div className={styles.mailBoxBackground}>
                                    <Text color={'#4A4A4A'} fontSize='md' fontWeight={'400'} lineHeight={'1.5'}>Lee, we’re gearing up to
                                        launch the next Toy Story. Can you spin up a team to start thinking about the
                                        entire launch execution, especially getting the launch to spread via organic
                                        social (TikTok)? </Text>
                                </div>
                            </Flex>
                            <Flex direction={'column'} gap={4}>
                                <Flex align={'center'} className={styles.replyButton} gap={2}>
                                    <Menu>
                                        <MenuButton backgroundColor={'transparent'} height={'auto'} padding={'0'} fontSize={'13px'} as={Button} rightIcon={<TriangleDownIcon />}> Reply </MenuButton>
                                        <MenuList>
                                            <MenuItem>Download</MenuItem>
                                            <MenuItem>Create a Copy</MenuItem>
                                            <MenuItem>Mark as Draft</MenuItem>
                                            <MenuItem>Delete</MenuItem>
                                            <MenuItem>Attend a Workshop</MenuItem>
                                        </MenuList>
                                    </Menu>
                                    <Input fontSize={'13px'} border={0} backgroundColor={'transparent'} padding={'0'} h={'auto'} borderRadius={0} placeholder='to Lee Clow @chiat.com and 4 others' />
                                </Flex>
                                <Flex direction={'column'} border={'1px solid #E5E5E5'} borderRadius={'8px'}>
                                    <div className={styles.replyBoxTags}>
                                        <Flex justifyContent={'space-between'} padding={'8px 10px'}
                                              borderBottom={'1px solid #E5E5E5'}>
                                            <Flex width={'100%'} gap={1} className={styles.replyBoxCC}>
                                                <Heading as={'h1'} size={'sm'} fontSize={'13px'} fontWeight={'500'} paddingTop={1} marginRight={1}>CC:</Heading>
                                                <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                                                    <Button color={'#08162F'} borderColor={'none'} backgroundColor={'rgba(0, 0, 0, 0.04)'}
                                                            className={`${styles.buttonClass} ${styles.ButtonClassBorder}`} borderRadius={20}
                                                            padding={'3px 10px'} fontSize={'12px'}
                                                            rightIcon={<CloseIcon width={'10px !important'}/>}
                                                            height={'fit-content'}>Design Team</Button>
                                                    <Button color={'#08162F'} borderColor={'none'} backgroundColor={'rgba(0, 0, 0, 0.04)'}
                                                            className={styles.buttonClass} borderRadius={20}
                                                            padding={'3px 10px'} fontSize={'12px'}
                                                            rightIcon={<CloseIcon width={'10px !important'}/>}
                                                            height={'fit-content'}>Design Team</Button>
                                                    <Button color={'#08162F'} borderColor={'none'} backgroundColor={'rgba(0, 0, 0, 0.04)'}
                                                            className={styles.buttonClass} borderRadius={20}
                                                            padding={'3px 10px'} fontSize={'12px'}
                                                            rightIcon={<CloseIcon width={'10px !important'}/>}
                                                            height={'fit-content'}>Design Team</Button>

                                                    <Input width={'auto'} padding={0} height={'23px'} flex={1}
                                                           fontSize={'12px'} border={0} className={styles.ccInput}
                                                           placeholder={'Recipient\'s Email'} />
                                                </Flex>
                                                <InfoOutlineIcon cursor={'pointer'}/>
                                            </Flex>
                                        </Flex>
                                        <Flex direction={'column'} p={4}>
                                            <Textarea p={0} border={0} borderRadius={0} className={styles.replayBoxTextArea} fontSize={'13px'} color={'#000000'} resize={'none'} fontWeight={'500'} placeholder='Here is a sample placeholder' />
                                            <Flex align={'flex-end'} justify={"space-between"} gap={2} order={1}>

                                                <Flex align={'center'} gap={3} className={styles.replyBoxIcon}>
                                                    <FileIcon/>
                                                    <input type='file' id='file' style={{display: 'none'}}/>
                                                    <LinkIcon/>
                                                    <TextIcon/>
                                                    {/*<EmojiIcon/>*/}
                                                </Flex>

                                                <Flex align={'center'} className={styles.replyButtonBottom}>
                                                    <Button className={styles.replayTextButton} fontSize={'14px'} colorScheme='blue'> Reply all </Button>
                                                    <Menu>
                                                        <MenuButton className={styles.replayArrowIcon} as={Button} aria-label='Options'
                                                                    variant='outline'><ChevronDownIcon/></MenuButton>
                                                        <MenuList>
                                                            <MenuItem> Send Later </MenuItem>
                                                        </MenuList>
                                                    </Menu>

                                                </Flex>

                                            </Flex>
                                        </Flex>
                                    </div>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>
                </Box>
            </GridItem>
        </>
    )
}
