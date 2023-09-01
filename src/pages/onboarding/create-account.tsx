import {Button, Flex, Heading, Link, Text, Image} from "@chakra-ui/react";
import styles from "@/styles/Login.module.css";
import {OnboardingLogoIcon} from "@/icons";

function CreateAccount() {
    return (
        <>
            <Flex className={styles.onBoardingPage} w={'400px'} h={'580px'} direction={'column'} justify={'space-between'} alignItems={'flex-start'} >
                <OnboardingLogoIcon />
                <Flex direction={'column'}>
                    <Heading as='h4' size='md' fontWeight={700} color={'#0A101D'} mb={4}>Create your account</Heading>
                    <Button className={styles.continueButton} mb={3} colorScheme='blue' padding={'4px'} height={'auto'} minWidth={'327px'} justifyContent={'flex-start'} gap={3} backgroundColor={'#2A6FFF'} fontSize={'14px'} fontWeight={'500'}>
                        <Flex backgroundColor={'#FFFFFF'} padding={'2px'} borderRadius={'6px'} >
                            <Image src={'/image/google-logo.png'} alt={''} width={'24px'} height={'24px'}/>
                        </Flex>
                        Continue with dorde@poly.com
                    </Button>
                    <Text fontSize='13px' letterSpacing={'-0.13px'} color={'#6B7280'}>or use another email address</Text>
                </Flex>
                <Text className={styles.onBoardingPolicy} fontSize='13px' letterSpacing={'-0.13px'} color={'#6B7280'}> By signing up, I agree to Polymail’s &nbsp;
                    <Link href={'#'}>Terms</Link>&nbsp;and&nbsp;
                    <Link href={'#'}>Privacy Policy</Link>.
                </Text>
            </Flex>
        </>
    )
}

export default CreateAccount;
