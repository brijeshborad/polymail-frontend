import React, {useCallback, useEffect, useState} from "react";
import {Button, Flex, Grid, GridItem, Heading, ListItem, UnorderedList,} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {UserIcon} from "@/icons";
import Router, {useRouter} from "next/router";
import {ArrowBackIcon, ChevronDownIcon} from "@chakra-ui/icons";
import {getOrganizationMembers} from "@/redux/organizations/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {useWindowSize} from "@/hooks/window-resize.hook";


const tabMenu = [
    {
        title: 'My Account',
        children: [
            {
                title: 'Profile',
                route: '/settings/profile',
            },
            {
                title: 'Signature',
                route: '/settings/signature',
            },
            {
                title: 'Email Address',
                route: '/settings/email-address',
            },
        ],
    },
    {
        title: 'Organization',
        children: [
            {
                title: 'Approved Domains',
                route: '/settings/preferences',
            },
            /*
            {
                title: 'Billing',
                route: '/settings/billing'
            },
            */
            {
                title: 'Members',
                route: '/settings/members',
            },
        ],
    },
];

let currentRoute: string = '';

export default function SettingsLayout({children}: any) {
    const router = useRouter();
    const dispatch = useDispatch();
    const {organizations, members} = useSelector((state: StateType) => state.organizations);
    const [isMobileView, setIsMobileView] = useState(false);
    const [width] = useWindowSize();

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
    }, [dispatch, organizations]);

    useEffect(() => {
        if (width > 762) {
            setIsMobileView(false);
        } else {
            setIsMobileView(true);
        }
        // setAllowAutoSelect(width > 991);
        // commonService.setCommonState({allowThreadSelection: width > 991});
    }, [width]);

    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const MobileDropdown = ({tabMenu}: any) => {
        return (
            <div className={styles.mobileDropdown}>
                {isOpen && (
                    <>
                        {tabMenu.map((tab: any, index: number) => (
                            <Flex direction={'column'} mb={8} key={index + 1}>
                                <Heading display={'flex'} alignItems={'center'} mb={2} as="h5" size="sm"
                                         className={styles.settingListTitle} textTransform={'uppercase'}>
                                    <UserIcon/>
                                    {tab.title}
                                </Heading>
                                {tab.children && (
                                    <UnorderedList display={'flex'} gap={1} className={styles.settingList}>
                                        {tab.children.map((item: any, i: number) => (
                                            <ListItem key={i + 1} onClick={() => openTabs(item)}
                                                      className={currentRoute === item.route ? styles.active : ''}>
                                                {item.title}
                                            </ListItem>
                                        ))}
                                    </UnorderedList>
                                )}
                            </Flex>
                        ))}
                    </>
                )}
            </div>
        );
    };

    return (
        <>
            <div className={styles.setting}>
                <Grid templateColumns={`${isMobileView ? '-1px' : '232px'} auto`} gap={6} h={'100%'}
                      minHeight={'calc(100vh - 65px)'}>
                    <GridItem
                        display={'flex'}
                        w="100%"
                        className={styles.settingSideBar}
                        padding={'20px 30px 40px 40px'}
                        borderRight={'1px solid #E1E3E6'}
                        flexDirection={'column'}>
                        <Button
                            className={styles.backButton}
                            borderRadius={8}
                            height={'auto'}
                            padding={'5px 8px 5px 5px'}
                            marginBottom={'20px'}
                            backgroundColor={'#FFFFFF'}
                            color={'#6B7280'}
                            borderColor={'#6B7280'}
                            w={'fit-content'}
                            colorScheme="blue"
                            variant="outline"
                            fontSize={'14px'}
                            leftIcon={<ArrowBackIcon/>}
                            onClick={() => router.push('/inbox')}>
                            Back To Inbox
                        </Button>
                        <div>
                            <Heading as="h4" mb={8} className={styles.settingTitle} onClick={toggleDropdown}>
                                {' '}
                                Settings {isMobileView && <ChevronDownIcon/>}{' '}
                            </Heading>
                            {isMobileView && <MobileDropdown tabMenu={tabMenu}/>}

                            {!isMobileView && (
                                <>
                                    {tabMenu.map((tab, index: number) => (
                                        <Flex direction={'column'} mb={8} key={index + 1}>
                                            <Heading
                                                display={'flex'}
                                                alignItems={'center'}
                                                mb={2}
                                                as="h5"
                                                size="sm"
                                                className={styles.settingListTitle}
                                                textTransform={'uppercase'}>
                                                <UserIcon/>
                                                {tab.title}
                                            </Heading>
                                            {tab.children && (
                                                <UnorderedList display={'flex'} gap={1} className={styles.settingList}>
                                                    {tab.children.map((item, i: number) => (
                                                        <ListItem key={i + 1} onClick={() => openTabs(item)}
                                                                  className={currentRoute === item.route ? styles.active : ''}>
                                                            {item.title}
                                                        </ListItem>
                                                    ))}
                                                </UnorderedList>
                                            )}
                                        </Flex>
                                    ))}
                                </>
                            )}
                        </div>
                    </GridItem>
                    <GridItem w="100%">{children}</GridItem>
                </Grid>
            </div>
        </>
    );
}
