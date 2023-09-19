import {Button, Flex, Grid, GridItem, Heading, Link, Text, useDisclosure} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {GoogleIcon} from "@/icons";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Account} from "@/models";
import {googleAuthLink} from "@/redux/auth/action-reducer";
const Index = dynamic(() => import('@/pages/settings/index').then(mod => mod.default));
import withAuth from "@/components/auth/withAuth";
import {CloseIcon} from "@chakra-ui/icons";
import {removeAccountDetails, updateAccountState} from "@/redux/accounts/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";
import RemoveRecordModal from "@/components/common/delete-record-modal";
import Router, {useRouter} from "next/router";
import {Toaster} from "@/components/common";
import dynamic from "next/dynamic";

function EmailAddress() {
    let {accounts, success, selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    const {isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose} = useDisclosure()
    const dispatch = useDispatch();
    const router = useRouter();

    function addNewGoogleAccount(mode: string) {
        let body = {
            mode: mode,
            redirectUrl: `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}/settings/email-address`,
            accountType: "google",
            platform: "web",
            withToken: true
        }
        dispatch(googleAuthLink(body));
    }

    useEffect(() => {
        if (router.query.error) {
            let errorMessage = {
                desc: '',
                title: ''
            }
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
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url || '';
        }
    }, [googleAuthRedirectionLink])
    const [accountData, setAccountData] = useState<Account | null>(null);

    const removeAccount = useCallback(() => {
        if (accountData && accountData.id) {
            dispatch(removeAccountDetails({id: accountData.id}));
            setAccountData(null)
        }
    }, [dispatch])


    const openModel = (item: Account) => {
        setAccountData(item);
        onDeleteModalOpen()
    }

    useEffect(() => {
        if (success && accountData && accountData.id) {
            let data = (accounts || []).filter((item: Account) => item.id !== accountData.id)

            if (accountData.id === selectedAccount?.id) {
                LocalStorageService.updateAccount('store', data[0]);
                dispatch(updateAccountState({selectedAccount: data[0]}));
            }
            dispatch(updateAccountState({accounts: data}));
        }
    }, [success, accountData, dispatch])

    return (
        <div className={styles.setting}>
            <Grid templateColumns='232px auto' gap={6} h={'100%'} minHeight={'calc(100vh - 65px)'}>
                <GridItem w='100%' className={styles.settingSideBar} padding={'40px 30px 40px 40px'}
                          borderRight={'1px solid #E1E3E6'}>
                    <Index/>
                </GridItem>
                <GridItem w='100%'>
                    <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                        <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                            <Heading as='h4' size='lg' gap={1}> Email Address </Heading>
                            <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                                here.</Text>
                        </Flex>

                        <Flex direction={"column"} className={styles.SettingDetails}>
                            <Flex direction={"column"} gap={10} className={styles.settingEmailAddress}>
                                <Flex direction={"column"} gap={2} className={styles.settingSocialLink}>
                                    <Button colorScheme='blue' onClick={() => addNewGoogleAccount('create')}><GoogleIcon/> Add
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
                </GridItem>
            </Grid>

            <RemoveRecordModal onOpen={onDeleteModalOpen} isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} confirmDelete={removeAccount} modelTitle={'Are you sure you want to remove account?'}/>

        </div>
    )
}

export default withAuth(EmailAddress)
