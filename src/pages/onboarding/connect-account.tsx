import OnboardingLayout from "@/pages/onboarding/onboarding-layout";
import {Button, Flex, Heading, Input, InputGroup, InputLeftElement, InputRightElement} from "@chakra-ui/react";
import {CheckIcon, CloseIcon} from "@chakra-ui/icons";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import Router from "next/router";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {useEffect, useCallback, useState} from "react";
import {Account} from "@/models";
import {getAllAccount, removeAccountDetails, updateAccountState} from "@/redux/accounts/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";
import {googleAuthLink, updateAuthState} from "@/redux/auth/action-reducer";
import {useRouter} from "next/router";

function ConnectAccount() {
    const dispatch = useDispatch();
    const {googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    let {accounts, success} = useSelector((state: StateType) => state.accounts);
    const [accountData, setAccountData] = useState<Account>();
    const router = useRouter();

    useEffect(() => {
        if (router.query) {
            if (router.query.access_token) {
                LocalStorageService.updateUser('store', {token: router.query.access_token})
                dispatch(updateAuthState({user: {token: router.query.access_token.toString() || ''}}));
            }

            if (router.query.error) {
                Router.replace('/onboarding', undefined, {shallow: true});
                dispatch(updateAuthState({error: {description: 'Invalid account'}}));
            }
        }
    }, [dispatch, router.query]);

    function oauthWithGoogle() {
        let body = {
            mode: 'create',
            redirectUrl: `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}/onboarding/connect-account`,
            accountType: "google",
            platform: "web"
        }
        dispatch(googleAuthLink(body));
    }

    useEffect(() => {
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url || '';
        }
    }, [googleAuthRedirectionLink])

    const removeAccount = useCallback((item: Account) => {
        if (item && item.id) {
            setAccountData(item)
            dispatch(removeAccountDetails({id: item.id}));
        }
    }, [dispatch])

    useEffect(() => {
        if (success && accountData && accountData.id) {
            let data = (accounts || []).filter((item: Account) => item.id !== accountData.id)
            dispatch(updateAccountState({accounts: data}));
        }
    }, [success, accountData, dispatch])

    const getAllAccounts = useCallback(() => {
        dispatch(getAllAccount());
    }, [dispatch])

    useEffect(() => {
        getAllAccounts();
    }, [getAllAccounts])

    return (
        <>
            <OnboardingLayout>
                <Flex direction={'column'} width={'100%'}>
                    <Heading as='h4' size='md' fontWeight={700} color={'#0A101D'} mb={4}>Connect email
                        accounts</Heading>
                    <Flex direction={"column"} mb={10} gap={3}>
                    {accounts && !!accounts.length && (accounts || []).map((item: Account, index: number) => (
                            <InputGroup key={index}>
                                <InputLeftElement h={'28px'} w={'28px'} top={'4px'} left={'4px'} backgroundColor={'#EBF2FF'}
                                                borderRadius={'6px'}><CheckIcon color='#2A6FFF'/></InputLeftElement>
                                <Input fontSize={'14px'} h={'auto'} p={'7px 40px'} className={styles.onboardingInput}
                                    value={item.email} readOnly />
                                <InputRightElement h={'37px'} fontSize={'11px'}> <CloseIcon onClick={() => removeAccount(item)} color={'#9CA3AF'}/>
                                </InputRightElement>
                            </InputGroup>
                    ))}
                        <Button onClick={() => oauthWithGoogle()} 
                                className={styles.connectGoogleAccount} padding={'4px'} height={'auto'}
                                border={'1px solid #E5E7EB'} width={'100%'} color={'#374151'}
                                justifyContent={'flex-start'} gap={3} backgroundColor={'#FFFFFF'} fontSize={'14px'}
                                fontWeight={'500'}  >
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
