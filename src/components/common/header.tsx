import Image from 'next/image';
import { Button, Flex, Input, InputGroup, InputLeftElement, InputRightElement, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { CheckIcon, ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import { FolderIcon, MailIcon } from '@/icons';
import styles from '@/styles/Home.module.css';
import { useDispatch, useSelector } from 'react-redux';
import Router, { useRouter } from 'next/router';
import { StateType } from '@/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { updateOrganizationState } from '@/redux/organizations/action-reducer';
import { Account, Message, Organization, User } from '@/models';
import { updateAccountState } from '@/redux/accounts/action-reducer';
import LocalStorageService from '@/utils/localstorage.service';
import { getAllThreads, updateThreadState } from '@/redux/threads/action-reducer';
import { updateUsersDetailsSuccess, updateUserState } from '@/redux/users/action-reducer';
import { updateLastMessage } from '@/redux/socket/action-reducer';
import { updateMessageState } from '@/redux/messages/action-reducer';
import { Toaster } from '@/components/common';
import dynamic from 'next/dynamic'
const FeedSidebar = dynamic(
    () => import('./feedSidebar').then((mod) => mod.FeedSidebar)
)
import {getRedirectionUrl} from "@/utils/common.functions";

export function Header() {
    const dispatch = useDispatch();
    const { organizations, isLoading: isOrganizationLoading } = useSelector((state: StateType) => state.organizations);
    const { accounts, selectedAccount } = useSelector((state: StateType) => state.accounts);
    const { threads, tabValue, isThreadSearched } = useSelector((state: StateType) => state.threads);
    const { googleAuthRedirectionLink } = useSelector((state: StateType) => state.auth);
    const { userDetails, profilePicture } = useSelector((state: StateType) => state.users);
    const [userData, setUserData] = useState<User>();
    const { newMessage, sendJsonMessage } = useSelector((state: StateType) => state.socket);
    const [isWindowActive, setWindowActive] = useState<boolean>(true);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);

    const { user } = useSelector((state: StateType) => state.auth);
    const [searchString, setSearchString] = useState<string>('');
    const router = useRouter();

    let currentRoute = router.pathname.split('/');
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    // keyboard shortcuts
    useEffect(() => {
        const handleShortcutKeyPress = (e: KeyboardEvent | any) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current?.focus();
                }
            }
        };
        window.addEventListener('keydown', handleShortcutKeyPress);
        return () => {
            window.removeEventListener('keydown', handleShortcutKeyPress);
        };
    }, []);

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
            dispatch(updateLastMessage(null));
            if (newMessage.name === 'SearchResult' && newMessage?.data) {
                Object.keys(newMessage?.data).map((id: string) => {
                    let newThread = {
                        ...newMessage.data[id],
                        id: newMessage.data[id]._id,
                    };
                    if (newThread.messages && newThread.messages.length > 0) {
                        newThread.messages = newThread.messages.map((t: Message) => ({ ...t, id: t._id }));
                        newThread.messages = newThread.messages.sort((a: Message, b: Message) => new Date(b.created as string).valueOf() - new Date(a.created as string).valueOf());
                    }
                    dispatch(updateThreadState({ threads: [...(threads || []), newThread] }));
                });
            }
            if (newMessage.name === 'authenticate' && newMessage?.data && accounts!.length > 0) {
                let accountForReAuth = accounts!.find(account => account.id === newMessage.data.account)!;
                if (accountForReAuth) {
                    reAuthToast(accountForReAuth.email!);
                }
            }
            if (newMessage.name === 'Activity' && newMessage?.data) {
                console.log("Received activity: ", newMessage)
            }
        }
    }, [accounts, dispatch, newMessage, threads, reAuthToast]);

    useEffect(() => {
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url || '';
        }
    }, [googleAuthRedirectionLink]);

    useEffect(() => {
        let timer1 = setTimeout(() => {
            if (!isOrganizationLoading) {
                if (!organizations) {
                    Router.push('/organization/add');
                    return;
                }
                if (organizations && organizations.length <= 0) {
                    Router.push('/organization/add');
                }
            }
        }, 500);
        return () => {
            clearTimeout(timer1);
        };
    }, [isOrganizationLoading, organizations]);

    const setOrganization = useCallback(
        (org: Organization) => {
            LocalStorageService.updateOrg('store', org);
            dispatch(updateOrganizationState({ selectedOrganization: org }));
        },
        [dispatch],
    );

    const setAccounts = useCallback(
        (account: Account) => {
            LocalStorageService.updateAccount('store', account);
            dispatch(updateAccountState({ selectedAccount: account }));
        },
        [dispatch],
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
            }

            if (!(userDetails && userDetails.id)) {
                dispatch(
                    updateUsersDetailsSuccess({
                        ...(userDetails
                            ? {
                                  ...userDetails,
                                  id: accounts[0].userId,
                              }
                            : userDetails),
                    }),
                );
                dispatch(updateUserState({ userDetailsUpdateSuccess: false }));
            }
        }
    }, [accounts, dispatch, setAccounts]);

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

    useEffect(() => {
        if (!isThreadSearched) {
            setSearchString('');
        }
    }, [isThreadSearched]);

    const closeMenu = useCallback(() => {
        setShowSettingsMenu(false);
    }, []);

    /**
     * Detects if the iframe was clicked
     */
    const onWindowBlur = useCallback(() => {
        const message = document.activeElement;
        setTimeout(() => {
            if (document.activeElement && document?.activeElement.tagName === 'IFRAME' && message) {
                message.textContent = 'clicked ' + Date.now();
                closeMenu();
                setWindowActive(false);
            }
        });
    }, [closeMenu]);

    useEffect(() => {
        window.addEventListener('blur', onWindowBlur);
        return () => {
            window.removeEventListener('blur', onWindowBlur);
        };
    }, [isWindowActive, onWindowBlur]);

    if (!userData) {
        return <></>;
    }

    const handleKeyPress = (event: KeyboardEvent | any) => {
        if (event.key.toLowerCase() === 'enter') {
            dispatch(updateThreadState({ isThreadSearched: false }));
            if (sendJsonMessage) {
                sendJsonMessage({
                    userId: userDetails?.id,
                    name: 'SearchCancel',
                });
            }
            if (searchString) {
                dispatch(updateThreadState({ threads: [], isThreadSearched: true, isLoading: true }));
                if (sendJsonMessage) {
                    sendJsonMessage({
                        userId: userDetails?.id,
                        name: 'SearchRequest',
                        data: {
                            query: searchString,
                        },
                    });
                }
                return;
            }
            if (selectedAccount && selectedAccount.id) {
                dispatch(getAllThreads({ mailbox: tabValue, account: selectedAccount.id }));
            }
        }
    };

    const changePage = (page: string) => {
        dispatch(
            updateThreadState({
                threads: [],
                success: false,
                updateSuccess: false,
                selectedThread: null,
            }),
        );
        dispatch(updateMessageState({ selectedMessage: null }));
        Router.push(`/${page}`);
    };

    return (
        <Flex className={styles.header} w="100%" align={'center'} flex={'none'}>
            <div>
                <Image width="30" height="30" src="/image/logo.png" alt="" className={styles.logo} />
            </div>
            <Flex className={styles.headerTabs} align={'center'}>
                <Flex align={'center'} className={currentRoute[1] === 'inbox' ? styles.tabsActive : ''} onClick={() => changePage('inbox')}>
                    <MailIcon />
                    Inbox
                </Flex>
                <Flex align={'center'} className={currentRoute[1] === 'projects' ? styles.tabsActive : ''} onClick={() => changePage('projects')}>
                    <FolderIcon />
                    Projects
                </Flex>
            </Flex>
            <div className={styles.headerSearch}>
                <InputGroup className={styles.inputGroup}>
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon />
                    </InputLeftElement>
                    <Input
                        type="text"
                        placeholder="Search"
                        onChange={event => {
                            setSearchString(event.target.value);
                        }}
                        ref={searchInputRef}
                        value={searchString}
                        onKeyPress={e => handleKeyPress(e)}
                    />
                    <InputRightElement>
                        <div className={styles.inputRight}>⌘K</div>
                    </InputRightElement>
                </InputGroup>
            </div>

            <div>
                <FeedSidebar />
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

            {/*<Button className={styles.composeButton} color={'#000000'} leftIcon={<ComposeIcon/>} colorScheme='blue'*/}
            {/*        variant='outline'*/}
            {/*        onClick={() => openComposeBox()}>*/}
            {/*    Compose*/}
            {/*</Button>*/}

            <div className={styles.profile}>
                <Menu isOpen={showSettingsMenu} onOpen={() => setShowSettingsMenu(true)} onClose={() => setShowSettingsMenu(false)}>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} className={styles.profileButton}>
                        <div className={styles.profileImage}>
                            {profilePicture && profilePicture.url && <Image src={profilePicture && profilePicture.url} width="36" height="36" alt="" />}
                        </div>
                    </MenuButton>
                    <MenuList className={'drop-down-list'}>
                        {accounts &&
                            !!accounts.length &&
                            accounts?.map((acc, i) => (
                                <MenuItem justifyContent={'space-between'} gap={1} w="100%" key={i + 1} onClick={() => setAccounts(acc)}>
                                    {acc.email} {selectedAccount?.email === acc.email && <CheckIcon ml={8} bg={'green'} p={1} borderRadius={50} w={4} h={4} color={'white'} />}
                                </MenuItem>
                            ))}
                        <MenuItem onClick={() => openSetting()}>Settings</MenuItem>
                        <MenuItem onClick={() => logout()}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>
        </Flex>
    );
}
