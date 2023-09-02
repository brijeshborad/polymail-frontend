import OnboardingLayout from "@/pages/onboarding/onboarding-layout";
import styles from "@/styles/Login.module.css";
import {Button, Flex, Heading, Image, Text} from "@chakra-ui/react";
import Router from "next/router";


function OnBoarding() {
    return (
        <>
            <OnboardingLayout>
                <Flex direction={'column'}>
                    <Heading as='h4' size='md' fontWeight={700} color={'#0A101D'} mb={4}>Create your account</Heading>
                    <Button onClick={() => Router.push('/onboarding/connect-account')} className={styles.continueButton}
                            mb={3} colorScheme='blue' padding={'4px'} height={'auto'}
                            minWidth={'327px'} justifyContent={'flex-start'} gap={3} backgroundColor={'#2A6FFF'}
                            fontSize={'14px'} fontWeight={'500'}>
                        <Flex backgroundColor={'#FFFFFF'} padding={'2px'} borderRadius={'6px'}>
                            <Image src={'/image/google-logo.png'} alt={''} width={'24px'} height={'24px'}/>
                        </Flex>
                        Continue with dorde@poly.com
                    </Button>
                    <Text fontSize='13px' letterSpacing={'-0.13px'} color={'#6B7280'}>or use another email
                        address</Text>
                </Flex>
            </OnboardingLayout>
        </>
    )
}

export default OnBoarding;
