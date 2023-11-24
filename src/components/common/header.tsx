import Image from 'next/image';
import {
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuItem,
    MenuList
} from '@chakra-ui/react';
import {CheckIcon, ChevronDownIcon, HamburgerIcon} from '@chakra-ui/icons';
import {FolderIcon, MailIcon} from '@/icons';
import styles from '@/styles/Home.module.css';
import {useSelector} from 'react-redux';
import Router, {useRouter} from 'next/router';
import {StateType} from '@/types';
import React, {useCallback, useEffect, useState} from 'react';
import {Account, Organization, User} from '@/models';
import LocalStorageService from '@/utils/localstorage.service';
import dynamic from 'next/dynamic'
import {HeaderSearch} from "@/components/common/header-search";
import {
    accountService, commonService,
    messageService,
    organizationService, projectService,
    threadService,
    userService
} from "@/services";
import {Toaster} from "@/components/common/toaster";

const FeedSidebar = dynamic(
    () => import('./feedSidebar').then((mod) => mod.FeedSidebar)
)
const CreateNewProjectModal = dynamic(
    () => import('@/components/project/create-new-project').then((mod) => mod.default)
)
const EditProjectModal = dynamic(
    () => import('@/components/project/edit-project').then((mod) => mod.default)
)

export function Header() {
    const {organizations} = useSelector((state: StateType) => state.organizations);
    const {accounts, selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    const {userDetails, profilePicture} = useSelector((state: StateType) => state.users);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const [userData, setUserData] = useState<User>();
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);

    const {user} = useSelector((state: StateType) => state.auth);
    const router = useRouter();

    const reAuthToast = useCallback(
        (email: string) => {
            Toaster({
                id: 'REAUTH',
                title: 'Please reauthenticate your account.',
                desc: `Your session has expired for ${email}.`,
                type: 'reauth',
                onClick: () => {
                    Router.push('/settings/email-address');
                }
            });

            Router.push('/settings/email-address');
        },
        [],
    );

    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);

    useEffect(() => {
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url || '';
        }
    }, [googleAuthRedirectionLink]);

    const setOrganization = useCallback(
        (org: Organization) => {
            LocalStorageService.updateOrg('store', org);
            organizationService.setSelectedOrganization(org);
        },
        [],
    );

    const setAccounts = useCallback(
        (account: Account) => {
            if (account.syncHistory?.mailInitSynced) {
                commonService.updateEmailSyncPercentage(null);
                accountService.updateValuesFromAccount(account, !LocalStorageService.updateAccount('get'));
                LocalStorageService.updateAccount('store', account);
            } else {
                commonService.updateEmailSyncPercentage(1);
            }
            accountService.setSelectedAccount(account);
        }, []);

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
            } else {
                let findTheUpdatedAccount = LocalStorageService.updateAccount('get')
                if (findTheUpdatedAccount) {
                    findTheUpdatedAccount = accounts.find(item => item.id === findTheUpdatedAccount.id);
                    if (findTheUpdatedAccount) {
                        accountService.updateValuesFromAccount(findTheUpdatedAccount, false);
                        setAccounts(findTheUpdatedAccount);
                    }
                }
            }
        }
    }, [accounts, setAccounts]);

    useEffect(() => {
        if (selectedAccount) {
            if (selectedAccount.status !== 'Active') {
                reAuthToast(selectedAccount.email!);
            }
            if (!userDetails?.id) {
                userService.setUserState({
                    userDetailsUpdateSuccess: false,
                    ...(userDetails ? {
                            userDetails: {
                                ...userDetails,
                                id: selectedAccount.userId,
                            }
                        }
                        : {userDetails})
                })
            }
        }
    }, [selectedAccount, userDetails, reAuthToast])

    function logout() {
        Router.push(`/auth/logout`);
    }

    function openSetting() {
        Router.push('/settings/profile');
    }

    useEffect(() => {
        if (selectedAccount && selectedAccount.id && selectedAccount.status && selectedAccount.status.toLowerCase() === 'invalid') {
            reAuthToast(selectedAccount.email!);
        }
    }, [reAuthToast, selectedAccount]);

    const closeMenu = useCallback(() => {
        setShowSettingsMenu(false);
    }, []);


    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            closeMenu();
        }
    }, [incomingEvent, closeMenu]);

    if (!userData) {
        return <></>;
    }

    const changePage = (page: string) => {
        if (router.pathname.replace('/', '') !== page) {
            threadService.pageChange();
            projectService.pageChange();
            messageService.pageChange();
            Router.push(`/${page}`);
        }
    };

    return (
        <Flex className={styles.header} w="100%" align={'center'} flex={'none'} padding={'0 40px'}>
            <Flex padding={'12px 0'} align={'center'} className={styles.headerLogo}>
                <Flex className={styles.logo} marginBottom={'-5px'} cursor={'pointer'}
                      onClick={() => changePage('inbox')}>
                    {/*<OnboardingLogoIcon/>*/}
                    <Image priority src="/image/icon/logo.png" alt="emoji" width={26} height={30}/>
                </Flex>
                <Flex className={styles.headerTabs} align={'center'}>
                    <Flex align={'center'} className={router.pathname === '/inbox' ? styles.tabsActive : ''}
                          onClick={() => changePage('inbox')}>
                        <MailIcon/>
                        Inbox
                    </Flex>
                    <Flex align={'center'} className={router.pathname === '/projects' ? styles.tabsActive : ''}
                          onClick={() => changePage('projects')}>
                        <FolderIcon/>
                        Projects
                    </Flex>
                </Flex>

                <Menu>
                    <MenuButton className={'header-menu-button'} backgroundColor={"#FFFFFF"}
                                border={'1px solid rgba(0,0,0, 0.1)'} minWidth={'1px'} padding={'5px'}
                                height={'fit-content'} marginLeft={3} as={Button} rightIcon={<HamburgerIcon/>}/>
                    <MenuList className={'drop-down-list header-dropdown-list'}>
                        <MenuItem className={router.pathname === '/inbox' ? 'tab-active' : ''}
                                  onClick={() => changePage('inbox')}>
                            <MailIcon/> Inbox
                        </MenuItem>
                        <MenuItem className={router.pathname === '/projects' ? 'tab-active' : ''}
                                  onClick={() => changePage('projects')}>
                            <FolderIcon/> Projects
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Flex>

            <HeaderSearch/>
            <Flex padding={'0px 0'} align={'center'}>
                <FeedSidebar/>
                <div className={styles.profile}>
                    <Menu isOpen={showSettingsMenu} onOpen={() => setShowSettingsMenu(true)}
                          onClose={() => setShowSettingsMenu(false)}>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} className={styles.profileButton}>
                            <div className={styles.profileImage}>
                                {profilePicture && profilePicture.url &&
                                <Image src={profilePicture && profilePicture.url} width="36" height="36" alt=""/>}
                            </div>
                        </MenuButton>
                        <MenuList className={'drop-down-list'}>
                            {accounts &&
                            !!accounts.length &&
                            accounts?.map((acc, i) => (
                                <MenuItem justifyContent={'space-between'} gap={1} w="100%" key={i + 1}
                                          onClick={() => setAccounts(acc)}>
                                    {acc.email} {selectedAccount?.email === acc.email &&
                                <CheckIcon ml={8} bg={'green'} p={1} borderRadius={50} w={4} h={4} color={'white'}/>}
                                </MenuItem>
                            ))}
                            <MenuItem onClick={() => openSetting()}>Settings</MenuItem>
                            <MenuItem onClick={() => logout()}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Flex>
            <CreateNewProjectModal/>
            <EditProjectModal/>
        </Flex>
    );
}
