import {Button, Flex, Grid, GridItem, Heading, Link, Text} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {AppleIcon, GoogleIcon} from "@/icons";
import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Account} from "@/models";
import {googleAuthLink} from "@/redux/auth/action-reducer";
import Index from "@/pages/settings";
import withAuth from "@/components/withAuth";
import {CloseIcon} from "@chakra-ui/icons";
import {removeAccountDetails} from "@/redux/accounts/action-reducer";


function EmailAddress() {
    const {accounts} = useSelector((state: StateType) => state.accounts);
    const {googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);

    const dispatch = useDispatch();

    function addNewGoogleAccount() {
        let body = {
            mode: 'create',
            redirectUrl: `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}/inbox`,
            accountType: "google",
            platform: "web",
            withToken: true
        }
        dispatch(googleAuthLink(body));
    }

    useEffect(() => {
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url || '';
        }
    }, [googleAuthRedirectionLink])

    const removeAccount = (item: Account) => {
        if (item && item.id) {
            dispatch(removeAccountDetails({id: item.id}));
        }
    }

    return (
        <div className={styles.setting}>
            <Grid templateColumns='232px auto' gap={6} h={'100%'}>
                <GridItem w='100%' className={styles.settingSideBar} padding={'40px 30px 40px 40px'}
                          borderRight={'1px solid #E1E3E6'}>
                    <Index />
                </GridItem>
                <GridItem w='100%'>
                    <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                        <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                            <Heading as='h4' size='lg' gap={1}> Email Address </Heading>
                            <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                                here.</Text>
                        </Flex>

                        <Flex direction={"column"} className={styles.SettingDetails}>
                            <Flex direction={"column"} gap={10} className={styles.settingEmailAddress}>
                                <Flex direction={"column"} gap={2} className={styles.settingSocialLink}>
                                    <Button colorScheme='blue' onClick={() => addNewGoogleAccount()}><GoogleIcon/> Add email
                                        address via Google</Button>
                                    <Button colorScheme='blue'><AppleIcon/> Add email address via Apple</Button>
                                </Flex>

                                <Flex direction={"column"} gap={1} className={styles.addedEmailAddress}>
                                    <Text fontSize={'13px'} mb={2} color={'#08162F'}>Added Email Addresses:</Text>
                                    {accounts && !!accounts.length && (accounts || []).map((item: Account, index: number) => (
                                        <Flex direction={'column'} gap={1} key={index}>
                                            <Flex alignItems={'center'} justify={'space-between'} p={1} gap={2}
                                                  width={'100%'} className={styles.settingAddedEmailAddress}>
                                                <Flex alignItems={'center'} gap={3}>
                                                    <Flex alignItems={'center'} justify={'center'}
                                                          className={styles.settingAddressSocialIcon}>
                                                        <GoogleIcon/>
                                                    </Flex>
                                                    <Link fontSize={'13px'} fontWeight={'500'} href='mailto:emailaddress@example.com'
                                                          isExternal>{item.email} </Link>
                                                </Flex>
                                                <CloseIcon className={styles.closeIcon} cursor={"pointer"} onClick={() => removeAccount(item)}/>
                                            </Flex>
                                        </Flex>

                                    ))}

                                </Flex>
                            </Flex>
                            <Flex align={'center'} gap={2} mt={10} className={styles.settingButton}>
                                <Button className={styles.settingSave}>Save</Button>
                                <Button className={styles.settingCancel}>Cancel</Button>
                            </Flex> </Flex>
                    </Flex>
                </GridItem>
            </Grid>
        </div>
    )
}

export default withAuth(EmailAddress)
