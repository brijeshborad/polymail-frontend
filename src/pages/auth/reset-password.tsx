import {Button, Flex, Heading, Input, Text} from "@chakra-ui/react";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import {ArrowBackIcon} from "@chakra-ui/icons";
import Link from "next/link";


export default function ResetPassword() {
    return (
        <div className={`${styles.login} ${styles.forgotPassword}`}>
            <Flex alignItems={'center'} justifyContent={'center'} flexDir={'column'} className={styles.loginBox}>
                <Flex alignItems={'center'} className={styles.loginHeader}>
                    <Image width="30" height="30" src="/image/logo.png" alt=""/>
                    <Heading marginLeft={'10px'} as={'h6'} size='lg'>Polymail</Heading>
                </Flex>

                <Heading marginLeft={'10px'} as={'h6'} mb={1} size='md'>Forgot Password?</Heading>
                <Text fontSize={'13px'} mb={10} opacity={'0.5'}>No worries, we&apos;ll send you reset instructions.</Text>

                <div className={styles.forgotInput}>
                    <Text fontSize={'13px'} fontWeight={500} textAlign={'left'}>Enter Email</Text>
                    <Input name={'email'} placeholder={'name@work-email.com'} size='md'
                           className={`${styles.loginInput}`} type={'email'}/>
                </div>

                <Button className={styles.loginButton} py={'25px'} mb={12}>Reset Password</Button>

                <Link href={'/auth/login'}> <Flex align={'center'} justify={'center'}> <ArrowBackIcon marginRight={1} /> Back to login </Flex> </Link>
            </Flex>

            <Flex alignItems={'center'} justifyContent={'center'} flexDir={'column'} className={styles.loginBox} display={'none'}>
                <Flex alignItems={'center'} className={styles.loginHeader}>
                    <Image width="30" height="30" src="/image/logo.png" alt=""/>
                    <Heading marginLeft={'10px'} as={'h6'} size='lg'>Polymail</Heading>
                </Flex>

                <Heading marginLeft={'10px'} as={'h6'} size='md' mb={1}>Check your email</Heading>
                <Text fontSize={'13px'} mb={10} opacity={'0.5'}>We sent a password reset link to brijesh@polymail.com</Text>

                <Button className={styles.loginButton} py={'25px'} mb={12}>Open email app</Button>

                <Text className={styles.loginInfo} mb={10}>
                    Didn&apos;t receive the email?<Link color={'#761799'} href={'#'}>Click to resend </Link>
                </Text>

                <Link href={'#'}> <Flex align={'center'} justify={'center'}> <ArrowBackIcon marginRight={1} /> Back to login </Flex> </Link>
            </Flex>

            <Flex alignItems={'center'} justifyContent={'center'} flexDir={'column'} className={styles.loginBox} display={'none'}>
                <Flex alignItems={'center'} className={styles.loginHeader}>
                    <Image width="30" height="30" src="/image/logo.png" alt=""/>
                    <Heading marginLeft={'10px'} as={'h6'} size='lg'>Polymail</Heading>
                </Flex>

                <Heading marginLeft={'10px'} as={'h6'} size='md' mb={1}>Set New Password</Heading>
                <Text fontSize={'13px'} textAlign={'center'} opacity={0.5} mb={10}>Your new password must be different to previously used passwords.</Text>

                <div className={styles.forgotInput}>
                    <Flex direction={'column'}>
                        <Text fontSize={'13px'} fontWeight={500} textAlign={'left'}>New Password</Text>
                        <Input placeholder={'Enter New Password'} size='md'
                               className={`${styles.loginInput}`} type={'email'}/>
                    </Flex>
                    <Flex direction={'column'}>
                        <Text fontSize={'13px'} fontWeight={500} textAlign={'left'}>Confirm Password</Text>
                        <Input placeholder={'Confirm Password'} size='md'
                               className={`${styles.loginInput}`} type={'email'}/>
                    </Flex>
                </div>

                <Button className={styles.loginButton} py={'25px'} mb={12}>Reset Password</Button>

                <Link href={'#'}> <Flex align={'center'} justify={'center'}> <ArrowBackIcon marginRight={1} /> Back to login </Flex> </Link>
            </Flex>
        </div>
    )
}
