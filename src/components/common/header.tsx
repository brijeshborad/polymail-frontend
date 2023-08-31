import Image from "next/image";
import {
    Badge,
    Box,
    Button,
    createStandaloneToast,
    Divider,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
} from "@chakra-ui/react";
import {CheckIcon, ChevronDownIcon, SearchIcon} from "@chakra-ui/icons";
import {EnergyIcon, FolderIcon, MailIcon} from "@/icons";
import styles from '@/styles/Home.module.css'
import {useDispatch, useSelector} from "react-redux";
import Router, {useRouter} from "next/router";
import {StateType} from "@/types";
import React, {useCallback, useEffect, useState} from "react";
import {getAllOrganizations, updateOrganizationState} from "@/redux/organizations/action-reducer";
import {Account, Organization, User} from "@/models";
import {getAllAccount, updateAccountState} from "@/redux/accounts/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";
import {getAllThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {useSocket} from "@/hooks/use-socket.hook";
import {getProfilePicture, updateUsersDetailsSuccess} from "@/redux/users/action-reducer";
import {googleAuthLink} from "@/redux/auth/action-reducer";
import {updateLastMessage} from "@/redux/socket/action-reducer";

let iSNewSearch = true;

export function Header() {
    const dispatch = useDispatch();
    const {
        organizations,
        isLoading: isOrganizationLoading
    } = useSelector((state: StateType) => state.organizations);
    const {accounts, selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {threads} = useSelector((state: StateType) => state.threads);
    const {googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);
    const {userDetails, profilePicture} = useSelector((state: StateType) => state.users);
    const [userData, setUserData] = useState<User>();
    const {newMessage} = useSelector((state: StateType) => state.socket);

    const {user} = useSelector((state: StateType) => state.auth);
    const [searchString, setSearchString] = useState<string>('');
    const {sendMessage} = useSocket();
    const router = useRouter()

    let currentRoute = router.pathname.split('/');
    const {toast} = createStandaloneToast();

    const connectGoogleAccount = useCallback(() => {
        let body = {
            mode: 'create',
            redirectUrl: `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}/inbox`,
            accountType: "google",
            platform: "web",
            withToken: true
        }
        dispatch(googleAuthLink(body));
    }, [dispatch])

    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);

    useEffect(() => {
        if (newMessage) {
            dispatch(updateLastMessage(null));
            if (newMessage.name === 'SearchResult' && newMessage?.data) {
                Object.keys(newMessage?.data).map((id: string) => {
                    if (iSNewSearch) {
                        iSNewSearch = false;
                        dispatch(updateThreadState({threads: [newMessage.data[id]]}));
                    } else {
                        dispatch(updateThreadState({threads: [...[threads || []], newMessage.data[id]]}));
                    }
                })
            }
            if (newMessage.name === 'authenticate' && newMessage?.data && accounts!.length > 0) {
                if (toast.isActive('re-auth-account')) {
                    return;
                }
                let accountForReAuth = accounts!.find(account => account.id === newMessage.data.account)!;
                if (accountForReAuth) {
                    toast({
                        id: 're-auth-account',
                        isClosable: true,
                        duration: null,
                        render: () => (
                            <Box display={'flex'} alignItems={'center'} color='white' p={3} bg='#000'
                                 borderRadius={'10px'} fontSize={'14px'} padding={'13px 25px'}>
                                <div>
                                    Seems like your session has been expired for <Text as={"span"}
                                                                                       color={"blue.400"}>{accountForReAuth.email}</Text>!
                                </div>
                                <Button onClick={() => connectGoogleAccount()} ml={1} mr={2} variant="link"
                                        color={"blue.300"} padding={'7px 15px'}>Re-Authenticate</Button>

                                <Divider height={"20px"} orientation='vertical'/>

                                <Button onClick={() => toast.close('re-auth-account')} ml={2} variant="link"
                                        color={"blue.100"} size={"sm"} padding={'7px 5px'}>Close</Button>
                            </Box>
                        ),
                        position: 'top-right'
                    } as any);
                }
            }
        }
    }, [accounts, connectGoogleAccount, dispatch, newMessage, threads, toast])

    useEffect(() => {
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url || '';
        }
    }, [googleAuthRedirectionLink])

    const getAllAccountAndOrganizationsDetails = useCallback(() => {
        dispatch(getAllAccount());
        dispatch(getAllOrganizations());
        dispatch(getProfilePicture({}));
    }, [dispatch])

    useEffect(() => {
        getAllAccountAndOrganizationsDetails();
    }, [getAllAccountAndOrganizationsDetails])

    useEffect(() => {
        let timer1 = setTimeout(() => {
            if (!isOrganizationLoading) {
                if (!organizations) {
                    Router.push('/organization/add')
                    return;
                }
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

            if (!(userDetails && userDetails.id)) {
                dispatch(updateUsersDetailsSuccess({
                    ...(userDetails ? {
                        ...userDetails,
                        id: accounts[0].userId
                    } : userDetails)
                }));
            }
        }
    }, [accounts, dispatch, setAccounts, userDetails]);


    function logout() {
        Router.push(`/auth/logout`);
    }

    function openSetting() {
        Router.push('/settings/profile');
    }

    if (!userData) {
        return <></>;
    }

    const handleKeyPress = (event: KeyboardEvent | any) => {
        if (event.key.toLowerCase() === 'enter') {
            if (searchString) {
                sendMessage(JSON.stringify({
                    "userId": userDetails?.id,
                    "name": "SearchRequest",
                    "data": {
                        // [searchString]: `label:inbox`
                        "query": searchString
                    }
                }))
            } else {
                if (selectedAccount && selectedAccount.id) {
                    dispatch(getAllThreads({mailbox: 'INBOX', account: selectedAccount.id, enriched: true}));
                }
            }
        }
    }

    const inboxClick = () => {
        dispatch(updateThreadState({success: false}));
        Router.push('/inbox')
    }

    return (
        <Flex className={styles.header} w='100%' align={'center'} flex={'none'}>
            <div>
                <Image width="30" height="30" src="/image/logo.png" alt="" className={styles.logo}/>
            </div>
            <Flex className={styles.headerTabs} align={'center'}>
                <Flex align={'center'} className={currentRoute[1] === 'inbox' ? styles.tabsActive : ''}
                      onClick={() => inboxClick()}>
                    <MailIcon/>
                    Inbox
                </Flex>
                <Flex align={'center'} className={currentRoute[1] === 'projects' ? styles.tabsActive : ''}
                      onClick={() => Router.push('/projects')}>
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
                           onChange={event => {
                               if (!iSNewSearch) {
                                   iSNewSearch = true;
                                   sendMessage(JSON.stringify({
                                       "userId": userDetails?.id,
                                       "name": "SearchCancel",
                                   }))
                               }
                               setSearchString(event.target.value)
                           }}
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

            {/*<Button className={styles.composeButton} color={'#000000'} leftIcon={<ComposeIcon/>} colorScheme='blue'*/}
            {/*        variant='outline'*/}
            {/*        onClick={() => openComposeBox()}>*/}
            {/*    Compose*/}
            {/*</Button>*/}


            <div className={styles.profile}>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} className={styles.profileButton}>
                        <div className={styles.profileImage}>
                            {profilePicture && profilePicture.url &&
                            <Image src={profilePicture && profilePicture.url} width="36" height="36" alt=""/>}
                        </div>

                    </MenuButton>
                    <MenuList className={'drop-down-list'}>
                        {selectedAccount && <MenuItem justifyContent={'space-between'} gap={1} w='100%'>
                            {selectedAccount?.email}
                            <CheckIcon ml={8} bg={"green"} p={1} borderRadius={50} w={4} h={4} color={"white"}/>
                        </MenuItem>}
                        <MenuItem onClick={() => openSetting()}>Settings</MenuItem>
                        <MenuItem onClick={() => logout()}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>
        </Flex>

    )
}
