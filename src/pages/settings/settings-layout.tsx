import React, {useCallback, useEffect} from "react";
import {
    Button,
    Flex,
    Grid,
    GridItem,
    Heading,
    IconButton,
    ListItem, Menu,
    MenuButton, MenuGroup, MenuItem,
    MenuList,
    UnorderedList,
} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {EnergyIcon, InboxIcon, MembersIcon, SignatureIcon, UserIcon} from "@/icons";
import Router, {useRouter} from "next/router";
import {ArrowBackIcon, HamburgerIcon} from "@chakra-ui/icons";
import {getOrganizationMembers} from "@/redux/organizations/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {getAllProjectRules} from "@/redux/common-apis/action-reducer";


const tabMenu = [
    {
        title: 'My Account',
        children: [
            {
                title: 'Profile',
                route: '/settings/profile',
                icon: <UserIcon/>
            },
            {
                title: 'Signature',
                route: '/settings/signature',
                icon: <SignatureIcon/>
            },
            {
                title: 'Automation',
                route: '/settings/automation',
                icon: <EnergyIcon/>
            },
            {
                title: 'Email Address',
                route: '/settings/email-address',
                icon: <InboxIcon/>
            },
        ]
    },
    {
        title: 'Organization',
        children: [
            // {
            //     title: 'Approved Domains',
            //     route: '/settings/preferences',
            //     icon: <UserIcon/>
            // },
            /*
            {
                title: 'Billing',
                route: '/settings/billing'
            },
            */
            {
                title: 'Members',
                route: '/settings/members',
                icon: <MembersIcon/>
            },
        ]
    },
];

let currentRoute: string = '';

export default function SettingsLayout({children}: any) {
    const router = useRouter()
    const dispatch = useDispatch();
    const {organizations, members} = useSelector((state: StateType) => state.organizations);
    const {projectRules} = useSelector((state: StateType) => state.commonApis);

    useEffect(() => {
        const routePaths = router.pathname.split('/');
        if (routePaths[routePaths.length - 1] === 'settings') {
            currentRoute = '/settings/profile';
            Router.push('/settings/profile');
        } else {
            currentRoute = router.pathname;
        }
    }, [router.pathname]);

    const openTabs = useCallback((menuItem: { route: string; title: string }) => {
        currentRoute = menuItem.route;
        Router.push(menuItem.route);
    }, []);

    useEffect(() => {
        if (organizations && organizations.length > 0 && organizations[0].id) {
            if (members && members.length <= 0) {
                dispatch(getOrganizationMembers({body: {orgId: organizations[0].id}}));
            }
        }
    }, [dispatch, organizations])

    useEffect(() => {
        if (projectRules && projectRules.length <= 0) {
            dispatch(getAllProjectRules({}));
        }
    }, [dispatch])


    return (
        <>
            <div className={styles.setting}>
                <Grid className={styles.settingGrid} templateColumns='232px auto' gap={6} h={'100%'}
                      minHeight={'calc(100vh - 65px)'}>
                    <GridItem display={'flex'} className={styles.settingSideBar} flexDirection={'column'}>
                        <div className={styles.settingSideBarHeader}>
                            <Button className={styles.backButton} borderRadius={8} height={'auto'}
                                    marginBottom={'8px'} backgroundColor={'#FFFFFF'} padding={'4px 8px'}
                                    color={'#6B7280'} borderColor={'#6B7280'} w={'fit-content'}
                                    colorScheme='blue' variant='outline' fontSize={'14px'} ml={'-8px'}
                                    leftIcon={<ArrowBackIcon/>} onClick={() => router.push('/inbox')}>
                                Back To Inbox
                            </Button>
                            <Heading as='h4' mb={'20px'} className={styles.settingTitle}>
                                <span className={styles.settingTitleText}>Settings</span>
                                <Menu>
                                    <MenuButton
                                        className={styles.settingMenu}
                                        as={IconButton}
                                        aria-label='Options'
                                        icon={<HamburgerIcon/>}
                                        variant='outline'
                                        minWidth={'1px'} height={'auto'} padding={'7px'}
                                    />
                                    <MenuList className={'drop-down-list'}>
                                        {tabMenu.map((tab, index: number) => (
                                            <MenuGroup
                                                key={index}
                                                className={styles.settingListTitle} textTransform={'uppercase'}
                                                title={(<><UserIcon/> {tab.title}</>) as any}>
                                                {tab.children &&
                                                tab.children.map((item, i: number) => (
                                                    <MenuItem key={i + 1} onClick={() => openTabs(item)}
                                                              className={`${styles.settingMenuItem} ${currentRoute === item.route ? styles.active : ''}`}>{item.title}</MenuItem>
                                                ))}
                                            </MenuGroup>
                                        ))}
                                    </MenuList>
                                </Menu>
                            </Heading>
                        </div>

                        <div className={styles.settingItems}>
                            {tabMenu.map((tab, index: number) => (
                                <Flex direction={'column'} mb={8} key={index + 1}>
                                    <Heading display={'flex'} alignItems={'center'} mb={2} fontWeight={'600'} as='h5'
                                             fontSize={'11px'}
                                             className={styles.settingListTitle} textTransform={'uppercase'}>
                                        {tab.title}
                                    </Heading>
                                    {tab.children &&
                                    <UnorderedList display={'flex'} ml={'0'} className={styles.settingList}>
                                        {tab.children.map((item, i: number) => (
                                            <ListItem key={i + 1} onClick={() => openTabs(item)}
                                                      className={currentRoute === item.route ? styles.active : ''}>
                                                {item.icon}{item.title}
                                            </ListItem>
                                        ))}
                                    </UnorderedList>
                                    }
                                </Flex>
                            ))}
                        </div>
                    </GridItem>
                    <GridItem w='100%' overflow={'auto'}>
                        {children}
                    </GridItem>
                </Grid>
            </div>
        </>
    )
}
