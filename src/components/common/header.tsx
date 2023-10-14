import Image from 'next/image';
import {
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuItem,
    MenuList
} from '@chakra-ui/react';
import {CheckIcon, ChevronDownIcon} from '@chakra-ui/icons';
import {FolderIcon, MailIcon} from '@/icons';
import styles from '@/styles/Home.module.css';
import {useSelector} from 'react-redux';
import Router, {useRouter} from 'next/router';
import {StateType} from '@/types';
import React, {useCallback, useEffect, useState} from 'react';
import {Account, Message, Organization, User} from '@/models';
import LocalStorageService from '@/utils/localstorage.service';
import {Toaster} from '@/components/common';
import dynamic from 'next/dynamic'
import {HeaderSearch} from "@/components/common/header-search";
import {
    accountService, commonService,
    messageService,
    organizationService, projectService,
    socketService,
    threadService,
    userService
} from "@/services";

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
    const {threads} = useSelector((state: StateType) => state.threads);
    const {googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    const {userDetails, profilePicture} = useSelector((state: StateType) => state.users);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const [userData, setUserData] = useState<User>();
    const {newMessage} = useSelector((state: StateType) => state.socket);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);

    const {user} = useSelector((state: StateType) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);

    const reAuthToast = useCallback(
        (email: string) => {
            Toaster({
                title: 'Please reauthenticate your account.',
                desc: `Your session has expired for ${email}.`,
                type: 'reauth',
            });

            Router.push('/settings/email-address');
        },
        [],
    );

    useEffect(() => {
        if (newMessage) {
            socketService.updateSocketMessage(null);
            if (newMessage.name === 'SearchResult' && newMessage?.data) {
                Object.keys(newMessage?.data).map((id: string) => {
                    let newThread = {
                        ...newMessage.data[id],
                        id: newMessage.data[id]._id,
                    };
                    if (newThread.messages && newThread.messages.length > 0) {
                        newThread.messages = newThread.messages.map((t: Message) => ({...t, id: t._id}));
                        newThread.messages = newThread.messages.sort((a: Message, b: Message) => new Date(b.created as string).valueOf() - new Date(a.created as string).valueOf());
                    }
                    threadService.setThreadState({threads: [...(threads || []), newThread]})
                });
            }
            if (newMessage.name === 'authenticate' && newMessage?.data && accounts!.length > 0) {
                let accountForReAuth = accounts!.find(account => account.id === newMessage.data.account)!;
                if (accountForReAuth) {
                    reAuthToast(accountForReAuth.email!);
                }
            }
        }
    }, [accounts, newMessage, threads, reAuthToast]);

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

    const updateValuesFromAccount = useCallback((account: Account) => {
        let projects = account.projects || [];
        let organizations = (account.organizations || []).sort((a: Organization, b: Organization) => (new Date(b.created as string).valueOf() - new Date(a.created as string).valueOf()));
        let contacts = account.contacts || [];
        projectService.setProjectState({projects, isLoading: false});
        organizationService.setOrganizationState({organizations, isLoading: false});
        commonService.setCommonState({contacts, isLoading: false});
        accountService.setAccountState({success: true});
        if (!organizations) {
            Router.push('/organization/add');
            return;
        }
        if (organizations && organizations.length <= 0) {
            Router.push('/organization/add');
        }
    }, [])

    const setAccounts = useCallback(
        (account: Account) => {
            if (account.syncHistory?.mailInitSynced) {
                LocalStorageService.updateAccount('store', account);
                accountService.setAccountState({success: true});
                updateValuesFromAccount(account);
            }
            accountService.setSelectedAccount(account);
        },
        [updateValuesFromAccount],
    );

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
                updateValuesFromAccount(LocalStorageService.updateAccount('get'));
            }
        }
    }, [accounts, setAccounts, updateValuesFromAccount]);

    useEffect(() => {
        if (selectedAccount && !userDetails?.id) {
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
    }, [selectedAccount, userDetails])

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
            <Flex padding={'12px 0'} align={'center'}>
                <div>
                    <Image width="30" height="30" src="/image/logo.png" alt="" className={styles.logo}/>
                </div>
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
