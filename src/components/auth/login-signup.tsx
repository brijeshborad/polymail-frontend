import styles from "@/styles/Login.module.css";
import {AbsoluteCenter, Alert, Box, Button, ButtonGroup, Divider, Flex, Heading, Input, Text} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import {LoginProps, StateType} from "@/types";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {googleAuthLink, loginUser, registerUser} from "@/redux/auth/action-reducer";
import {InfoIcon} from "@chakra-ui/icons";
import Router from "next/router";

declare type LoginForm = {
    email: string,
    password: string
}

export function LoginSignup({type = 'login'}: LoginProps) {
    const dispatch = useDispatch();
    const {user, error, googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    const [formValues, setFormValues] = useState<LoginForm>({email: '', password: ''});

    const handleChange = (event: any) => {
        setFormValues(value => ({...value, [event.target.name]: event.target.value}))
    }

    useEffect(() => {
        if (user) {
            Router.push('/inbox');
        }
    }, [user])

    useEffect(() => {
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url;
        }
    }, [googleAuthRedirectionLink])

    function signIn() {
        if (!formValues.email || !formValues.password) {
            return;
        }
        if (type === 'login') {
            dispatch(loginUser({email: formValues.email, password: formValues.password}));
        } else {
            const bcrypt = require('bcryptjs');
            bcrypt.hash(formValues.password, 10, function (err, hash) {
                dispatch(registerUser({email: formValues.email, password: hash}));
            })
        }
    }

    function loginWithGoogle() {
        let body = {
            mode: type === 'login' ? "login" : 'register',
            successRedirectUrl: `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}`,
            failureRedirectUrl: `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}auth/signup`,
            accountType: "google",
            platform: "web"
        }
        dispatch(googleAuthLink(body));
    }

    return (
        <div className={styles.login}>
            <Flex alignItems={'center'} justifyContent={'center'} flexDir={'column'} className={styles.loginBox}>
                <Flex alignItems={'center'} className={styles.loginHeader}>
                    <Image width="30" height="30" src="/image/logo.png" alt=""/>
                    <Heading marginLeft={'10px'} as={'h6'} size='lg'>Polymail</Heading>
                </Flex>
                {error && <Alert status='error' marginBottom={'10px'}>
                    <InfoIcon marginRight={'10px'} color={'red'}/>
                    <Heading as={'h4'} size={'md'}>{error.description}</Heading>
                </Alert>}
                <ButtonGroup onClick={() => loginWithGoogle()} size='sm' isAttached variant='outline'
                             className={styles.loginGoogleButton}>
                    <Image src={'/image/google-logo.png'} alt={''} width={30} height={30}/>
                    <Button>Sign {type === 'login' ? `In` : 'Up'} With Google</Button>
                </ButtonGroup>

                <Box position='relative' py='10' width={'100%'}>
                    <Divider orientation='horizontal'/>
                    <AbsoluteCenter bg='white' px='40px'>
                        <Heading as={'h1'} size={'lg'}>or</Heading>
                    </AbsoluteCenter>
                </Box>

                <Input onChange={handleChange} name={'email'} placeholder={'name@work-email.com'}
                       className={`${styles.loginInput}`} type={'email'}/>
                <Input onChange={handleChange} name={'password'} placeholder={'password'}
                       className={`${styles.loginInput}`} type={'password'}/>
                <Button onClick={() => signIn()} className={styles.loginButton}
                        py={'25px'}>Sign {type === 'login' ? `In` : 'Up'} With
                    Email</Button>

                <Text className={styles.loginInfo}>
                    {type === 'login' ? `Don't have an account?` : 'Already have an account?'}
                    <Link href={type === 'login' ? '/auth/signup' : '/auth/login'}>
                        Sign{type === 'login' ? `Up` : 'In'}
                    </Link>
                </Text>
            </Flex>
        </div>
    )
}
