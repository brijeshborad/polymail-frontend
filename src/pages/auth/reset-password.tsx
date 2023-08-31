import {Button, Flex, Heading, Input, InputGroup, InputRightElement, Text} from "@chakra-ui/react";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import {ArrowBackIcon, ViewIcon, ViewOffIcon} from "@chakra-ui/icons";
import Link from "next/link";
import {changePassword, magicCode, updateAuthState} from "@/redux/auth/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import React, {ChangeEvent, useEffect, useState} from "react";
import {encryptData} from "@/utils/common.functions";
import Router, {useRouter} from "next/router";
import {StateType} from "@/types";
import {Toaster} from "@/components/common";
import LocalStorageService from "@/utils/localstorage.service";


export default function ForgotPassword() {
    const dispatch = useDispatch();
    const router = useRouter();
    const {magicCodeSuccess, magicCodeResponse, passwordChangeSuccess} = useSelector((state: StateType) => state.auth);

    const [newPassword, setNewPassword] = useState<string>('');

    const [passwordShow, setPasswordShow] = useState<boolean>(false);

    const handleChange = (event: ChangeEvent | any) => {
        setNewPassword(event.target.value.trim());
    }
    function handlePasswordShow() {
        setPasswordShow(prevState => (!prevState))
    }

    useEffect(() => {
        if (passwordChangeSuccess) {
            Toaster({
                desc: "Password changed successfully",
                title: "Password changed",
                type: 'success'
            });
            dispatch(updateAuthState({passwordChangeSuccess: false}));
            LocalStorageService.clearStorage();
            Router.push(`/auth/login`);
            if (magicCodeResponse && magicCodeResponse.token) {
                dispatch(updateAuthState({magicCodeSuccess: false}));
            }
        }
    })

    useEffect(() => {
        if (router.query) {
            if (router.query.code) {
                let body = {
                    code: router.query.code.toString()
                }
                dispatch(magicCode(body));
            }
        }
    }, [dispatch, router.query])

    const updatePassword = () => {
        if (magicCodeSuccess) {
            let newPHash = encryptData(newPassword);
            dispatch(changePassword({newPasswordTwo: newPHash, newPasswordOne: newPHash}));

        }

    }

    return (
        <div className={`${styles.login} ${styles.forgotPassword}`}>
            <Flex alignItems={'center'} justifyContent={'center'} flexDir={'column'} className={styles.loginBox}>
                <Flex alignItems={'center'} className={styles.loginHeader}>
                    <Image width="30" height="30" src="/image/logo.png" alt=""/>
                    <Heading marginLeft={'10px'} as={'h6'} size='lg'>Polymail</Heading>
                </Flex>

                <Heading marginLeft={'10px'} as={'h6'} size='md' mb={1}>Set New Password</Heading>
                <Text fontSize={'13px'} textAlign={'center'} opacity={0.5} mb={10}>Your new password must be different
                    to previously used passwords.</Text>

                <div className={styles.forgotInput}>
                    <Flex direction={'column'} mb={5}>
                        <Text fontSize={'13px'} fontWeight={500} textAlign={'left'}>New Password</Text>
                        {/*<Input placeholder={'Enter New Password'} size='md' onChange={handleChange}*/}
                        {/*       className={`${styles.loginInput}`} type={'email'}/>*/}

                        <InputGroup size='sm'>
                            <Input tabIndex={3} onChange={handleChange}
                                   borderRadius={8} className={`${styles.loginInput}`}
                                   border={'1px solid #E5E5E5'} fontSize={'13px'} placeholder='Confirm Password'
                                   size='sm' type={passwordShow ? 'text' : 'password'}
                                   isInvalid={!newPassword}/>
                            <InputRightElement width='fit-content' h='40px'>
                                <Button h='40px' background={"transparent"} size='sm'
                                        onClick={() => handlePasswordShow()}>
                                    {!passwordShow ? <ViewOffIcon/> : <ViewIcon/>}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </Flex>
                    {/*<Flex direction={'column'}>*/}
                    {/*    <Text fontSize={'13px'} fontWeight={500} textAlign={'left'}>Confirm Password</Text>*/}
                    {/*    <Input placeholder={'Confirm Password'} size='md'*/}
                    {/*           className={`${styles.loginInput}`} type={'email'}/>*/}
                    {/*</Flex>*/}
                </div>

                <Button className={styles.loginButton} py={'25px'} mb={12} onClick={() => updatePassword()}>Reset
                    Password</Button>

                <Link href={'#'}> <Flex align={'center'} justify={'center'}> <ArrowBackIcon marginRight={1}/> Back to
                    login </Flex> </Link>
            </Flex>
        </div>
    )
}
