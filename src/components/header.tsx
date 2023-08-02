import Image from "next/image";
import {
    Badge, Button,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Menu,
    MenuButton, MenuItem,
    MenuList
} from "@chakra-ui/react";
import {ChevronDownIcon, SearchIcon} from "@chakra-ui/icons";
import {MailIcon, FolderIcon, EnergyIcon} from "@/icons";
import styles from '@/styles/Home.module.css'
import {useDispatch, useSelector} from "react-redux";
import {logoutUser} from "@/redux/auth/action-reducer";
import Router from "next/router";
import {StateType} from "@/types";
import {useEffect} from "react";
import {getAllOrganizations} from "@/redux/organizations/action-reducer";

export function Header() {
    const dispatch = useDispatch();

    const {organizations, error} = useSelector((state: StateType) => state.organizations);

    useEffect(() => {
        getOrganizations();
    },[])

    useEffect(() => {
        console.log(organizations)
    }, [organizations]);

    const getOrganizations = () => {
        dispatch(getAllOrganizations({organization: null}, null));
    }
    function logout() {
        dispatch(logoutUser(null));
        Router.push('/auth/login');
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
                        Workspace
                    </MenuButton>
                    <MenuList>
                        <MenuItem>Download</MenuItem>
                        <MenuItem>Create a Copy</MenuItem>
                        <MenuItem>Mark as Draft</MenuItem>
                        <MenuItem>Delete</MenuItem>
                        <MenuItem onClick={() => logout()}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div><div className={styles.profile}>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} className={styles.profileButton}>
                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                    </MenuButton>
                    <MenuList>
                        <MenuItem>Download</MenuItem>
                        <MenuItem>Create a Copy</MenuItem>
                        <MenuItem>Mark as Draft</MenuItem>
                        <MenuItem>Delete</MenuItem>
                        <MenuItem onClick={() => logout()}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>
        </Flex>
    )
}
