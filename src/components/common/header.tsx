import Image from 'next/image';
import {
    Button,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Menu,
    MenuButton,
    MenuItem,
    MenuList
} from '@chakra-ui/react';
import {CheckIcon, ChevronDownIcon, SearchIcon, CloseIcon} from '@chakra-ui/icons';
import {FolderIcon, MailIcon} from '@/icons';
import styles from '@/styles/Home.module.css';
import {useDispatch, useSelector} from 'react-redux';
import Router, {useRouter} from 'next/router';
import {StateType} from '@/types';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {updateOrganizationState} from '@/redux/organizations/action-reducer';
import {Account, Message, Organization, User} from '@/models';
import {updateAccountState} from '@/redux/accounts/action-reducer';
import LocalStorageService from '@/utils/localstorage.service';
import {getAllThreads, updateThreadState} from '@/redux/threads/action-reducer';
import {updateUserState} from '@/redux/users/action-reducer';
import {updateLastMessage} from '@/redux/socket/action-reducer';
import {updateMessageState} from '@/redux/messages/action-reducer';
import {Toaster} from '@/components/common';
import dynamic from 'next/dynamic'

const FeedSidebar = dynamic(
    () => import('./feedSidebar').then((mod) => mod.FeedSidebar)
)
const CreateNewProjectModal = dynamic(
    () => import('@/components/project/create-new-project').then((mod) => mod.default)
)

export function Header() {
    const dispatch = useDispatch();
    const {organizations} = useSelector((state: StateType) => state.organizations);
    const {isLoading: isApiLoading} = useSelector((state: StateType) => state.commonApis);
    const {accounts, selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {threads, tabValue, isThreadSearched} = useSelector((state: StateType) => state.threads);
    const {googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    const {userDetails, profilePicture} = useSelector((state: StateType) => state.users);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const [userData, setUserData] = useState<User>();
    const {newMessage, sendJsonMessage} = useSelector((state: StateType) => state.socket);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);

    const {user} = useSelector((state: StateType) => state.auth);
    const [searchString, setSearchString] = useState<string>('');
    const router = useRouter();
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const [showCloseIcon, setShowCloseIcon] = useState(false);

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
                        newThread.messages = newThread.messages.map((t: Message) => ({...t, id: t._id}));
                        newThread.messages = newThread.messages.sort((a: Message, b: Message) => new Date(b.created as string).valueOf() - new Date(a.created as string).valueOf());
                    }
                    dispatch(updateThreadState({threads: [...(threads || []), newThread]}));
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
            if (!isApiLoading) {
                if (!organizations) {
                    Router.push('/organization/add');
                    return;
                }
                if (organizations && organizations.length <= 0) {
                    Router.push('/organization/add');
                }
            }
        }, 2000);
        return () => {
            clearTimeout(timer1);
        };
    }, [isApiLoading, organizations]);

    const setOrganization = useCallback(
        (org: Organization) => {
            LocalStorageService.updateOrg('store', org);
            dispatch(updateOrganizationState({selectedOrganization: org}));
        },
        [dispatch],
    );

    const setAccounts = useCallback(
        (account: Account) => {
            if (account.syncHistory?.mailInitSynced) {
                LocalStorageService.updateAccount('store', account);
            }
            dispatch(updateAccountState({selectedAccount: account}));
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
        }
    }, [accounts, dispatch, setAccounts]);

    useEffect(() => {
        if (selectedAccount && !userDetails?.id) {
            dispatch(
                updateUserState({
                    userDetailsUpdateSuccess: false,
                    ...(userDetails ? {
                            userDetails: {
                                ...userDetails,
                                id: selectedAccount.userId,
                            }
                        }
                        : {userDetails})
                })
            );

        }
    }, [dispatch, selectedAccount, userDetails])

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
        if (!isThreadSearched) {
            setSearchString('');
        }
    }, [isThreadSearched]);


    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            closeMenu();
        }
    }, [incomingEvent, closeMenu]);

    if (!userData) {
        return <></>;
    }

    const searchCancel = (callAPI: boolean = false) => {
        if (sendJsonMessage) {
            sendJsonMessage({
                "userId": userDetails?.id,
                "name": "SearchCancel",
            });
        }
        if (selectedAccount && selectedAccount.id && callAPI) {
            if (searchString) {
                dispatch(updateThreadState({threads: [], isLoading: true, selectedThread: null, isThreadSearched: false, multiSelection: []}));
            }
            setSearchString('');
            dispatch(getAllThreads({mailbox: tabValue, account: selectedAccount.id}));
        }
    }

    const handleKeyPress = (event: KeyboardEvent | any) => {
        if (event.key.toLowerCase() === 'enter') {
            searchCancel(false);
            if (searchString) {
                dispatch(updateThreadState({threads: [], isThreadSearched: true, isLoading: true, selectedThread: null, multiSelection: []}));
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
        }
    };

    const changePage = (page: string) => {
        if (router.pathname.replace('/', '') !== page) {
            dispatch(
                updateThreadState({
                    threads: [],
                    success: false,
                    updateSuccess: false,
                    selectedThread: null,
                    tabValue: ''
                }),
            );
            dispatch(updateMessageState({selectedMessage: null, messages: []}));
            Router.push(`/${page}`);
        }
    };

    const handleFocus = () => {
        setShowCloseIcon(true);
    }

    const handleBlur = () => {
        // setTimeout(() => {
        //     setShowCloseIcon(false);
        // }, 300)
    };

    return (
        <Flex className={styles.header} w="100%" align={'center'} flex={'none'}>
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
            <div className={styles.headerSearch}>
                <InputGroup className={styles.inputGroup}>
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon/>
                    </InputLeftElement>
                    <Input
                        type="text"
                        placeholder="Search"
                        onChange={event => {
                            setSearchString(event.target.value);
                        }}
                        onFocus={() => handleFocus()}
                        onBlur={() => handleBlur()}
                        ref={searchInputRef}
                        value={searchString}
                        onKeyPress={e => handleKeyPress(e)}
                    />
                    <InputRightElement>
                        {showCloseIcon ? <div className={styles.inputRight} style={{background: "transparent"}}
                                              onClick={() => searchCancel(true)}>
                            <CloseIcon cursor={'pointer'} fontSize={'10'}/>
                        </div> : <div className={styles.inputRight}>⌘K</div>
                        }
                    </InputRightElement>
                </InputGroup>
            </div>

            <div>
                <FeedSidebar/>
            </div>

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
            <CreateNewProjectModal/>
        </Flex>
    );
}
