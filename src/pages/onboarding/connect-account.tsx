import OnboardingLayout from "@/pages/onboarding/onboarding-layout";
import {Button, Flex, Heading, Input, InputGroup, InputLeftElement, InputRightElement} from "@chakra-ui/react";
import {CheckIcon, CloseIcon} from "@chakra-ui/icons";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import Router from "next/router";


function ConnectAccount() {
    return (
        <>
            <OnboardingLayout>
                <Flex direction={'column'} width={'100%'}>
                    <Heading as='h4' size='md' fontWeight={700} color={'#0A101D'} mb={4}>Connect email
                        accounts</Heading>
                    <Flex direction={"column"} mb={10} gap={3}>
                        <InputGroup>
                            <InputLeftElement h={'28px'} w={'28px'} top={'4px'} left={'4px'} backgroundColor={'#EBF2FF'}
                                              borderRadius={'6px'}><CheckIcon color='#2A6FFF'/></InputLeftElement>
                            <Input fontSize={'14px'} h={'auto'} p={'7px 40px'} className={styles.onboardingInput}
                                   placeholder='Enter amount'/>
                            <InputRightElement h={'37px'} fontSize={'11px'}> <CloseIcon color={'#9CA3AF'}/>
                            </InputRightElement>
                        </InputGroup>
                        <Button className={styles.connectGoogleAccount} padding={'4px'} height={'auto'}
                                border={'1px solid #E5E7EB'} width={'100%'} color={'#374151'}
                                justifyContent={'flex-start'} gap={3} backgroundColor={'#FFFFFF'} fontSize={'14px'}
                                fontWeight={'500'}>
                            <Flex backgroundColor={'#FFFFFF'} padding={'2px'} borderRadius={'6px'}>
                                <Image src={'/image/google-logo.png'} alt={''} width={24} height={24}/>
                            </Flex>
                            Connect another Google account
                        </Button>
                    </Flex>
                    <Button onClick={() => Router.push('/onboarding/complete-profile')}
                            className={styles.continueButton} height={'auto'} padding={'10px 12px'}
                            backgroundColor={'#1F2937'} borderRadius={'8px'} fontSize={'14px'} width={'fit-content'}
                            color={'#ffffff'} lineHeight={'16px'} fontWeight={'500'}>Continue</Button>
                </Flex>
            </OnboardingLayout>
        </>
    )
}

export default ConnectAccount;
