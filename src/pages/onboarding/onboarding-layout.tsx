import {Flex, Grid, GridItem, Heading, Link, Text} from "@chakra-ui/react";
import {CheckIcon} from "@chakra-ui/icons";
import styles from "@/styles/Login.module.css";
import {OnboardingLogoIcon} from "@/icons";

export default function OnboardingLayout({children}: any) {
    return (
        <div className={styles.onBoarding}>
            <Grid templateColumns='auto 600px' className={styles.onBoardingGrid} gap={6} h={'100vh'} bg={'#FFFFFF'}>
                <GridItem w='100%' padding={'20px'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <Flex className={styles.onBoardingPage} direction={'column'}
                          justify={'space-between'} alignItems={'flex-start'}>
                        <OnboardingLogoIcon/>
                        {children}
                        <Text className={styles.onBoardingPolicy} fontSize='13px' letterSpacing={'-0.13px'}
                              color={'#6B7280'}> By signing up, I agree to Polymail’s&nbsp;
                            <Link href={'/tos.html'}>Terms</Link>&nbsp;and&nbsp;
                            <Link href={'/privacy.html'}>Privacy Policy</Link>.
                        </Text>
                    </Flex>
                </GridItem>
                <GridItem w='100%' padding={'20px'} bg={'#F9FAFB'} display={'flex'} alignItems={'center'}
                          justifyContent={'center'}>
                    <Flex w={'400px'} direction={'column'} justify={'center'} alignItems={'flex-start'} gap={7}>
                        <Flex gap={2}>
                            <Flex color={'#2A6FFF'}> <CheckIcon/> </Flex>
                            <Flex direction={'column'} gap={'6px'}>
                                <Heading as='h5' lineHeight={'1.3'} size='sm' fontWeight={'600'} color={'#0A101D'}>Read,
                                    write, and send email</Heading>
                                <Text fontSize='13px' color={'#6B7280'} letterSpacing={'-0.13px'} lineHeight={'1.21'}>Polymail
                                    will need full access to your Google email account so that you can read, write, and
                                    send email collaboratively.</Text>
                            </Flex>
                        </Flex>

                        <Flex gap={2}>
                            <Flex color={'#2A6FFF'}> <CheckIcon/> </Flex>
                            <Flex direction={'column'} gap={'6px'}>
                                <Heading as='h5' lineHeight={'1.3'} size='sm' fontWeight={'600'} color={'#0A101D'}>Share
                                    what you want</Heading>
                                <Text fontSize='13px' color={'#6B7280'} letterSpacing={'-0.13px'} lineHeight={'1.21'}>By
                                    default, your email is <Text as='u'> only visible to you.</Text> Only when you add a
                                    thread to a project is it shared with your team.</Text>
                            </Flex>
                        </Flex>

                        <Flex gap={2}>
                            <Flex color={'#2A6FFF'}> <CheckIcon/> </Flex>
                            <Flex direction={'column'} gap={'6px'}>
                                <Heading as='h5' lineHeight={'1.3'} size='sm' fontWeight={'600'} color={'#0A101D'}>Privacy
                                    matters</Heading>
                                <Text fontSize='13px' color={'#6B7280'} letterSpacing={'-0.13px'} lineHeight={'1.21'}>Polymail
                                    stores your email securely and is regularly audited by Google for security.</Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>
        </div>
    )
}
