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
    MenuList,
} from "@chakra-ui/react";
import {ChevronDownIcon, SearchIcon, CheckIcon} from "@chakra-ui/icons";
import {EnergyIcon, FolderIcon, MailIcon} from "@/icons";
import styles from '@/styles/Home.module.css'
import {useDispatch, useSelector} from "react-redux";
import {googleAuthLink, logoutUser} from "@/redux/auth/action-reducer";
import Router from "next/router";
import {StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {getAllOrganizations, updateOrganizationState} from "@/redux/organizations/action-reducer";
import {Account, Organization, User} from "@/models";
import {getAllAccount, updateAccountState} from "@/redux/accounts/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";

export function Header() {
    const dispatch = useDispatch();
    // const [workspace, setWorkspace] = useState<Organization>();
    const {
        organizations,
        isLoading: isOrganizationLoading,
        // selectedOrganization
    } = useSelector((state: StateType) => state.organizations);
    const {accounts} = useSelector((state: StateType) => state.accounts);
    const {googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    const [userData, setUserData] = useState<User>();

    const {user} = useSelector((state: StateType) => state.auth);

    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);

    // useEffect(() => {
    //     setWorkspace(selectedOrganization);
    // }, [selectedOrganization])
    //
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

    useEffect(() => {
        if (organizations && organizations.length > 0) {
            if (!LocalStorageService.updateOrg('get')) {
                setOrganization(organizations[0]);
            }
        }
    }, [organizations]);

    useEffect(() => {
        if (accounts && accounts.length > 0) {
            if (!LocalStorageService.updateAccount('get')) {
                setAccounts(accounts[0]);
            }
        }
    }, [accounts]);


    function logout() {
        dispatch(logoutUser());
        Router.push('/auth/login');
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

    function setOrganization(org: Organization) {
        LocalStorageService.updateOrg('store', org);
        dispatch(updateOrganizationState({selectedOrganization: org}))
    }

    function setAccounts(account: Account) {
        LocalStorageService.updateAccount('store', account);
        dispatch(updateAccountState({selectedAccount: account}));
    }

    if (!userData) {
        return <></>;
    }

    return (
        <Flex className={styles.header} w='100%' align={'center'}>
            <div>
                <Image width="30" height="30" src="/image/logo.png" alt=""/>
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
                    <Input type='text' placeholder='Search'/>
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
            {/*            {organizations && organizations?.map((org, i) => (*/}
            {/*                <MenuItem w='100%' key={i + 1} onClick={() => setOrganization(org)}>*/}
            {/*                    {org.name}  <CheckIcon ml={8} bg={"green"} p={1} borderRadius={50} w={4} h={4} color={"white"} />*/}
            {/*                </MenuItem>*/}
            {/*            ))}*/}
            {/*        </MenuList>*/}
            {/*    </Menu>*/}
            {/*</div>*/}


            <div className={styles.profile}>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} className={styles.profileButton}>
                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={() => addNewGoogleAccount()}>Add New Account</MenuItem>
                        {accounts && accounts?.map((acc, i) => (
                            <MenuItem w='100%' key={i + 1} onClick={() => setAccounts(acc)}>
                                {acc.email} <CheckIcon ml={8} bg={"green"} p={1} borderRadius={50} w={4} h={4} color={"white"} />
                            </MenuItem>
                        ))}
                        <MenuItem onClick={() => logout()}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>
        </Flex>

    )
}
