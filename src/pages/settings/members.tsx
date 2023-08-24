import styles from "@/styles/setting.module.css";
import {
    Button,
    Checkbox,
    Flex, GridItem,
    Heading, IconButton, Menu, MenuButton, MenuItem, MenuList,
    Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text, Textarea,
    Th,
    Thead,
    Tr, useDisclosure, Image, Grid
} from "@chakra-ui/react";
import React from "react";
import Index from "@/pages/settings/index";
import {MenuIcon, TextIcon} from "@/icons";
import withAuth from "@/components/withAuth";

function Members() {
    const {isOpen, onOpen, onClose} = useDisclosure();

    return (
        <div className={styles.setting}>
            <Grid templateColumns='232px auto' gap={6} h={'100%'}>
                <GridItem w='100%' className={styles.settingSideBar} padding={'40px 30px 40px 40px'}
                          borderRight={'1px solid #E1E3E6'}>
                    <Index />
                </GridItem>
                <GridItem w='100%'>
                    <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                        <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                            <Heading as='h4' size='lg' gap={1}> Members </Heading>
                            <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                                here.</Text>
                        </Flex>

                        <Flex direction={"column"} className={styles.SettingDetails}>
                            <div className={styles.memberTable}>
                                <Flex alignItems={'center'} justify={'space-between'} gap={4} padding={'20px 24px'}>
                                    <Heading as='h4' fontSize={'18px'} fontWeight={600} color={'#101828'}>Team members</Heading>
                                    <Button className={styles.inviteMemberButton} fontSize={'14px'} onClick={onOpen} backgroundColor={'black'} color={'white'} height={'auto'} padding={'10px 20px'}>Invite</Button>
                                </Flex>
                                <TableContainer>
                                    <Table variant='simple'>
                                        <Thead>
                                            <Tr backgroundColor={'#F9FAFB'} borderColor={'#EAECF0'} borderTop={'1px solid #EAECF0'}>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'} width={'400px'}><Checkbox marginRight={3} className={styles.tableCheckBox} />Name</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Status</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Role</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Email address</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Join date</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'} width={'64px'} padding={4}/>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Pending </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Admin</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Pending </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Pending </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Deactivated </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Deactivated </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Active </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Active </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Deactivated </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Active </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Pending </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Pending </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>
                                                    <Flex gap={3} align={'center'}>
                                                        <Checkbox className={styles.tableCheckBox} />
                                                        <div className={styles.tableUserImage}>
                                                            <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                        </div>
                                                        <Text fontSize='sm' fontWeight={500} color={'#101828'}>John Doe</Text>
                                                    </Flex>
                                                </Td>
                                                <Td><div className={styles.statusButton}> Pending </div></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td padding={4}>
                                                    <Menu>
                                                        <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                        <MenuList>
                                                            <MenuItem>Edit</MenuItem>
                                                            <MenuItem>Delete</MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>

                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </div>
                            <Modal isOpen={isOpen} onClose={() => onClose} closeOnOverlayClick={false} isCentered>
                                <ModalOverlay />
                                <ModalContent maxWidth={'490px'}>
                                    <ModalHeader padding={'40px 40px 24px 40px'}>
                                        <Heading as='h3' size='lg' pb={1} color={'#101828'}>Invite members</Heading>
                                        <Text fontSize='md' color={'#475467'} fontWeight={'400'}>Invite team members to Polymail</Text>
                                    </ModalHeader>
                                    <ModalBody padding={'8px 40px 16px'}>
                                        <div className={styles.newPaymentInput}>
                                            <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>Email Address</Text>
                                            <Textarea placeholder='Here is a sample placeholder' />
                                            <Flex align={'center'} gap={1} marginTop={'14px'}>
                                                <TextIcon/>
                                                <Text fontSize={'13px'} fontWeight={500} color={'#000000'}>Copy Link</Text>
                                            </Flex>
                                        </div>
                                    </ModalBody>

                                    <ModalFooter className={styles.settingButton} paddingBottom={'40px'}>
                                        <Button className={styles.settingCancel} colorScheme='blue' mr={3} onClick={onClose}> Cancel </Button>
                                        <Button className={styles.settingSave} variant='ghost'>Send Invite</Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>
        </div>

    )
}

export default withAuth(Members)
