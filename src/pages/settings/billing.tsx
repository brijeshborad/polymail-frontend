import styles from "@/styles/setting.module.css";
import {
    Button,
    Flex, Grid, GridItem,
    Heading, Input,
    Modal,
    ModalBody,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Text, useDisclosure
} from "@chakra-ui/react";
import {CheckCircleIcon} from "@chakra-ui/icons";
import React from "react";
import {MasterCardIcon} from "@/icons";
const Index = dynamic(() => import('@/pages/settings/index').then(mod => mod.default));
import withAuth from "@/components/auth/withAuth";
import dynamic from "next/dynamic";

function Billing() {
    const {isOpen, onOpen, onClose} = useDisclosure();

    return (
        <div className={styles.setting}>
            <Grid templateColumns='232px auto' gap={6} h={'100%'} minHeight={'calc(100vh - 65px)'}>
                <GridItem w='100%' className={styles.settingSideBar} padding={'40px 30px 40px 40px'}
                          borderRight={'1px solid #E1E3E6'}>
                    <Index />
                </GridItem>
                <GridItem w='100%'>
                    <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                        <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                            <Heading as='h4' size='lg' gap={1}> Billing </Heading>
                            <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                                here.</Text>
                        </Flex>

                        <Flex direction={"column"} className={styles.SettingDetails}>
                            <Flex direction={"column"}  gap={10} className={styles.settingBilling}>
                                <div className={styles.settingBillPlan}>
                                    <div className={styles.settingBillingPlan}>
                                        <Flex alignItems={'center'} justify={'space-between'} pb={4} mb={4} borderBottom={'1px solid #000000'}>
                                            <Flex alignItems={'center'} gap={2} color={'#000000'}>
                                                <CheckCircleIcon />
                                                <Text fontSize={'14px'} fontWeight={'500'}>Polymail Teams Basic</Text>
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
                                        <option value='option1'>Option 1</option>
                                        <option value='option2'>Option 2</option>
                                        <option value='option3'>Option 3</option>
                                    </Select>
                                    <Button height={'auto'} padding={'0'} mt={2} fontSize={'14px'} className={styles.addPaymentMethod} variant='ghost' onClick={onOpen}>+ Add Payment Method</Button>
                                </div>
                            </Flex>
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
                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>

        </div>
    )
}

export default withAuth(Billing)
