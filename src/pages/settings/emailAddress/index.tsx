import {Button, Flex, Link, Text} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {AppleIcon, GoogleIcon} from "@/icons";
import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Account} from "@/models";
import {googleAuthLink} from "@/redux/auth/action-reducer";


export default function EmailAddress() {
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

    return (
        <div>
            <Flex direction={"column"} gap={10} className={styles.settingEmailAddress} >
                <Flex direction={"column"} gap={2} className={styles.settingSocialLink}>
                    <Button colorScheme='blue' onClick={() => addNewGoogleAccount()}><GoogleIcon/> Add email address via Google</Button>
                    <Button colorScheme='blue'><AppleIcon/> Add email address via Apple</Button>
                </Flex>

                <Flex direction={"column"} gap={1} className={styles.addedEmailAddress}>
                    <Text fontSize={'13px'} mb={2} color={'#08162F'}>Added Email Addresses:</Text>
                    {accounts && (accounts || []).map((item: Account, index: number) => (
                        <Flex direction={'column'} gap={1} key={index}>
                            <Flex alignItems={'center'} justify={'space-between'} p={1} gap={2} width={'100%'} className={styles.settingAddedEmailAddress}>
                                <Flex alignItems={'center'} gap={3}>
                                    <Flex alignItems={'center'} justify={'center'} className={styles.settingAddressSocialIcon}>
                                        <GoogleIcon/>
                                    </Flex>
                                    <Link fontSize={'13px'} href='mailto:emailaddress@example.com' isExternal>{item.email} </Link>
                                </Flex>
                                {/*<CloseIcon className={styles.closeIcon} cursor={"pointer"} />*/}
                            </Flex>
                        </Flex>

                    ))}

                </Flex>
            </Flex>

            <Flex align={'center'} gap={2} mt={10} className={styles.settingButton}>
                <Button className={styles.settingSave} >Save</Button>
                <Button className={styles.settingCancel}>Cancel</Button>
            </Flex>

        </div>
    )
}
