import React, {useCallback, useEffect, useState} from "react";
import withAuth from "@/components/withAuth";
import {
    Grid,
    GridItem,
    Heading,
    Flex,
    Button,
    Input,
    Text,
    UnorderedList,
    ListItem,
    Select,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {UserIcon, MasterCardIcon} from "@/icons";
import {Billing, EmailAddress, Members, Profile, Signature} from "@/components/settings";


function Index() {
    const {isOpen, onOpen, onClose} = useDisclosure();

    const [currentTab, setCurrentTab] = useState<any>(null);
    const [tabTitle, setTabTitle] = useState<any>(null);

    const openTabs = useCallback((type: string = 'profile') => {
        if (type === 'profile') {
            setTabTitle('Profile');
            setCurrentTab(<Profile/>);
        } else if (type === 'signature') {
            setTabTitle('Signature');
            setCurrentTab(<Signature/>);
        } else if (type === 'email_address') {
            setTabTitle('Email Address');
            setCurrentTab(<EmailAddress/>);
        } else if (type === 'billing') {
            setTabTitle('Billing');
            setCurrentTab(<Billing onOpen={onOpen}/>);
        } else if (type === 'members') {
            setTabTitle('Members');
            setCurrentTab(<Members onOpen={onOpen} isOpen={isOpen} onClose={onClose}/>);
        }
    }, [isOpen, onClose, onOpen]);

    useEffect(() => {
        openTabs()
    }, [openTabs])


    return (
        <div className={styles.setting}>
            <Grid templateColumns='232px auto' gap={6} h={'100%'}>
                <GridItem w='100%' className={styles.settingSideBar} padding={'40px 30px 40px 40px'}
                          borderRight={'1px solid #E1E3E6'}>

                    <Heading as='h4' mb={8} className={styles.settingTitle}> Settings </Heading>

                    <Flex direction={'column'} mb={8}>
                        <Heading display={'flex'} alignItems={'center'} mb={2} as='h5' size='sm'
                                 className={styles.settingListTitle} textTransform={'uppercase'}><UserIcon/> My Account</Heading>

                        <UnorderedList display={'flex'} gap={1} className={styles.settingList}>
                            <ListItem onClick={() => openTabs('profile')}
                                      className={tabTitle === 'profile' ? styles.active : ''}>Profile</ListItem>
                            <ListItem onClick={() => openTabs('signature')}
                                      className={tabTitle === 'signature' ? styles.active : ''}>Signature</ListItem>
                            <ListItem onClick={() => openTabs('email_address')}
                                      className={tabTitle === 'email_address' ? styles.active : ''}>Email
                                Addresses</ListItem>
                            <ListItem onClick={() => openTabs('billing')}
                                      className={tabTitle === 'billing' ? styles.active : ''}>Billing</ListItem>
                        </UnorderedList>
                    </Flex>

                    <Flex direction={'column'}>
                        <Heading display={'flex'} alignItems={'center'} mb={2} as='h5' size='sm'
                                 className={styles.settingListTitle}
                                 textTransform={'uppercase'}><UserIcon/> Workspace</Heading>

                        <UnorderedList className={styles.settingList}>
                            <ListItem onClick={() => openTabs('members')}
                                      className={tabTitle === 'members' ? styles.active : ''}>Members</ListItem>
                        </UnorderedList>
                    </Flex>
                </GridItem>

                <GridItem w='100%'>
                    <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                        <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                            <Heading as='h4' size='lg' gap={1}> {tabTitle} </Heading>
                            <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                                here.</Text>
                        </Flex>

                        <Flex direction={"column"} className={styles.SettingDetails}>
                            {currentTab}
                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>

            {/*add New Payment Modal*/}
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay/>
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
                                <Input placeholder='Card Holder Name' size='sm'/>
                            </div>
                            <div className={styles.newPaymentInput}>
                                <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>Card number</Text>
                                <div className={styles.inputIcon}>
                                    <Input placeholder='**** **** **** 1234' size='sm'/>
                                    <div className={styles.icon}>
                                        <MasterCardIcon/>
                                    </div>
                                </div>
                            </div>
                            <Grid templateColumns='repeat(2, 1fr)' gap={6}>
                                <GridItem w='100%'>
                                    <div className={styles.newPaymentInput}>
                                        <Text mb='8px' fontSize={'13px'} fontWeight={500}
                                              color={'#000000'}>Expiry</Text>
                                        <Input placeholder='mm/yy' size='sm'/>
                                    </div>
                                </GridItem>
                                <GridItem w='100%'>
                                    <div className={styles.newPaymentInput}>
                                        <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>CVV</Text>
                                        <Input placeholder='123' size='sm'/>
                                    </div>
                                </GridItem>
                            </Grid>
                            <div className={styles.newPaymentInput}>
                                <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>ZIP code</Text>
                                <Input placeholder='123456' size='sm'/>
                            </div>
                            <div className={styles.newPaymentInput}>
                                <Text mb='8px' fontSize={'13px'} fontWeight={500}
                                      color={'#000000'}>Country/Region</Text>
                                <Select placeholder='Select Country' size='sm'>
                                    <option value='option1'>Option 1</option>
                                    <option value='option2'>Option 2</option>
                                    <option value='option3'>Option 3</option>
                                </Select>
                            </div>
                        </Flex>
                    </ModalBody>

                    <ModalFooter className={styles.settingButton} paddingBottom={'40px'}>
                        <Button className={styles.settingCancel} colorScheme='blue' mr={3}
                                onClick={onClose}> Cancel </Button>
                        <Button className={styles.settingSave} variant='ghost'>Add</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default withAuth(Index);
