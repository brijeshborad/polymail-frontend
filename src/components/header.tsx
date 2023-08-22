import Image from "next/image";
import {
    Badge,
    Button,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Menu,
    MenuButton,
    MenuItem,
    MenuList, Tooltip,
} from "@chakra-ui/react";
import {ChevronDownIcon, SearchIcon, CheckIcon, RepeatIcon} from "@chakra-ui/icons";
import {EnergyIcon, FolderIcon, MailIcon} from "@/icons";
import styles from '@/styles/Home.module.css'
import {useDispatch, useSelector} from "react-redux";
import {googleAuthLink} from "@/redux/auth/action-reducer";
import Router from "next/router";
import {StateType} from "@/types";
import React, {ChangeEvent, useCallback, useEffect, useState} from "react";
import {getAllOrganizations, updateOrganizationState} from "@/redux/organizations/action-reducer";
import {Account, Organization, User} from "@/models";
import {getAllAccount, getSyncAccount, updateAccountState} from "@/redux/accounts/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";
import {ComposeIcon} from "@/icons/compose.icon";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {Toaster} from "@/components/toaster";
import {getAllThreads, searchThreads, updateThreadState} from "@/redux/threads/action-reducer";

export function Header() {
    const dispatch = useDispatch();
    // const [workspace, setWorkspace] = useState<Organization>();
    const {
        organizations,
        isLoading: isOrganizationLoading,
        // selectedOrganization
    } = useSelector((state: StateType) => state.organizations);
    const {accounts , selectedAccount, success: syncSuccess} = useSelector((state: StateType) => state.accounts);
    const {threads} = useSelector((state: StateType) => state.threads);
    const {googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    const [userData, setUserData] = useState<User>();
    const {newMessage} = useSelector((state: StateType) => state.socket);

    const {user} = useSelector((state: StateType) => state.auth);
    const [searchString, setSearchString] = useState<string>('');

    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);

    useEffect(() => {
        if (newMessage && newMessage.name === 'SearchResult') {
            if (newMessage?.data) {
                Object.keys(newMessage?.data).map((id: string) => {
                    dispatch(updateThreadState({threads: [newMessage.data[id]]}));
                })
            }
        }
    }, [newMessage, threads])

    useEffect(() => {
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url || '';
        }
    }, [googleAuthRedirectionLink])

    const getAllAccountAndOrganizationsDetails = useCallback(() => {
        dispatch(getAllAccount());
        dispatch(getAllOrganizations());
    }, [dispatch])

    useEffect(() => {
        getAllAccountAndOrganizationsDetails();
    }, [getAllAccountAndOrganizationsDetails])

    useEffect(() => {
        if (syncSuccess) {
            let data = {
                desc: 'Syncing mails started!',
                type: 'success'
            }
            Toaster(data);
        }
    }, [syncSuccess])

    useEffect(() => {
        let timer1 = setTimeout(() => {
            if (!isOrganizationLoading) {
                if (organizations && organizations.length <= 0) {
                    Router.push('/organization/add')
                }
            }
        }, 500)
        return () => {
            clearTimeout(timer1)
        }
    }, [isOrganizationLoading, organizations])

    const setOrganization = useCallback((org: Organization) => {
        LocalStorageService.updateOrg('store', org);
        dispatch(updateOrganizationState({selectedOrganization: org}))
    }, [dispatch])

    const setAccounts = useCallback((account: Account) => {
        LocalStorageService.updateAccount('store', account);
        dispatch(updateAccountState({selectedAccount: account}));
    }, [dispatch])

    useEffect(() => {
        if (organizations && organizations.length > 0) {
            if (!LocalStorageService.updateOrg('get')) {
                setOrganization(organizations[0]);
            }
        }
    }, [organizations, setOrganization]);

    useEffect(() => {
        if (accounts && accounts.length > 0) {
            if (!LocalStorageService.updateAccount('get')) {
                setAccounts(accounts[0]);
            }
        }
    }, [accounts, setAccounts]);


    function logout() {
        Router.push(`/auth/logout`);
    }

    function addNewGoogleAccount() {
        let body = {
            mode: 'create',
            redirectUrl: `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}/inbox`,
            accountType: "google",
            platform: "web",
            withToken: true
        }
        dispatch(googleAuthLink(body));
    }

    if (!userData) {
        return <></>;
    }
    const callSyncAPI = () => {
        if (selectedAccount && selectedAccount.id) {
            dispatch(getSyncAccount({id: selectedAccount.id}));
        }
    }

    const openComposeBox = () => {
        dispatch(updateMessageState({isCompose: true}))
    }

    // const searchThreadsData = (event: ChangeEvent | any) => {
    //     if (searchString && searchString.length >= 4) {
    //         let searchString = `label:${event.target.value}`
    //         dispatch(searchThreads({query: searchString}));
    //     } else {
    //         if (selectedAccount && selectedAccount.id) {
    //             dispatch(getAllThreads({mailbox: 'INBOX', account: selectedAccount.id, enriched: true}));
    //         }
    //     }
    // }

    const handleKeyPress = (event) => {
        if (event.key.toLowerCase() === 'enter') {
            if (searchString) {
                let searchString = `label:${event.target.value}`
                dispatch(searchThreads({query: searchString}));
            } else {
                if (selectedAccount && selectedAccount.id) {
                    dispatch(getAllThreads({mailbox: 'INBOX', account: selectedAccount.id, enriched: true}));
                }
            }
        }
    }

    return (
        <Flex className={styles.header} w='100%' align={'center'}>
            <div className={styles.logoContainer}>
                <Image width="30" height="30" src="/image/logo.png" alt="" className={styles.logo}
                       onClick={() => callSyncAPI()}/>
                <Tooltip label='Sync Mails' placement='bottom' bg='gray.300' color='black'>
                    <RepeatIcon className={styles.refreshIcon} onClick={() => callSyncAPI()}/>
                </Tooltip>
            </div>
            <Flex className={styles.headerTabs} align={'center'}>
                <Flex align={'center'} className={styles.tabsActive}>
                    <MailIcon/>
                    Inbox
                </Flex>
                <Flex align={'center'}>
                    <FolderIcon/>
                    Projects
                </Flex>
            </Flex>
            <div className={styles.headerSearch}>
                <InputGroup className={styles.inputGroup}>
                    <InputLeftElement pointerEvents='none'>
                        <SearchIcon/>
                    </InputLeftElement>
                    <Input type='text'
                           placeholder='Search'
                           // onChange={(e) => searchThreadsData(e)}
                        onChange={event => {setSearchString(event.target.value)}}
                           onKeyPress={(e) => handleKeyPress(e)}
                    />
                    <InputRightElement>
                        <div className={styles.inputRight}>
                            ⌘K
                        </div>
                    </InputRightElement>
                </InputGroup>
            </div>

            <div>
                <Flex align={'center'} justify={'center'} className={styles.notificationIcon}>
                    <EnergyIcon/>
                    <Badge>3</Badge>
                </Flex>
            </div>
            {/*<div className={styles.Workspace}>*/}
            {/*    <Menu>*/}
            {/*        <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} className={styles.profileButton}>*/}
            {/*            {workspace && workspace.name || 'Organization'}*/}
            {/*        </MenuButton>*/}
            {/*        <MenuList>*/}
            {/*            <MenuItem w='100%' onClick={() => Router.push('/organization/add')}>Add New</MenuItem>*/}
            {/*            {organizations && organizations.length && organizations?.map((org, i) => (*/}
            {/*                <MenuItem w='100%' key={i + 1} onClick={() => setOrganization(org)}>*/}
            {/*                    {org.name}  <CheckIcon ml={8} bg={"green"} p={1} borderRadius={50} w={4} h={4} color={"white"} />*/}
            {/*                </MenuItem>*/}
            {/*            ))}*/}
            {/*        </MenuList>*/}
            {/*    </Menu>*/}
            {/*</div>*/}

            <Button className={styles.composeButton} leftIcon={<ComposeIcon/>} colorScheme='blue' variant='outline'
                    onClick={() => openComposeBox()}>
                Compose
            </Button>


            <div className={styles.profile}>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} className={styles.profileButton}>
                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={() => addNewGoogleAccount()}>Add New Account</MenuItem>
                        {accounts && !!accounts.length && accounts?.map((acc, i) => (
                            <MenuItem w='100%' key={i + 1} onClick={() => setAccounts(acc)}>
                                {acc.email} {selectedAccount?.email === acc.email && (
                                <CheckIcon ml={8} bg={"green"} p={1} borderRadius={50} w={4} h={4} color={"white"}/>
                            )}
                            </MenuItem>
                        ))}
                        <MenuItem>Settings</MenuItem>
                        <MenuItem onClick={() => logout()}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>
        </Flex>

    )
}
