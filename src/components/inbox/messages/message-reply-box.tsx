import {Button, Flex, Menu, MenuButton, MenuItem, MenuList, Text, Textarea} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import Image from "next/image";
import {ChevronDownIcon} from "@chakra-ui/icons";
import {EmojiIcon, FileIcon, LinkIcon, TextIcon} from "@/icons";
import React from "react";


export function MessageReplyBox() {
    return (
        <Flex maxHeight={'450px'} direction={'column'} padding={4} mt={'auto'} gap={4} borderRadius={8}
              border={'1px solid #F3F4F6'} backgroundColor={'#FFFFFF'}>
            <Flex align={'center'} justify={'space-between'} gap={4} pb={4}
                  borderBottom={'1px solid #F3F4F6'}>
                <Flex gap={1} align={'center'}>
                    <Flex className={`${styles.memberImages} ${styles.smallMemberImage}`}>
                        <div className={styles.memberPhoto}>
                            <Image src="/image/user.png" width="24" height="24" alt=""/>
                        </div>
                        <div className={styles.memberPhoto}>
                            <Image src="/image/user.png" width="24" height="24" alt=""/>
                        </div>
                        <Flex align={'center'} justify={'center'} fontSize={'9px'} color={'#082561'}
                              className={styles.memberPhoto}>
                            +4
                        </Flex>
                    </Flex>
                    <Text fontSize='xs' color={'#374151'} fontWeight={500}>Draft</Text>
                </Flex>
                <Button className={styles.createNewDraft} backgroundColor={'#F3F4F6'} h={'auto'}
                        padding={'4px 8px'} borderRadius={'30px'} color={'#374151'} fontSize={'12px'}
                        fontWeight={500} lineHeight={'normal'}> Create new draft </Button>
            </Flex>
            <Flex align={'center'} justify={'space-between'} gap={4}>
                <Flex align={'center'} gap={1}>
                    <Button color={'#6B7280'} variant='link' size='xs'
                            rightIcon={<ChevronDownIcon/>}> Reply to </Button>
                    <Flex align={'center'} gap={1}>
                        <div className={styles.mailUserImage}>

                        </div>
                        <Text fontSize='xs' color={'#6B7280'}>leeclow@disney.com</Text>
                    </Flex>
                    <Button className={styles.editButton} color={'#374151'} backgroundColor={'#F3F4F6'}
                            borderRadius={'20px'} lineHeight={1} size='xs'> Edit </Button>
                </Flex>
                <Text fontSize='11px' color={'#6B7280'}>Saved 2m ago</Text>
            </Flex>
            <div className={styles.replyBoxTextAreaShadow}>
                <Textarea className={styles.replyBoxTextArea} minHeight={'16px'} maxHeight={'194px'}
                          h={'auto'} fontWeight={500} resize={'none'} lineHeight={'normal'} border={0}
                          borderRadius={0} padding={0} fontSize={'13px'} letterSpacing={'-0.13px'}
                          placeholder='Let’s go and check'/>
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
                <Text fontSize='xs' backgroundColor={'#F3F4F6'} borderRadius={4} padding={'4px 8px'}
                      color={'#6B7280'} w={'fit-content'} lineHeight={1}>Ryan Mickle is sharing this
                    email thread (and future replies) with 1 person at chiat.com on Polymail</Text>
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
                            <MenuButton className={styles.replyArrowIcon} as={Button}
                                        aria-label='Options'
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
)
}
