import React, {useCallback, useEffect} from "react";
import {Button, Flex, Grid, GridItem, Heading, ListItem, UnorderedList,} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {UserIcon} from "@/icons";
import Router, {useRouter} from "next/router";
import {ArrowBackIcon} from "@chakra-ui/icons";


const tabMenu = [
    {
        title: 'My Account',
        children: [
            {
                title: 'Profile',
                route: '/settings/profile'
            },
            {
                title: 'Signature',
                route: '/settings/signature'
            },
            {
                title: 'Email Address',
                route: '/settings/email-address'
            },
        ]
    },
    {
        title: 'Organization',
        children: [
            {
                title: 'Approved Domains',
                route: '/settings/preferences'
            },
            {
                title: 'Billing',
                route: '/settings/billing'
            },
            {
                title: 'Members',
                route: '/settings/members'
            },
        ]
    },
];

let currentRoute: string = '';

export default function SettingsLayout({children}: any) {
    const router = useRouter()

    useEffect(() => {
        const routePaths = router.pathname.split('/');
        if (routePaths[routePaths.length - 1] === 'settings') {
            currentRoute = '/settings/profile';
            Router.push('/settings/profile');
        } else {
            currentRoute = router.pathname;
        }
    }, [router.pathname]);


    const openTabs = useCallback((menuItem: { route: string, title: string }) => {
        currentRoute = menuItem.route;
        Router.push(menuItem.route);
    }, [])


    return (
        <>
            <div className={styles.setting}>
                <Grid templateColumns='232px auto' gap={6} h={'100%'} minHeight={'calc(100vh - 65px)'}>
                    <GridItem display={'flex'} w='100%' className={styles.settingSideBar}
                              padding={'40px 30px 40px 40px'}
                              borderRight={'1px solid #E1E3E6'} flexDirection={'column'}>
                        <Heading as='h4' mb={8} className={styles.settingTitle}> Settings </Heading>

                        {tabMenu.map((tab, index: number) => (
                            <Flex direction={'column'} mb={8} key={index + 1}>
                                <Heading display={'flex'} alignItems={'center'} mb={2} as='h5' size='sm'
                                         className={styles.settingListTitle} textTransform={'uppercase'}>
                                    <UserIcon/>{tab.title}
                                </Heading>
                                {tab.children &&
                                <UnorderedList display={'flex'} gap={1} className={styles.settingList}>
                                    {tab.children.map((item, i: number) => (
                                        <ListItem key={i + 1} onClick={() => openTabs(item)}
                                                  className={currentRoute === item.route ? styles.active : ''}>{item.title}</ListItem>
                                    ))}
                                </UnorderedList>
                                }
                            </Flex>
                        ))}
                        <Button className={styles.backButton} borderRadius={8} height={'auto'} padding={'5px 10px'}
                                mt={'auto'}
                                backgroundColor={'#FFFFFF'} color={'#374151'} borderColor={'#E5E7EB'} w={'fit-content'}
                                colorScheme='blue' variant='outline' fontSize={'14px'}
                                leftIcon={<ArrowBackIcon/>} onClick={() => router.back()}>
                            Go Back
                        </Button>
                    </GridItem>
                    <GridItem w='100%'>
                        {children}
                    </GridItem>
                </Grid>
            </div>
        </>
    )
}
