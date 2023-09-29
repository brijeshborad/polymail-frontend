import OnboardingLayout from "@/pages/onboarding/onboarding-layout";
import styles from "@/styles/Login.module.css";
import {Button, Flex, Heading, Image, Text} from "@chakra-ui/react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {useEffect} from "react";
import Router, {useRouter} from 'next/router';
import LocalStorageService from "@/utils/localstorage.service";
import {googleAuthLink, updateAuthState} from "@/redux/auth/action-reducer";
import {getRedirectionUrl} from "@/utils/common.functions";
import {getUsersDetails} from "@/redux/users/action-reducer";

function OnBoardingType() {
    const dispatch = useDispatch();
    const {user, googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const router = useRouter();

    useEffect(() => {
        if (router.query) {
            if (router.query.access_token) {
                LocalStorageService.updateUser('store', {token: router.query.access_token})
                dispatch(updateAuthState({user: {token: router.query.access_token.toString() || ''}}));
                dispatch(getUsersDetails({}));
                return;
            }

            if (router.query.error) {
                Router.replace(`/onboarding/${router.query.type}`, undefined, {shallow: true});
                dispatch(updateAuthState({error: {description: 'Invalid account'}}));
                return;
            }
        }
    }, [dispatch, router.query]);

    useEffect(() => {
        if (userDetails && user && user?.token) {
            console.log(userDetails);
            if (userDetails.onboarded) {
                Router.push('/inbox');
            } else {
                Router.push('/onboarding/connect-account');
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
        dispatch(googleAuthLink(body));
    }

    useEffect(() => {
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url || '';
        }
    }, [googleAuthRedirectionLink])

    return (
        <>
            <OnboardingLayout>
                <Flex direction={'column'}>
                    <Heading as='h4' size='md' fontWeight={700} color={'#0A101D'}
                             mb={4}>{router.query.type === 'login' ? 'Log into' : 'Create'} your account</Heading>
                    <Button onClick={() => oauthWithGoogle()} className={styles.continueButton}
                            mb={3} colorScheme='blue' padding={'4px'} height={'auto'}
                            minWidth={'327px'} justifyContent={'flex-start'} gap={3} backgroundColor={'#2A6FFF'}
                            fontSize={'14px'} fontWeight={'500'}>
                        <Flex backgroundColor={'#FFFFFF'} padding={'2px'} borderRadius={'6px'}>
                            <Image src={'/image/google-logo.png'} alt={''} width={'24px'} height={'24px'}/>
                        </Flex>
                        {router.query.type === 'login' ? 'Log in' : 'Sign Up'} with Google
                    </Button>
                    <Text fontSize='13px' letterSpacing={'-0.13px'}
                          color={'#6B7280'}>{router.query.type === 'login' ? 'If you don\'t have an account' : 'If you already have an account'},&nbsp;
                        <button style={{textDecoration: 'underline'}}
                            onClick={() => Router.push(`/onboarding/${router.query.type === 'login' ? 'signup' : 'login'}`, undefined, {shallow: true})}>
                            {router.query.type === 'login' ? ' sign up ' : ' log in '} here.</button>
                    </Text>
                </Flex>
            </OnboardingLayout>
        </>
    )
}

export default OnBoardingType;
