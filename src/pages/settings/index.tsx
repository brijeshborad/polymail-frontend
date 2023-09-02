import React, {useCallback, useEffect} from "react";
import {Flex, Heading, ListItem, UnorderedList,} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {UserIcon} from "@/icons";
import Router, {useRouter} from "next/router";

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
            {
                title: 'Billing',
                route: '/settings/billing'
            },

        ]
    },
    {
        title: 'Organization',
        children: [
            {
                title: 'Members',
                route: '/settings/members'
            },
            {
                title: 'Approved Domains',
                route: '/settings/preferences'
            }

        ]
    },
];
let currentRoute: string = '';
function Index() {
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

        </>
    )
}

export default Index;
