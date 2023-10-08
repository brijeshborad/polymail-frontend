import {Button, Flex, Heading, Link, Text, useDisclosure} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {GoogleIcon} from "@/icons";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {InitialAccountStateType, StateType} from "@/types";
import {Account} from "@/models";
import {googleAuthLink} from "@/redux/auth/action-reducer";
import withAuth from "@/components/auth/withAuth";
import {CloseIcon} from "@chakra-ui/icons";
import {removeAccountDetails} from "@/redux/accounts/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";
import RemoveRecordModal from "@/components/common/delete-record-modal";
import Router, {useRouter} from "next/router";
import {Toaster} from "@/components/common";
import {getRedirectionUrl} from "@/utils/common.functions";
import SettingsLayout from "@/pages/settings/settings-layout";
import {accountService} from "@/services";


function EmailAddress() {
    let {accounts, success, selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    const {isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose} = useDisclosure()
    const [accountData, setAccountData] = useState<Account | null>(null);
    const dispatch = useDispatch();
    const router = useRouter();


    useEffect(() => {
        if (router.query.error) {
            let errorMessage: { title: string; desc: string }
            if (router.query.error === 'account_exists') {
                errorMessage = {
                    desc: 'This account is already exist',
                    title: 'Account already exist'
                }
            } else {
                errorMessage = {
                    desc: 'This account is invalid',
                    title: 'Invalid account'
                }
            }
            Toaster({
                desc: errorMessage.desc,
                title: errorMessage.title,
                type: 'error'
            });
            Router.replace('/settings/email-address', undefined, {shallow: true});
        }
    }, [dispatch, router.query]);


    useEffect(() => {
        if (success && accountData && accountData.id) {
            let data = (accounts || []).filter((item: Account) => item.id !== accountData.id)
            const accountStateData: InitialAccountStateType = {};
            if (accountData.id === selectedAccount?.id) {
                LocalStorageService.updateAccount('store', data[0]);
                accountStateData.selectedAccount = data[0];
            }
            accountStateData.accounts = data;
            accountService.setAccountState(accountStateData);
        }
        // eslint-disable-next-line
    }, [success, accountData, dispatch])


    useEffect(() => {
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url || '';
        }
    }, [googleAuthRedirectionLink])


    const removeAccount = useCallback(() => {
        if (accountData && accountData.id) {
            dispatch(removeAccountDetails({
                toaster: {
                    success: {
                        desc: 'Account removed successfully',
                        title: 'Account removed',
                        type: 'success'
                    },
                },
                body: {
                    id: accountData.id
                }
            }));
            setAccountData(null)
            onDeleteModalClose()
        }
        // eslint-disable-next-line
    }, [dispatch, accountData])


    function addNewGoogleAccount(mode: string) {
        let body = {
            mode: mode,
            redirectUrl: getRedirectionUrl('/settings/email-address'),
            accountType: "google",
            platform: "web",
            withToken: true
        }
        dispatch(googleAuthLink({
            body: body
        }));
    }


    const openModel = (item: Account) => {
        setAccountData(item);
        onDeleteModalOpen()
    }


    return (
        <>
            <SettingsLayout>
                <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                    <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                        <Heading as='h4' size='lg' gap={1}> Email Address </Heading>
                        <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                            here.</Text>
                    </Flex>

                    <Flex direction={"column"} className={styles.SettingDetails}>
                        <Flex direction={"column"} gap={10} className={styles.settingEmailAddress}>
                            <Flex direction={"column"} gap={2} className={styles.settingSocialLink}>
                                <Button colorScheme='blue'
                                        onClick={() => addNewGoogleAccount('create')}><GoogleIcon/> Add
                                    email
                                    address via Google</Button>
                                {/*<Button colorScheme='blue'><AppleIcon/> Add email address via Apple</Button>*/}
                            </Flex>

                            <Flex direction={"column"} gap={1} className={styles.addedEmailAddress}>
                                <Text fontSize={'13px'} mb={2} color={'#08162F'}>Added Email Addresses:</Text>
                                {accounts && !!accounts.length && (accounts || []).map((item: Account, index: number) => (
                                    <Flex direction={'column'} gap={1} key={index}>
                                        <Flex alignItems={'center'} justify={'space-between'} p={1} gap={2}
                                              width={'100%'} className={styles.settingAddedEmailAddress}>
                                            <Flex alignItems={'center'} gap={3}>
                                                <Flex alignItems={'center'} justify={'center'}
                                                      className={styles.settingAddressSocialIcon}>
                                                    <GoogleIcon/>
                                                </Flex>
                                                <Link fontSize={'13px'} fontWeight={'500'}
                                                      isExternal>{item.email} </Link>
                                            </Flex>
                                            <CloseIcon className={styles.closeIcon} cursor={"pointer"}
                                                       onClick={() => openModel(item)}/>
                                        </Flex>
                                    </Flex>
                                ))}

                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
            </SettingsLayout>
            <RemoveRecordModal onOpen={onDeleteModalOpen} isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}
                               confirmDelete={removeAccount} modelTitle={'Are you sure you want to remove account?'}/>
        </>
    )
}

export default withAuth(EmailAddress)
