import styles from "@/styles/Login.module.css";
import {AbsoluteCenter, Box, Button, ButtonGroup, Divider, Flex, Heading, Input, Text} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import {LoginProps} from "@/types";

export function LoginSignup({type = 'login'}: LoginProps) {
    return (
        <div className={styles.login}>
            <Flex alignItems={'center'} justifyContent={'center'} flexDir={'column'} className={styles.loginBox}>
                <Flex alignItems={'center'} className={styles.loginHeader}>
                    <Image width="30" height="30" src="/image/logo.png" alt=""/>
                    <Heading marginLeft={'10px'} as={'h6'} size='lg'>Polymail</Heading>
                </Flex>

                <ButtonGroup size='sm' isAttached variant='outline' className={styles.loginGoogleButton}>
                    <Image src={'/image/google-logo.png'} alt={''} width={30} height={30}/>
                    <Button>Sign {type === 'login' ? `In` : 'Up'} With Google</Button>
                </ButtonGroup>

                <Box position='relative' py='10' width={'100%'}>
                    <Divider orientation='horizontal'/>
                    <AbsoluteCenter bg='white' px='40px'>
                        <Heading as={'h1'} size={'lg'}>or</Heading>
                    </AbsoluteCenter>
                </Box>

                <Input placeholder={'name@work-email.com'} className={`${styles.loginInput}`} type={'email'}/>
                <Input placeholder={'password'} className={`${styles.loginInput}`} type={'password'}/>
                <Button className={styles.loginButton} py={'25px'}>Sign {type === 'login' ? `In` : 'Up'} With
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
