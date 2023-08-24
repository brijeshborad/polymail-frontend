import React from "react";
import {
    Badge, Box, Button, Checkbox,
    Flex, Grid, GridItem,
    Heading, Menu, MenuButton, MenuItem, MenuList, Text, Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton, useDisclosure, Input,
} from "@chakra-ui/react";
import withAuth from "@/components/withAuth";
import styles from "@/styles/project.module.css";
import Image from "next/image";
import {ChevronDownIcon, ChevronUpIcon, CloseIcon, WarningIcon} from "@chakra-ui/icons";
import {
    ArchiveIcon,
    DisneyIcon,
    TimeSnoozeIcon,
    TrashIcon
} from "@/icons";
import styles2 from "@/styles/common.module.css";
import {ProjectReplyBox, ProjectThreads} from "@/components/project";


function Index() {
    const {isOpen, onOpen, onClose} = useDisclosure();
    return (
        <>
            <Flex direction={'column'} padding={'28px 40px 16px'} className={styles.projectPage}
                  backgroundColor={'#FCFCFD'} height={'100%'}>
                <Flex align={'center'} justify={'space-between'} gap={4} paddingBottom={6}
                      borderBottom={'1px solid rgba(8, 22, 47, 0.12)'}>
                    <Flex align={'center'} gap={2}>
                        <div className={styles.imgWrapper}>
                            <Image src="/image/user.png" width="36" height="36" alt=""/>
                        </div>
                        <Heading as='h4' fontSize={'24px'} color={'#08162F'}>Disney Launch</Heading>
                        <Badge color={'#000000'} fontSize={'14px'} fontWeight={'600'} backgroundColor={'#E9E9E9'}
                               padding={'3px 6px'} borderRadius={'4px'} lineHeight={'1.19'}>4 threads</Badge>
                    </Flex>
                    <Flex align={'center'} gap={1}>
                        <div className={styles.userImage}>
                            <Image src="/image/user.png" width="36" height="36" alt=""/>
                        </div>
                        <div className={styles.userImage}>
                            <Image src="/image/user.png" width="36" height="36" alt=""/>
                        </div>
                        <div className={styles.userImage}>
                            <Image src="/image/user.png" width="36" height="36" alt=""/>
                        </div>
                        <Button className={styles.manageMembers} onClick={onOpen} ml={2} backgroundColor={'#000000'}
                                color={'#ffffff'} lineHeight={'1'} fontSize={'14px'} borderRadius={'8px'}
                                height={'auto'} padding={'12px 16px'}> Manage Members</Button>
                    </Flex>
                </Flex>

                <Grid templateColumns='30% auto' mt={7} gap={10} height={'100%'}>
                    <ProjectThreads />
                    <ProjectReplyBox />
                </Grid>




            </Flex>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay/>
                <ModalContent maxWidth={'480px'} className={styles.projectMemberModal}>
                    <ModalHeader fontSize={'13px'} color={'#08162F'} borderBottom={'1px solid rgba(0, 0, 0, 0.1)'}>Project
                        members</ModalHeader>
                    <ModalCloseButton top={'13px'} right={'17px'} className={styles.closeIcon}/>
                    <ModalBody padding={'12px 16px 16px'}>
                        <div className={styles.addProjectMember}>
                            <Heading as='h6' size='xs' mb={2}>Add Members</Heading>
                            <Flex align={'center'} gap={1}>
                                <Flex align={'center'} position={"relative"} className={styles.emailAddress}
                                      padding={'6px 8px 6px 16px'} width={'100%'}>
                                    <Input p={0} h={'auto'} border={0} placeholder='Name or Email Address' size='xs'/>
                                    <Menu>
                                        <MenuButton className={styles.memberButton} backgroundColor={'transparent'}
                                                    minWidth={'70px'} padding={0} height={'auto'} fontSize={'13px'}
                                                    color={'rgba(0,0,0, 0.5)'} as={Button}
                                                    rightIcon={<ChevronDownIcon/>}> Member </MenuButton>
                                        <MenuList>
                                            <MenuItem>Download</MenuItem>
                                            <MenuItem>Create a Copy</MenuItem>
                                            <MenuItem>Mark as Draft</MenuItem>
                                            <MenuItem>Delete</MenuItem>
                                            <MenuItem>Attend a Workshop</MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Flex>
                                <Button className={styles.addMemberButton} backgroundColor={'#000000'} borderRadius={8}
                                        color={'#ffffff'} minWidth={'120px'} size='sm'> Add </Button>
                            </Flex>
                        </div>
                        <Flex direction={'column'} gap={4} pt={4}>
                            <Flex align={'center'} justify={'space-between'} gap={4}>
                                <Flex align={'center'} gap={2}>
                                    <div className={styles.addMemberImage}>
                                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                                    </div>
                                    <Text fontSize='sm' color={'#000000'}>Jane Doe</Text>
                                </Flex>
                                <Menu>
                                    <MenuButton className={styles.memberButton} backgroundColor={'#E9E9E9'}
                                                borderRadius={4} padding={'2px 4px '} height={'auto'} fontSize={'12px'}
                                                color={'#000000'} as={Button}
                                                rightIcon={<ChevronDownIcon/>}> Member </MenuButton>
                                    <MenuList>
                                        <MenuItem>Download</MenuItem>
                                        <MenuItem>Create a Copy</MenuItem>
                                        <MenuItem>Mark as Draft</MenuItem>
                                        <MenuItem>Delete</MenuItem>
                                        <MenuItem>Attend a Workshop</MenuItem>
                                    </MenuList>
                                </Menu>
                            </Flex>
                            <Flex align={'center'} justify={'space-between'} gap={4}>
                                <Flex align={'center'} gap={2}>
                                    <div className={styles.addMemberImage}>
                                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                                    </div>
                                    <Text fontSize='sm' color={'#000000'}>Jane Doe</Text>
                                </Flex>
                                <Menu>
                                    <MenuButton className={styles.memberButton} backgroundColor={'#E9E9E9'}
                                                borderRadius={4} padding={'2px 4px '} height={'auto'} fontSize={'12px'}
                                                color={'#000000'} as={Button}
                                                rightIcon={<ChevronDownIcon/>}> Admin </MenuButton>
                                    <MenuList>
                                        <MenuItem>Download</MenuItem>
                                        <MenuItem>Create a Copy</MenuItem>
                                        <MenuItem>Mark as Draft</MenuItem>
                                        <MenuItem>Delete</MenuItem>
                                        <MenuItem>Attend a Workshop</MenuItem>
                                    </MenuList>
                                </Menu>
                            </Flex>
                            <Flex align={'center'} justify={'space-between'} gap={4}>
                                <Flex align={'center'} gap={2}>
                                    <div className={styles.addMemberImage}>
                                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                                    </div>
                                    <Text fontSize='sm' color={'#000000'}>Jane Doe</Text>
                                </Flex>
                                <Menu>
                                    <MenuButton className={styles.memberButton} backgroundColor={'#E9E9E9'}
                                                borderRadius={4} padding={'2px 4px '} height={'auto'} fontSize={'12px'}
                                                color={'#000000'} as={Button}
                                                rightIcon={<ChevronDownIcon/>}> Member </MenuButton>
                                    <MenuList>
                                        <MenuItem>Download</MenuItem>
                                        <MenuItem>Create a Copy</MenuItem>
                                        <MenuItem>Mark as Draft</MenuItem>
                                        <MenuItem>Delete</MenuItem>
                                        <MenuItem>Attend a Workshop</MenuItem>
                                    </MenuList>
                                </Menu>
                            </Flex>
                            <Flex align={'center'} justify={'space-between'} gap={4}>
                                <Flex align={'center'} gap={2}>
                                    <div className={styles.addMemberImage}>
                                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                                    </div>
                                    <Text fontSize='sm' color={'#000000'}>Jane Doe</Text>
                                </Flex>
                                <Menu>
                                    <MenuButton className={styles.memberButton} backgroundColor={'#E9E9E9'}
                                                borderRadius={4} padding={'2px 4px '} height={'auto'} fontSize={'12px'}
                                                color={'#000000'} as={Button}
                                                rightIcon={<ChevronDownIcon/>}> Member </MenuButton>
                                    <MenuList>
                                        <MenuItem>Download</MenuItem>
                                        <MenuItem>Create a Copy</MenuItem>
                                        <MenuItem>Mark as Draft</MenuItem>
                                        <MenuItem>Delete</MenuItem>
                                        <MenuItem>Attend a Workshop</MenuItem>
                                    </MenuList>
                                </Menu>
                            </Flex>
                            <Flex align={'center'} justify={'space-between'} gap={4}>
                                <Flex align={'center'} gap={2}>
                                    <div className={styles.addMemberImage}>
                                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                                    </div>
                                    <Text fontSize='sm' color={'#000000'}>Jane Doe</Text>
                                </Flex>
                                <Menu>
                                    <MenuButton className={styles.memberButton} backgroundColor={'#E9E9E9'}
                                                borderRadius={4} padding={'2px 4px '} height={'auto'} fontSize={'12px'}
                                                color={'#000000'} as={Button}
                                                rightIcon={<ChevronDownIcon/>}> Member </MenuButton>
                                    <MenuList>
                                        <MenuItem>Download</MenuItem>
                                        <MenuItem>Create a Copy</MenuItem>
                                        <MenuItem>Mark as Draft</MenuItem>
                                        <MenuItem>Delete</MenuItem>
                                        <MenuItem>Attend a Workshop</MenuItem>
                                    </MenuList>
                                </Menu>
                            </Flex>

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

export default withAuth(Index);
