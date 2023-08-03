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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton, useDisclosure, Heading, Box, Divider, AbsoluteCenter,
} from "@chakra-ui/react";
import {ChevronDownIcon, SearchIcon} from "@chakra-ui/icons";
import {EnergyIcon, FolderIcon, MailIcon} from "@/icons";
import styles from '@/styles/Home.module.css'
import {useDispatch, useSelector} from "react-redux";
import { googleAuthLink, logoutUser} from "@/redux/auth/action-reducer";
import Router, {useRouter} from "next/router";
import {LoginProps, StateType} from "@/types";
import {useEffect, useState} from "react";
import { getAllOrganizations} from "@/redux/organizations/action-reducer";
import {Organization} from "@/models";
import {setStoreLocal} from "@/utils/localstorage.service";
import {AddOrganization} from "@/components/custom-model/add-organization";
import {getAllAccount} from "@/redux/accounts/action-reducer";

export function Header({type = 'login'}: LoginProps) {
    const dispatch = useDispatch();
    const [workspace, setWorkspace] = useState<Organization>({});
    const {organizations, error} = useSelector((state: StateType) => state.organizations);
    const {accounts} = useSelector((state: StateType) =>  state.accounts);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {user, googleAuthRedirectionLink} = useSelector((state: StateType) => state.auth);

    useEffect(() => {
        getOrganizations();

    }, [])

    const router = useRouter();

    useEffect(() => {
        if (router.query && router.query.access_token) {
            setStoreLocal('poly-user', JSON.stringify({token: router.query.access_token}));
            Router.push('/inbox');
        }
    }, [router.query]);

    useEffect(() => {
        if (googleAuthRedirectionLink) {
            window.location.href = googleAuthRedirectionLink.url;
        }
    }, [googleAuthRedirectionLink])

    useEffect(() => {
        console.log('organizations' , organizations)
        if (organizations && organizations.length > 0) {
            setWorkspace(organizations[0]);
        }
    }, [organizations]);

    const getOrganizations = () => {
        dispatch(getAllOrganizations({organization: null}, null));
    }

    useEffect(() => {
        getAllAccountDetails();

    }, [])

    const getAllAccountDetails = () => {
        dispatch(getAllAccount({accounts: null}, null));
    }

    function logout() {
        dispatch(logoutUser(null));
        Router.push('/auth/login');
    }

    function loginWithGoogle() {
        let body = {
            mode: type === 'login' ? "login" : 'register',
            redirectUrl: `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}/auth/login`,
            accountType: "google",
            platform: "web"
        }
        dispatch(googleAuthLink(body));
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
            <div className={styles.Workspace}>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} className={styles.profileButton}>
                        {workspace?.name || 'Organization'}
                    </MenuButton>
                    <MenuList>
                        <MenuItem w='100%' onClick={onOpen}>Add New</MenuItem>
                        {organizations && organizations?.map((org, i) => (
                            <MenuItem w='100%' key={i + 1}>
                                {org.name}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </div>



            <div className={styles.profile}>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} className={styles.profileButton}>
                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={() => loginWithGoogle()}>Add New Account</MenuItem>
                        {accounts && accounts?.map((acc, i) => (
                            <MenuItem w='100%' key={i + 1}>
                                {acc.email}
                            </MenuItem>
                        ))}
                        <MenuItem onClick={() => logout()}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>

            {isOpen && <AddOrganization onOpen={onOpen} onClose={onClose}/>}
        </Flex>

    )
}
