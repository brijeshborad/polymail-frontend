import styles from "@/styles/setting.module.css";
import {Button, Flex, Select, Text} from "@chakra-ui/react";
import {CheckCircleIcon} from "@chakra-ui/icons";
import React from "react";
import {BillingTypes} from "@/types/props-types/BillingProps";

function Billing(props: BillingTypes) {
    return (
        <div>
            <Flex direction={"column"}  gap={10} className={styles.settingBilling}>
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
                        <option value='option1'>Option 1</option>
                        <option value='option2'>Option 2</option>
                        <option value='option3'>Option 3</option>
                    </Select>
                    <Button height={'auto'} padding={'0'} mt={2} fontSize={'14px'} className={styles.addPaymentMethod} variant='ghost' onClick={() => props.onOpen}>+ Add Payment Method</Button>
                </div>
            </Flex>
        </div>
    )
}

export default Billing;
