import React from "react";
import {
    Button,
    Flex,
    Text,
    Box,
    Heading,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Textarea,
} from "@chakra-ui/react";
import styles from "@/styles/compose.module.css";
import {
    ArchiveIcon,
    EmojiIcon,
    FileIcon,
    FolderIcon,
    LinkIcon, MenuIcon,
    TextIcon, TimeSnoozeIcon, TrashIcon
} from "@/icons";
import Image from "next/image";
import {ChevronDownIcon} from "@chakra-ui/icons";


function Draft() {
    return (
        <>
            <Box h={'100%'} backgroundColor={'#FFFFFF'} borderRadius={16} border={'1px solid #E5E7EB'} height={'708px'}>
                <Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'}
                      height={'100%'} display={'none'}>
                    <Heading as='h3' size='md'>Click on a thread from list to view messages!</Heading>
                </Flex>

                <Flex direction={'column'} className={styles.mailBox} h={'100%'}>
                    <Flex gap={2} align={'center'} justify={'space-between'} padding={'16px 20px 12px'} borderBottom={'1px solid #E5E7EB'}>
                        <Flex gap={1}>
                            <Heading as='h6' fontSize={'15px'} color={'#0A101D'} fontWeight={600}>What’s the next project phase?</Heading>
                        </Flex>

                        <Flex gap={3} align={'center'}>
                            <Button className={styles.addToProject} leftIcon={<FolderIcon/>} borderRadius={'50px'}
                                    backgroundColor={'#2A6FFF'} color={'#FFFFFF'}
                                    boxShadow={'0 0 3px 0 rgba(38, 109, 240, 0.12)'} padding={'4px 4px 4px 8px'}
                                    fontSize={'12px'} fontWeight={500} h={'fit-content'}>
                                Add to Project <span className={styles.RightContent}>⌘P</span>
                            </Button>
                            <Flex className={styles.mailBoxHeaderIcon} align={'center'} gap={'10px'}>
                                <div> <ArchiveIcon/> </div>
                                <div> <TrashIcon/> </div>
                                <div> <TimeSnoozeIcon/> </div>
                            </Flex>
                        </Flex>
                    </Flex>
                    <Flex padding={'20px'} gap={5} direction={'column'} flex={1} maxHeight={'calc(708px - 57px)'} overflow={'auto'}>
                        <Flex gap={2} direction={'column'}>
                            <Flex direction={'column'} className={styles.oldMail} gap={4} padding={4} border={'1px solid #E5E7EB'} borderRadius={12} align={'center'}>
                                <Flex align={'center'} w={'100%'} gap={2}>
                                    <div className={styles.mailBoxUserImage}>

                                    </div>

                                    <Flex w={'100%'} direction={'column'}>
                                        <Flex align={'center'} justify={'space-between'} mb={1}>
                                            <Heading as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400} letterSpacing={'-0.13px'} lineHeight={1}>Michael Eisner</Heading>
                                            <Flex align={'center'} gap={'6px'}>
                                                <Text fontSize='11px' color={'#6B7280'} lineHeight={1} fontWeight={400}>5d ago</Text>
                                                <Menu>
                                                    <MenuButton className={styles.menuIcon} opacity={0} transition={'all 0.5s'} backgroundColor={'transparent'} fontSize={'12px'} h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon />}>
                                                    </MenuButton>
                                                    <MenuList className={'drop-down-list'}>
                                                        <MenuItem> Hide from project members </MenuItem>
                                                        <MenuItem> Show to project members </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Flex>
                                        </Flex>
                                        <Text fontSize='13px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1} fontWeight={400}>Et voluptate voluptatum quod necessitatibus odio. Aliquid quia in eligendi enim nihil. Dolores sed...</Text>
                                    </Flex>
                                </Flex>
                            </Flex>
                            <Flex direction={'column'} className={styles.oldMail} gap={4} padding={4} border={'1px solid #E5E7EB'} borderRadius={12} align={'center'}>
                                <Flex align={'center'} w={'100%'} gap={2}>
                                    <div className={styles.mailBoxUserImage}>

                                    </div>

                                    <Flex w={'100%'} direction={'column'}>
                                        <Flex align={'center'} justify={'space-between'} mb={1}>
                                            <Heading as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400} letterSpacing={'-0.13px'} lineHeight={1}>Michael Eisner</Heading>
                                            <Flex align={'center'} gap={'6px'}>
                                                <Text fontSize='11px' color={'#6B7280'} lineHeight={1} fontWeight={400}>5d ago</Text>
                                                <Menu>
                                                    <MenuButton className={styles.menuIcon} opacity={0} transition={'all 0.5s'} backgroundColor={'transparent'} fontSize={'12px'} h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon />}>
                                                    </MenuButton>
                                                    <MenuList className={'drop-down-list'}>
                                                        <MenuItem> Hide from project members </MenuItem>
                                                        <MenuItem> Show to project members </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Flex>
                                        </Flex>
                                        <Text fontSize='13px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1} fontWeight={400}>Et voluptate voluptatum quod necessitatibus odio. Aliquid quia in eligendi enim nihil. Dolores sed...</Text>
                                    </Flex>
                                </Flex>
                            </Flex>
                            <Flex direction={'column'} className={`${styles.oldMail} ${styles.lastOenMail}`} gap={4} padding={4} border={'1px solid #E5E7EB'} borderRadius={12} align={'center'}>
                                <Flex align={'center'} w={'100%'} gap={2}>
                                    <div className={styles.mailBoxUserImage}>

                                    </div>

                                    <Flex w={'100%'} direction={'column'}>
                                        <Flex align={'center'} justify={'space-between'} mb={1}>
                                            <Flex align={'center'} gap={1}>
                                                <Heading as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400} letterSpacing={'-0.13px'} lineHeight={1}>Michael Eisner</Heading>
                                                <span className={'dot'} />
                                                <Text fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1} fontWeight={400}>leeclow@disney.com</Text>
                                            </Flex>

                                            <Flex align={'center'} gap={'6px'}>
                                                <Flex className={styles.memberImages}>
                                                    <div className={styles.memberPhoto}>
                                                        <Image src="/image/user.png" width="24" height="24" alt=""/>
                                                    </div>
                                                    <div className={styles.memberPhoto}>
                                                        <Image src="/image/user.png" width="24" height="24" alt=""/>
                                                    </div>
                                                    <Flex align={'center'} justify={'center'} fontSize={'9px'} color={'#082561'} className={styles.memberPhoto}>
                                                        +4
                                                    </Flex>
                                                </Flex>
                                                <Text fontSize='11px' color={'#6B7280'} lineHeight={1} fontWeight={400}>5d ago</Text>
                                                <Menu>
                                                    <MenuButton className={styles.menuIcon} opacity={0} transition={'all 0.5s'} backgroundColor={'transparent'} fontSize={'12px'} h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon />}>
                                                    </MenuButton>
                                                    <MenuList className={'drop-down-list'}>
                                                        <MenuItem> Hide from project members </MenuItem>
                                                        <MenuItem> Show to project members </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Flex>
                                        </Flex>
                                        <Flex>
                                            <Text fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1} fontWeight={400}>to: leeclow@disney.com and&nbsp;</Text>
                                            <Text fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1} fontWeight={400} as='u'>6 others</Text>
                                        </Flex>
                                    </Flex>
                                </Flex>
                                <Text fontSize='md' color={'#0A101D'} lineHeight={'1.5'} letterSpacing={'-0.16px'}>Lee, we’re gearing up to launch the next Toy Story.  Can you spin up a team to start thinking about the entire launch execution, especially getting the launch to spread via organic social (TikTok)? </Text>
                            </Flex>
                        </Flex>
                        <Flex maxHeight={'450px'} direction={'column'} padding={4} mt={'auto'} gap={4} borderRadius={8} border={'1px solid #F3F4F6'} backgroundColor={'#FFFFFF'}>
                            <Flex align={'center'} justify={'space-between'} gap={4} pb={4} borderBottom={'1px solid #F3F4F6'}>
                                <Flex gap={1} align={'center'}>
                                    <Flex className={`${styles.memberImages} ${styles.smallMemberImage}`}>
                                        <div className={styles.memberPhoto}>
                                            <Image src="/image/user.png" width="24" height="24" alt=""/>
                                        </div>
                                        <div className={styles.memberPhoto}>
                                            <Image src="/image/user.png" width="24" height="24" alt=""/>
                                        </div>
                                        <Flex align={'center'} justify={'center'} fontSize={'9px'} color={'#082561'} className={styles.memberPhoto}>
                                            +4
                                        </Flex>
                                    </Flex>
                                    <Text fontSize='xs' color={'#374151'} fontWeight={500}>Draft</Text>
                                </Flex>
                                <Button className={styles.createNewDraft} backgroundColor={'#F3F4F6'} h={'auto'} padding={'4px 8px'} borderRadius={'30px'} color={'#374151'} fontSize={'12px'} fontWeight={500} lineHeight={'normal'}> Create new draft </Button>
                            </Flex>
                            <Flex align={'center'} justify={'space-between'} gap={4}>
                                <Flex align={'center'} gap={1}>
                                    <Button color={'#6B7280'} variant='link' size='xs' rightIcon={<ChevronDownIcon />}> Reply to </Button>
                                    <Flex align={'center'} gap={1}>
                                        <div className={styles.mailUserImage}>

                                        </div>
                                        <Text fontSize='xs' color={'#6B7280'}>leeclow@disney.com</Text>
                                    </Flex>
                                    <Button className={styles.editButton} color={'#374151'} backgroundColor={'#F3F4F6'} borderRadius={'20px'} lineHeight={1} size='xs'> Edit </Button>
                                </Flex>
                                <Text fontSize='11px' color={'#6B7280'}>Saved 2m ago</Text>
                            </Flex>
                            <div className={styles.replyBoxTextAreaShadow}>
                                <Textarea className={styles.replyBoxTextArea} minHeight={'16px'} maxHeight={'194px'} h={'auto'} fontWeight={500} resize={'none'} lineHeight={'normal'} border={0} borderRadius={0} padding={0} fontSize={'13px'} letterSpacing={'-0.13px'} placeholder='Let’s go and check' />
                            </div>
                            <Flex direction={'column'} className={styles.composeModal}>
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
                </Flex>
            </Box>


        </>
    )
}

export default Draft;
