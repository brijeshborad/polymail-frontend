import {Button, Flex, Heading, Input, Text, useQuery} from "@chakra-ui/react";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import {ArrowBackIcon} from "@chakra-ui/icons";
import Link from "next/link";
import {magicCode, resetPassword} from "@/redux/auth/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {ChangeEvent, useEffect, useState} from "react";
import {encryptData} from "@/utils/common.functions";
import {useRouter} from "next/router";
import {StateType} from "@/types";


export default function Reset() {
    const dispatch = useDispatch();
    const router = useRouter();
    const {magicCodeSuccess} = useSelector((state: StateType) => state.auth);

    const [newPassword, setNewPassword] = useState<string>('');

    const handleChange = (event: ChangeEvent | any) => {
        setNewPassword(event.target.value.trim());
    }

    useEffect(() => {
        if (router.query) {
            console.log('here', router.query)
            if (router.query.code) {
                let body = {
                    code: router.query.code
                }
                dispatch(magicCode(body))
            }
        }
    }, [dispatch])

    useEffect(() => {
        console.log('magicCodeSuccess' , magicCodeSuccess)
    }, [magicCodeSuccess])

    const updatePassword = () => {
        if (router.query) {
            if (router.query.code) {
                let newPHash = encryptData(newPassword);
                let body = {
                    Password: newPHash,
                    code: router.query.code
                }
                console.log('body', body)
                dispatch(resetPassword(body));
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
                    <Flex direction={'column'}>
                        <Text fontSize={'13px'} fontWeight={500} textAlign={'left'}>New Password</Text>
                        <Input placeholder={'Enter New Password'} size='md' onChange={handleChange}
                               className={`${styles.loginInput}`} type={'email'}/>
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
