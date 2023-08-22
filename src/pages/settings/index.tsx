import React from "react";
import withAuth from "@/components/withAuth";
import {Grid, GridItem, Heading, Flex, Button, Input, Checkbox, Text, UnorderedList, ListItem, Textarea, Link, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer,
} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {FileIcon, LinkIcon, TextIcon, EmojiIcon, UserIcon, AppleIcon, GoogleIcon, MasterCardIcon} from "@/icons";
import Image from "next/image";
import {CloseIcon, CheckCircleIcon} from "@chakra-ui/icons";


function Index() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <div className={styles.setting}>
            <Grid templateColumns='232px auto' gap={6} h={'100%'}>
                <GridItem w='100%' className={styles.settingSideBar} padding={'40px 30px 40px 40px'} borderRight={'1px solid #E1E3E6'}>

                    <Heading as='h4' mb={8} className={styles.settingTitle}> Settings </Heading>

                    <Flex direction={'column'} mb={8}>
                        <Heading display={'flex'} alignItems={'center'} mb={2} as='h5' size='sm' className={styles.settingListTitle} textTransform={'uppercase'}><UserIcon/> My Account</Heading>

                        <UnorderedList display={'flex'} gap={1} className={styles.settingList}>
                            <ListItem className={styles.active}>Profile</ListItem>
                            <ListItem>Signature</ListItem>
                            <ListItem>Email Addresses</ListItem>
                            <ListItem>Billing</ListItem>
                        </UnorderedList>
                    </Flex>

                    <Flex direction={'column'}>
                        <Heading display={'flex'} alignItems={'center'} mb={2} as='h5' size='sm' className={styles.settingListTitle} textTransform={'uppercase'}><UserIcon/> Workspace</Heading>

                        <UnorderedList className={styles.settingList}>
                            <ListItem>Members</ListItem>
                        </UnorderedList>
                    </Flex>
                </GridItem>
                <GridItem w='100%'>
                    <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                        <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                            <Heading as='h4' size='lg' gap={1}> Profile </Heading>
                            <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences here.</Text>
                        </Flex>

                        <Flex direction={"column"} className={styles.SettingDetails}>
                            <div className={styles.settingProfile}
                                  style={{display: 'none'}}>
                                <div className={styles.profileDetails}>
                                    <div className={styles.ProfileImage}>
                                        <Text fontSize='sm' className={styles.ProfileText} mb={3}>Profile Picture</Text>
                                        <div className={styles.userImage}>
                                            <Image src="/image/profile.jpg" width="100" height="100" alt=""/>
                                        </div>
                                    </div>

                                    <Flex align={'center'} gap={6} mt={6} mb={6} maxWidth={'320px'}>
                                        <div className={styles.profileAccount}>
                                            <Text fontSize={'14px'}>Full Name</Text>
                                            <Input placeholder='Dorde Vanjek' />
                                        </div>
                                    </Flex>
                                </div>
                                <Flex align={'center'} className={styles.changeProfileButton} gap={5}>
                                    <Button height={'auto'} padding={'0'} className={styles.changePassword} variant='ghost'> Change Password </Button>
                                    <Button height={'auto'} padding={'0'} className={styles.deleteProfile} variant='ghost'> Delete Profile </Button>
                                </Flex>
                            </div>

                            <Flex direction={"column"} className={styles.settingSignature} gap={10} style={{display:'none'}}>
                                <Flex direction={"column"} gap={2} className={styles.profileAccount}>
                                    <Text fontSize={'14px'}>Email Signature</Text>
                                    <Textarea placeholder='Cheers dorde@vanjek.com' />
                                    <Flex align={'center'} gap={3} className={styles.settingSignatureIcon}>
                                        <FileIcon/>
                                        <LinkIcon/>
                                        <TextIcon/>
                                        <EmojiIcon/>
                                    </Flex>
                                </Flex>
                            </Flex>

                            <Flex direction={"column"} gap={10} className={styles.settingEmailAddress} style={{display: 'none'}}>
                                <Flex direction={"column"} gap={2} className={styles.settingSocialLink}>
                                    <Button colorScheme='blue'><GoogleIcon/> Add email address via Google</Button>
                                    <Button colorScheme='blue'><AppleIcon/> Add email address via Apple</Button>
                                </Flex>

                                <Flex direction={"column"} gap={1} className={styles.addedEmailAddress}>
                                    <Text fontSize={'13px'} mb={2} color={'#08162F'}>Added Email Addresses:</Text>
                                    <Flex direction={'column'} gap={1}>
                                        <Flex alignItems={'center'} justify={'space-between'} p={1} gap={2} width={'100%'} className={styles.settingAddedEmailAddress}>
                                            <Flex alignItems={'center'} gap={3}>
                                                <Flex alignItems={'center'} justify={'center'} className={styles.settingAddressSocialIcon}>
                                                    <GoogleIcon/>
                                                </Flex>
                                                <Link fontSize={'13px'} href='mailto:emailaddress@example.com' isExternal> emailaddress@example.com </Link>
                                            </Flex>
                                            <CloseIcon className={styles.closeIcon} cursor={"pointer"} />
                                        </Flex>
                                        <Flex alignItems={'center'} justify={'space-between'} p={1} gap={2} className={styles.settingAddedEmailAddress}>
                                            <Flex alignItems={'center'} gap={3}>
                                                <Flex alignItems={'center'} justify={'center'} className={styles.settingAddressSocialIcon}>
                                                    <GoogleIcon/>
                                                </Flex>
                                                <Link fontSize={'13px'} href='mailto:emailaddress@example.com' isExternal> emailaddress@example.com </Link>
                                            </Flex>
                                            <CloseIcon className={styles.closeIcon} cursor={"pointer"} />
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </Flex>

                            <Flex direction={"column"}  gap={10} className={styles.settingBilling} style={{display: 'none'}}>
                                <div className={styles.settingBillPlan}>
                                    <div className={styles.settingBillingPlan}>
                                        <Flex alignItems={'center'} justify={'space-between'} pb={4} mb={4} borderBottom={'1px solid #000000'}>
                                            <Flex alignItems={'center'} gap={2} color={'#000000'}>
                                                <CheckCircleIcon />
                                                <Text fontSize={'14px'} fontWeight={'500'}>Full Name</Text>
                                            </Flex>
                                            <Text className={styles.planMonth} fontSize={'14px'}>$10/month</Text>
                                        </Flex>
                                        <Flex direction={'column'} gap={1} className={styles.billingPlanDetails}>
                                            <div> Up to 10 Projects </div>
                                            <div>Up to 10 Team Members</div>
                                        </Flex>
                                    </div>
                                    <Button height={'auto'} padding={'0'} className={styles.changePlan} variant='ghost'>Change Plan</Button>
                                </div>

                                <div className={styles.paymentMethod}>
                                    <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>Payment Method</Text>
                                    <Select placeholder='Select option' className={styles.selectedCard}>
                                        <option value='option1'><MasterCardIcon/> Option 1</option>
                                        <option value='option2'>Option 2</option>
                                        <option value='option3'>Option 3</option>
                                    </Select>
                                    <Button height={'auto'} padding={'0'} mt={2} fontSize={'14px'} className={styles.addPaymentMethod} variant='ghost' onClick={onOpen}>+ Add Payment Method</Button>
                                </div>
                            </Flex>

                            <div className={styles.memberTable}>
                                <Flex alignItems={'center'} justify={'space-between'} gap={4} padding={'20px 24px'}>
                                    <Heading as='h4' fontSize={'18px'} fontWeight={600} color={'#101828'}>Team members</Heading>
                                    <Button className={styles.inviteMemberButton} fontSize={'14px'} backgroundColor={'black'} color={'white'} height={'auto'} padding={'10px 20px'}>Invite</Button>
                                </Flex>
                                <TableContainer>
                                    <Table variant='simple'>
                                        <Thead>
                                            <Tr backgroundColor={'#F9FAFB'} borderColor={'#EAECF0'} borderTop={'1px solid #EAECF0'}>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}><Checkbox marginRight={3} className={styles.tableCheckBox} />Name</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Status</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Role</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Email address</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Join date</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'} width={'64px'} />
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
                                                <Td>
                                                    <div className={styles.statusButton}>
                                                        Pending
                                                    </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Admin</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
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
                                                <Td>
                                                    <div className={styles.statusButton}> Pending </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
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
                                                <Td>
                                                    <div className={styles.statusButton}> Pending </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
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
                                                <Td>
                                                    <div className={styles.statusButton}> Deactivated </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
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
                                                <Td>
                                                    <div className={styles.statusButton}> Deactivated </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
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
                                                <Td>
                                                    <div className={styles.statusButton}> Active </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
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
                                                <Td>
                                                    <div className={styles.statusButton}> Active </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
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
                                                <Td>
                                                    <div className={styles.statusButton}> Deactivated </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
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
                                                <Td>
                                                    <div className={styles.statusButton}> Active </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
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
                                                <Td>
                                                    <div className={styles.statusButton}> Pending </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
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
                                                <Td>
                                                    <div className={styles.statusButton}> Pending </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
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
                                                <Td>
                                                    <div className={styles.statusButton}> Pending </div>
                                                </Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>Teammate</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>john@polymail.com</Text></Td>
                                                <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>12/12/2012</Text></Td>
                                                <Td>2</Td>
                                            </Tr>

                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </div>

                        </Flex>

                        <Flex align={'center'} gap={2} mt={10} className={styles.settingButton}>
                            <Button className={styles.settingSave}>Save</Button>
                            <Button className={styles.settingCancel}>Cancel</Button>
                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>

            {/*add New Payment Modal*/}
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay />
                <ModalContent maxWidth={'490px'}>
                    <ModalHeader padding={'40px 40px 24px 40px'}>
                        <Heading as='h3' size='lg' pb={1} color={'#101828'}> Add Payment Method </Heading>
                        <Text fontSize='md' color={'#475467'} fontWeight={'400'}>Add new payment method</Text>
                    </ModalHeader>
                    {/*<ModalCloseButton />*/}
                    <ModalBody padding={'8px 40px 16px'}>
                        <Flex direction={'column'} gap={4}>
                            <div className={styles.newPaymentInput}>
                                <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>Name on card</Text>
                                <Input placeholder='Card Holder Name' size='sm' />
                            </div>
                            <div className={styles.newPaymentInput}>
                                <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>Card number</Text>
                                <div className={styles.inputIcon}>
                                    <Input placeholder='**** **** **** 1234' size='sm' />
                                    <div className={styles.icon}>
                                        <MasterCardIcon/>
                                    </div>
                                </div>
                            </div>
                            <Grid templateColumns='repeat(2, 1fr)' gap={6}>
                                <GridItem w='100%' >
                                    <div className={styles.newPaymentInput}>
                                        <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>Expiry</Text>
                                        <Input placeholder='mm/yy' size='sm' />
                                    </div>
                                </GridItem>
                                <GridItem w='100%' >
                                    <div className={styles.newPaymentInput}>
                                        <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>CVV</Text>
                                        <Input placeholder='123' size='sm' />
                                    </div>
                                </GridItem>
                            </Grid>
                            <div className={styles.newPaymentInput}>
                                <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>ZIP code</Text>
                                <Input placeholder='123456' size='sm' />
                            </div>
                            <div className={styles.newPaymentInput}>
                                <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>Country/Region</Text>
                                <Select placeholder='Select Country' size='sm'>
                                    <option value='option1'><MasterCardIcon/> Option 1</option>
                                    <option value='option2'>Option 2</option>
                                    <option value='option3'>Option 3</option>
                                </Select>
                            </div>
                        </Flex>
                    </ModalBody>

                    <ModalFooter className={styles.settingButton} paddingBottom={'40px'}>
                        <Button className={styles.settingCancel} colorScheme='blue' mr={3} onClick={onClose}> Cancel </Button>
                        <Button className={styles.settingSave} variant='ghost'>Add</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default withAuth(Index);
