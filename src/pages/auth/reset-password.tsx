import {Button, Flex, Heading, Input, Text} from "@chakra-ui/react";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import {ArrowBackIcon} from "@chakra-ui/icons";
import Link from "next/link";
import {ChangeEvent, useEffect, useState} from "react";
import {Toaster} from "@/components/common";
import {useDispatch, useSelector} from "react-redux";
import {forgotPassword} from "@/redux/auth/action-reducer";
import {StateType} from "@/types";
import Router from "next/router";


export default function ResetPassword() {
    const [email, setEmail] = useState<string>('');
    const dispatch = useDispatch();

    const handleChange = (event: ChangeEvent | any) => {
        setEmail(event.target.value);
    }
    const {passwordResetSuccess} = useSelector((state: StateType) => state.auth);

    useEffect(() => {
        if (passwordResetSuccess) {
            Toaster({
                desc: "Email send successfully",
                title: "Email send",
                type: 'success'
            });
        }
    }, [passwordResetSuccess])

    const updatePassword = () => {
        if (email.length === 0) {
            Toaster({desc: 'Please enter the proper email',title: 'Add email', type: 'error'})
            return;
        }
        let body = {
            email,
            url: `${window.location.origin}/auth/reset`,
        }
        dispatch(forgotPassword(body));
        Router.push(`/auth/login`);

    }

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
                    <Text fontSize={'13px'} fontWeight={500} textAlign={'left'} >Enter Email</Text>
                    <Input name={'email'} placeholder={'name@work-email.com'} size='md' onChange={handleChange}
                           className={`${styles.loginInput}`} type={'email'}/>
                </div>

                <Button className={styles.loginButton} py={'25px'} mb={12} onClick={() => updatePassword()}>Reset Password</Button>

                <Link href={'/auth/login'}> <Flex align={'center'} justify={'center'}> <ArrowBackIcon marginRight={1} /> Back to login </Flex> </Link>
            </Flex>

            {/*{showHtml && <Flex alignItems={'center'} justifyContent={'center'} flexDir={'column'} className={styles.loginBox} >*/}
            {/*    <Flex alignItems={'center'} className={styles.loginHeader}>*/}
            {/*        <Image width="30" height="30" src="/image/logo.png" alt="" />*/}
            {/*        <Heading marginLeft={'10px'} as={'h6'} size='lg'>Polymail</Heading>*/}
            {/*    </Flex>*/}

            {/*    <Heading marginLeft={'10px'} as={'h6'} size='md' mb={1}>Check your email</Heading>*/}
            {/*    <Text fontSize={'13px'} mb={10} opacity={'0.5'}>We sent a password reset link to {email}</Text>*/}

            {/*    <Button className={styles.loginButton} py={'25px'} mb={12}>Open email app</Button>*/}

            {/*    <Text className={styles.loginInfo} mb={10}>*/}
            {/*        Didn&apos;t receive the email?<Link color={'#761799'} href={'#'}>Click to resend </Link>*/}
            {/*    </Text>*/}

            {/*    <Link href={'#'}> <Flex align={'center'} justify={'center'}> <ArrowBackIcon marginRight={1} /> Back to login </Flex> </Link>*/}
            {/*</Flex>}*/}

        </div>
    )
}
