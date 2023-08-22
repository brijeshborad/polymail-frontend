import styles from "@/styles/setting.module.css";
import {
    Button,
    Checkbox,
    Flex,
    Heading, IconButton, Menu, MenuButton, MenuItem, MenuList,
    Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text, Textarea,
    Th,
    Thead,
    Tr
} from "@chakra-ui/react";
import Image from "next/image";
import React from "react";
import {BillingTypes} from "@/types/props-types/BillingProps";
import {MenuIcon, TextIcon} from "@/icons";

function Members(props: BillingTypes) {
    return (
        <div>
            <div className={styles.memberTable}>
                <Flex alignItems={'center'} justify={'space-between'} gap={4} padding={'20px 24px'}>
                    <Heading as='h4' fontSize={'18px'} fontWeight={600} color={'#101828'}>Team members</Heading>
                    <Button className={styles.inviteMemberButton} fontSize={'14px'} onClick={props.onOpen} backgroundColor={'black'} color={'white'} height={'auto'} padding={'10px 20px'}>Invite</Button>
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
            <Modal isOpen={props.isOpen as boolean} onClose={() => props.onClose} closeOnOverlayClick={false} isCentered>
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
                        <Button className={styles.settingCancel} colorScheme='blue' mr={3} onClick={props.onClose}> Cancel </Button>
                        <Button className={styles.settingSave} variant='ghost'>Send Invite</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>

    )
}

export default Members;
