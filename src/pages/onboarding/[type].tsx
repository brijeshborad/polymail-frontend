import OnboardingLayout from "@/pages/onboarding/onboarding-layout";
import styles from "@/styles/Login.module.css";
import {Button, Flex, Heading, Image, Text} from "@chakra-ui/react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {useEffect, useState} from "react";
import Router, {useRouter} from 'next/router';
import LocalStorageService from "@/utils/localstorage.service";
import {authRefreshToken, googleAuthLink} from "@/redux/auth/action-reducer";
import {getRedirectionUrl} from "@/utils/common.functions";
import {getUsersDetails} from "@/redux/users/action-reducer";
import {Toaster} from "@/components/common";
import {accountService, authService, organizationService} from "@/services";

function OnBoardingType() {
    const dispatch = useDispatch();
    const {user, googleAuthRedirectionLink, refreshToken} = useSelector((state: StateType) => state.auth);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const router = useRouter();
    const [showPage, setShowPage] = useState<boolean>(false);
    const [loginButtonDisabled, setLoginButtonDisabled] = useState<boolean>(true);

    useEffect(() => {
        if (router.query) {
            if (router.query.access_token) {
                LocalStorageService.updateUser('store', {token: router.query.access_token})
                authService.setUser({token: router.query.access_token.toString() || ''});
                dispatch(getUsersDetails({}));
                return;
            }

            if (router.query.error) {
                Router.replace(`/onboarding/${router.query.type}`, undefined, {shallow: true});
                authService.setAuthState({error: {description: 'Invalid account'}});
                
                if (router.query.error === 'account_exists') {
                  Toaster({
                    type: 'error',
                    title: 'An account with this email already exists', 
                    desc: 'Try logging in or setting up a new account', 
                  });
                } else {
                  Toaster({
                    type: 'error',
                    title: 'User not found', 
                    desc: 'Invalid account', 
                  });
                }
                
                return;
            }
        }
    }, [dispatch, router.query]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('access_token')) {
            setShowPage(false);
        } else {
            setShowPage(true);
        }
    }, []);

    useEffect(() => {
        let user = LocalStorageService.updateUser('get');
        if (user && user.token) {
            dispatch(authRefreshToken({}));
        } else {
            setLoginButtonDisabled(false)
        }
    }, [dispatch])

    useEffect(() => {
        if (userDetails && userDetails.hasOwnProperty('onboarded')) {
            if (user && user?.token) {
                if (userDetails.onboarded) {
                    Router.push('/inbox');
                } else {
                    Router.push('/onboarding/complete-profile');
                }
            }
        }
    }, [user, userDetails])

    function oauthWithGoogle() {
        let body = {
            mode: router.query.type === 'login' ? 'login': 'register',
            redirectUrl: getRedirectionUrl(`/onboarding/${router.query.type}`),
            accountType: "google",
            platform: "web"
        }
        dispatch(googleAuthLink({
            body: body
        }));
    }

    useEffect(() => {
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url || '';
        }
    }, [googleAuthRedirectionLink])

    useEffect(() => {
        if (refreshToken === 'success') {
            Router.push('/inbox');
        }
        if (refreshToken === 'error') {
            setLoginButtonDisabled(false)
            authService.setUser(null);
            accountService.setSelectedAccount(null);
            organizationService.setSelectedOrganization(null);
            LocalStorageService.clearStorage();
        }
    }, [refreshToken])

    if (!showPage) {
        return null;
    }

    return (
        <>
            <OnboardingLayout>
                <Flex direction={'column'}>
                    <Heading as='h4' size='md' fontWeight={700} color={'#0A101D'}
                             mb={4}>{router.query.type === 'login' ? 'Log into' : 'Create'} your account</Heading>
                    <Button onClick={() => oauthWithGoogle()} backgroundColor={'#2A6FFF'} w={'fit-content'}
                            isDisabled={loginButtonDisabled} _hover={{_disabled: {background: '#2A6FFF'}}}
                            borderRadius={'2px'} height={'46px'} border={'1px solid #2A6FFF'} mb={3} className={styles.continueButton}
                            padding={'0 12px 0 0'} justifyContent={'flex-start'} fontWeight={'500'} gap={3} color={'#FFFFFF'}>
                        <Flex backgroundColor={'#FFFFFF'} padding={'13px'}>
                            <Image src={'/image/google-logo.png'} alt={''} width={'18px'} height={'18px'}/>
                        </Flex>
                        {router.query.type === 'login' ? 'Sign in' : 'Sign up'} with Google
                    </Button>
                    <Text fontSize='13px' letterSpacing={'-0.13px'}
                          color={'#6B7280'}>{router.query.type === 'login' ? 'If you don\'t have an account' : 'If you already have an account'}, {router.query.type === 'login' ? ' sign up ' : ' log in '}
                        <button style={{textDecoration: 'underline'}}
                            onClick={() => Router.push(`/onboarding/${router.query.type === 'login' ? 'signup' : 'login'}`, undefined, {shallow: true})}>here</button>.
                    </Text>
                </Flex>
            </OnboardingLayout>
        </>
    )
}

export default OnBoardingType;
