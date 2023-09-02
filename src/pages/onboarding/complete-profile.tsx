import OnboardingLayout from "@/pages/onboarding/onboarding-layout";
import {Box, Button, Flex, Heading, Input, Text} from "@chakra-ui/react";
import styles from "@/styles/Login.module.css";
import {UploadIcon} from "@/icons";
import Router from "next/router";


function CompleteProfile() {
    return (
        <>
            <OnboardingLayout>
                <Flex direction={'column'} width={'100%'}>
                    <Heading as='h4' size='md' fontWeight={700} color={'#0A101D'} mb={4}>Complete your profile</Heading>
                    <Flex direction={"column"} mb={10} gap={6}>
                        <div>
                            <Text fontSize={'13px'} mb={2} lineHeight={'1'} color={'#374151'}>Full Name</Text>
                            <Input backgroundColor={'#ffffff'} border={'1px solid #E5E7EB'} borderRadius={'8px'}
                                   placeholder='Dorde Vanjek' size='sm'/>
                        </div>
                        <div>
                            <Flex>
                                <Text fontSize={'13px'} mb={2} lineHeight={'1'} color={'#374151'}>Profile Image </Text>
                                <Text fontSize={'13px'} mb={2} lineHeight={'1'}
                                      color={'#9CA3AF'}>&nbsp;(optional)</Text>
                            </Flex>

                            <Flex className={styles.uploadProfileImage} gap={3} alignItems={'center'} padding={'12px'}
                                  border={'1px solid #E5E7EB'} position={'relative'} borderRadius={'50px'}
                                  minWidth={'300px'}>
                                <Box w={'50px'} h={'50px'} bg={'#EBF2FF'} display={'flex'} alignItems={'center'}
                                     justifyContent={'center'} borderRadius={'50px'}>
                                    <UploadIcon/>
                                    {/*<Input type='file' position={'absolute'} borderRadius={'50px'} padding={'0'} h={'50px'} width={'50px'} opacity={'0'} zIndex={1} />*/}
                                </Box>
                                <div>
                                    <Heading mb={1} as='h5' fontSize={'15px'} color={'#0A101D'}>Select media to
                                        upload</Heading>
                                    <Text fontSize='xs' color={'#9CA3AF'}>Max size 10MB</Text>
                                </div>
                            </Flex>
                        </div>
                    </Flex>
                    <Flex gap={3}>
                        <Button onClick={() => Router.push('/onboarding/connect-account')} className={styles.backButton}
                                height={'auto'} padding={'9px 12px'} backgroundColor={'transparent'}
                                border={'1px solid #374151'} borderRadius={'8px'} fontSize={'14px'}
                                width={'fit-content'} color={'#374151'} lineHeight={'16px'}
                                fontWeight={'500'}>Back</Button>
                        <Button className={styles.continueButton} height={'auto'} padding={'9px 12px'}
                                backgroundColor={'#1F2937'} borderRadius={'8px'} fontSize={'14px'} width={'fit-content'}
                                color={'#ffffff'} lineHeight={'16px'} fontWeight={'500'}>Continue</Button>
                    </Flex>

                </Flex>
            </OnboardingLayout>
        </>
    )
}

export default CompleteProfile;
