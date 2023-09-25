import OnboardingLayout from "@/pages/onboarding/onboarding-layout";
import styles from "@/styles/Login.module.css";
import {Button, Flex, Heading, Image, Text} from "@chakra-ui/react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {useEffect} from "react";
import {useRouter} from 'next/router';
import LocalStorageService from "@/utils/localstorage.service";
import {googleAuthLink, updateAuthState} from "@/redux/auth/action-reducer";
import {getRedirectionUrl} from "@/utils/common.functions";



function OnBoarding() {
    const dispatch = useDispatch();
    const {user, googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (router.query) {
            if (router.query.access_token) {
                LocalStorageService.updateUser('store', {token: router.query.access_token})
                dispatch(updateAuthState({user: {token: router.query.access_token.toString() || ''}}));
                router.push('/inbox');
            }

            if (router.query.error) {
                router.replace('/onboarding', undefined, {shallow: true});
                dispatch(updateAuthState({error: {description: 'Invalid account'}}));
            }
        }
    }, [dispatch, router.query]);

    useEffect(() => {
        if (user && user?.token) {
            router.push('/inbox');
        }
    }, [user])

    function oauthWithGoogle() {
        let body = {
            mode: 'register',
            redirectUrl: getRedirectionUrl('/onboarding/complete-profile'),
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
                    <Heading as='h4' size='md' fontWeight={700} color={'#0A101D'} mb={4}>Create your account</Heading>
                    <Button onClick={() => oauthWithGoogle()} className={styles.continueButton}
                            mb={3} colorScheme='blue' padding={'4px'} height={'auto'}
                            minWidth={'327px'} justifyContent={'flex-start'} gap={3} backgroundColor={'#2A6FFF'}
                            fontSize={'14px'} fontWeight={'500'}>
                        <Flex backgroundColor={'#FFFFFF'} padding={'2px'} borderRadius={'6px'}>
                            <Image src={'/image/google-logo.png'} alt={''} width={'24px'} height={'24px'}/>
                        </Flex>
                        Sign Up with Google
                    </Button>
                    <Text fontSize='13px' letterSpacing={'-0.13px'} color={'#6B7280'}>If you already have an account, log in here.</Text>
                </Flex>
            </OnboardingLayout>
        </>
    )
}

export default OnBoarding;
