import {changePassword, magicCode} from "@/redux/auth/action-reducer";
import styles from "@/styles/Login.module.css";
import {StateType} from "@/types";
import {debounce, encryptData} from "@/utils/common.functions";
import LocalStorageService from "@/utils/localstorage.service";
import {ArrowBackIcon, ViewIcon, ViewOffIcon} from "@chakra-ui/icons";
import {Button, Flex, Heading, Input, InputGroup, InputRightElement, Text} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import Router, {useRouter} from "next/router";
import {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {authService} from "@/services";


export default function ForgotPassword() {
    const dispatch = useDispatch();
    const router = useRouter();
    const {magicCodeSuccess, magicCodeResponse} = useSelector((state: StateType) => state.auth);

    const [newPassword, setNewPassword] = useState<{ newP: string, confirmP: string }>({
        newP: '',
        confirmP: ''
    });

    const [passwordShow, setPasswordShow] = useState<{ newP: boolean, confirmP: boolean }>({
        newP: false,
        confirmP: false
    });

    const [passwordMatch, setPasswordMatch] = useState<boolean>(true);

    const validatePassword = useCallback(() => {
        debounce(() => {
            setPasswordMatch(newPassword.newP.trim() === newPassword.confirmP.trim())
        }, 300);
    }, [newPassword])

    useEffect(() => {
        if (newPassword.newP && newPassword.confirmP) {
            validatePassword();
        } else {
            setPasswordMatch(true);
        }
    }, [newPassword.newP, newPassword.confirmP, validatePassword])

    function handlePasswordChange(e: KeyboardEvent | any, type: string) {
        setNewPassword(prevState => ({
            ...prevState,
            [type]: e.target.value.trim()
        }))
    }

    function handlePasswordShow(e: MouseEvent | any, type: string) {
        setPasswordShow(prevState => ({
            ...prevState,
            [type]: !prevState[type as keyof object]
        }))
    }

    useEffect(() => {
        if (router.query) {
            if (router.query.code) {
                let body = {
                    code: router.query.code.toString()
                }
                dispatch(magicCode({body: body}));
            }
        }
    }, [dispatch, router.query])

    const updatePassword = () => {
        if (magicCodeSuccess) {
            let newPHash = encryptData(newPassword.newP);
            dispatch(changePassword({
                    body: {
                        newPasswordTwo: newPHash, newPasswordOne: newPHash
                    },
                    toaster: {
                        success: {
                            desc: "Password changed successfully",
                            title: "Password changed",
                            type: 'success'
                        }
                    },
                }
            ));
            LocalStorageService.clearStorage();
            Router.push(`/onboarding`);
            if (magicCodeResponse && magicCodeResponse.token) {
                authService.setAuthState({magicCodeSuccess: false});
            }
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
                    <Flex direction={'column'} mb={3}>
                        <Text fontSize={'11px'} fontWeight={600}>New Password</Text>
                        <InputGroup size='sm'>
                            <Input tabIndex={2} onChange={(e) => handlePasswordChange(e, 'newP')} borderRadius={8}
                                   border={'1px solid #E5E5E5'} fontSize={'13px'} placeholder='Enter New Password'
                                   size='sm' type={passwordShow['newP'] ? 'text' : 'password'}/>
                            <InputRightElement width='fit-content'>
                                <Button h='1.75rem' background={"transparent"} size='sm'
                                        onClick={(e) => handlePasswordShow(e, 'newP')}>
                                    {!passwordShow['newP'] ? <ViewOffIcon/> : <ViewIcon/>}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </Flex>
                    <Flex direction={'column'} mb={3}>
                        <Text fontSize={'11px'} fontWeight={600}>Confirm Password</Text>
                        <InputGroup size='sm'>
                            <Input tabIndex={3} onChange={(e) => handlePasswordChange(e, 'confirmP')}
                                   borderRadius={8}
                                   border={'1px solid #E5E5E5'} fontSize={'13px'} placeholder='Confirm Password'
                                   size='sm' type={passwordShow['confirmP'] ? 'text' : 'password'}
                                   isInvalid={!newPassword}
                                   errorBorderColor={!passwordMatch ? 'crimson' : ''}/>
                            <InputRightElement width='fit-content'>
                                <Button h='1.75rem' background={"transparent"} size='sm'
                                        onClick={(e) => handlePasswordShow(e, 'confirmP')}>
                                    {!passwordShow['confirmP'] ? <ViewOffIcon/> : <ViewIcon/>}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        {!passwordMatch &&
                        <Text fontSize={'11px'} fontWeight={600} color={'crimson'}>Passwords do not match</Text>}
                    </Flex>
                </div>

                <Button className={styles.loginButton} py={'25px'} mb={12} onClick={() => updatePassword()}>Reset
                    Password</Button>

                <Link href={'#'}> <Flex align={'center'} justify={'center'}> <ArrowBackIcon marginRight={1}/> Back to
                    login </Flex> </Link>
            </Flex>
        </div>
    )
}
