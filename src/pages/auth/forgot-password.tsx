import {Toaster} from "@/components/common";
import {forgotPassword} from "@/redux/auth/action-reducer";
import styles from "@/styles/Login.module.css";
import {ArrowBackIcon} from "@chakra-ui/icons";
import {Button, Flex, Heading, Input, Text} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import Router from "next/router";
import {ChangeEvent, useState} from "react";
import {useDispatch} from "react-redux";


export default function ForgotPassword() {
    const [email, setEmail] = useState<string>('');
    const dispatch = useDispatch();

    const handleChange = (event: ChangeEvent | any) => {
        setEmail(event.target.value);
    }
    // const {passwordResetSuccess} = useSelector((state: StateType) => state.auth);

    const updatePassword = () => {
        if (email.length === 0) {
            Toaster({desc: 'Please enter valid email', title: 'Add email', type: 'error'})
            return;
        }
        let body = {
            email,
            url: `${window.location.origin}/auth/reset-password`,
        }
        dispatch(forgotPassword({
            body: body, toaster: {
                success: {
                    desc: "Email is sent successfully, Please check your email provider",
                    title: "Email Sent!",
                    type: 'success'
                }
            }
        }));
        Router.push(`/onboarding`);
    }

    return (
        <div className={`${styles.login} ${styles.forgotPassword}`}>
            <Flex alignItems={'center'} justifyContent={'center'} flexDir={'column'} className={styles.loginBox}>
                <Flex alignItems={'center'} className={styles.loginHeader}>
                    <Image width="30" height="30" src="/image/logo.png" alt=""/>
                    <Heading marginLeft={'10px'} as={'h6'} size='lg'>Polymail</Heading>
                </Flex>

                <Heading marginLeft={'10px'} as={'h6'} mb={1} size='md'>Forgot Password?</Heading>
                <Text fontSize={'13px'} mb={10} opacity={'0.5'}>No worries, we&apos;ll send you reset
                    instructions.</Text>

                <div className={styles.forgotInput}>
                    <Text fontSize={'13px'} fontWeight={500} textAlign={'left'}>Enter Email</Text>
                    <Input name={'email'} placeholder={'name@work-email.com'} size='md' onChange={handleChange}
                           className={`${styles.loginInput}`} type={'email'}/>
                </div>

                <Button className={styles.loginButton} py={'25px'} mb={12} onClick={() => updatePassword()}>Send
                    Link</Button>

                <Link href={'/onboarding'}> <Flex align={'center'} justify={'center'}> <ArrowBackIcon
                    marginRight={1}/> Back to login </Flex> </Link>
            </Flex>

        </div>
    )
}
